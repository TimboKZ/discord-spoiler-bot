/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot/wiki
 * @copyright 2017
 * @license MIT
 */

'use strict';

const fs = require('fs');
const DiscordClient = require('./DiscordClient');
const GifGenerator = require('./GifGenerator');

const DEFAULT_MAX_LINES = 6;

class Spoiler {

    /**
     * @param {DiscordMessage} message
     * @param {string} topic
     * @param {string} content
     */
    constructor(message, topic, content) {
        this.message = message;
        this.topic = topic;
        this.content = content;
    }

}

class SpoilerBot {

    /**
     * @callback extractSpoiler
     * @param {DiscordMessage} message
     * @param {fetchMessage} fetchMessage
     * @param {checkMarkPermission} checkMarkPermission
     * @param {spoilerCallback} callback
     */

    /**
     * @param {Object} config
     * @param {string} [config.token]
     * @param {DiscordJS.Client|DiscordIO.Client} [config.client]
     * @param {boolean} [config.markAllowAll]
     * @param {string[]} [config.markRoleIds]
     * @param {string[]} [config.markUserIds]
     * @param {number} [config.maxLines]
     * @param {string[]} [config.include]
     * @param {string[]} [config.exclude]
     * @param {extractSpoiler} [config.extractSpoiler]
     */
    constructor(config) {
        if (!config) {
            throw new Error('No config has been specified!');
        }
        if (config.token === undefined && config.client === undefined) {
            throw new Error('You need to specify `token` or `client` for this but to work!');
        }
        if (config.token !== undefined && config.client !== undefined) {
            throw new Error('You ca\'t specify both `token` and `client`! Choose one.');
        }
        if (
            config.client !== undefined
            && !(DiscordClient.isDiscordJS(config.client) || DiscordClient.isDiscordIO(config.client))
        ) {
            throw new Error('`client` must be an instance of discord.js or discord.io client!');
        }
        if (config.maxLines !== undefined && (typeof config.maxLines !== 'number' || config.maxLines < 1)) {
            throw new Error('`maxLines` should be an integer greater than zero!');
        }
        if (config.include !== undefined && config.exclude !== undefined) {
            throw new Error('You can\'t specify both included and excluded channels - choose one.');
        }
        if (config.extractSpoiler !== undefined && typeof config.extractSpoiler !== 'function') {
            throw new Error('`extractFunction` must be a function!');
        }
        this.config = config;
    }

    connect() {
        this.client = new DiscordClient(this.config);
        this.client.addMessageListener(this.processMessage.bind(this));
        console.log('Discord Spoiler Bot is running...');
    }

    /**
     * @param {DiscordMessage} message
     */
    processMessage(message) {
        if (this.checkChannel(message.channelId)) {
            this.extractSpoiler(
                message,
                this.client.fetchMessage.bind(this.client),
                this.checkMarkPermission.bind(this),
                (error, spoiler) => {
                    if (error) {
                        this.printError(message, error);
                    } else if (spoiler) {
                        this.client.deleteMessage(message, () => {
                            this.client.deleteMessage(spoiler.message, () => {
                                this.printSpoiler(message, spoiler);
                            });
                        });
                    }
                }
            );
        }
    }

    /**
     * @param {number} channelId
     * @return {boolean}
     */
    checkChannel(channelId) {
        if (!this.config.include && !this.config.exclude) return true;
        if (this.config.include) return this.config.include.indexOf(channelId) !== -1;
        if (this.config.exclude) return this.config.exclude.indexOf(channelId) === -1;
        return false;
    }

    /**
     * @callback markCallback
     * @param {boolean} canMark
     */

    /**
     * @param {string} channelId
     * @param {string} userId
     * @param {markCallback} callback
     * @return {boolean}
     */
    checkMarkPermission(channelId, userId, callback) {
        if (this.config.markAllowAll === true) {
            callback(true);
        } else if (this.config.markUserIds !== undefined && this.config.markUserIds.indexOf(userId) !== -1) {
            callback(true);
        } else if (this.config.markRoleIds !== undefined) {
            this.client.hasRoles(channelId, userId, this.config.markRoleIds, callback);
        } else {
            callback(false);
        }
    }

    /**
     * @callback fetchMessageCallback
     * @param {DiscordMessage} message
     */

    /**
     * @callback fetchMessage
     * @param {string} channelId
     * @param {string} messageId
     * @param {fetchMessageCallback} callback
     * @return {DiscordMessage}
     */

    /**
     * @callback checkMarkPermission
     * @param {string} channelId
     * @param {string} userId
     * @param {markCallback} callback
     */

    /**
     * @callback spoilerCallback
     * @param {string|null} error
     * @param {Spoiler} [spoiler]
     */

    /**
     * @param {DiscordMessage} message
     * @param {fetchMessage} fetchMessage
     * @param {checkMarkPermission} checkMarkPermission
     * @param {spoilerCallback} callback
     */
    extractSpoiler(message, fetchMessage, checkMarkPermission, callback) {
        if (this.config.extractSpoiler) {
            this.config.extractSpoiler(message, fetchMessage, callback);
        } else if (message.content.match(/^.+:spoiler:.+$/)) {
            let parts = message.content.split(':spoiler:');
            callback(null, new Spoiler(message, parts[0], parts[1]));
        } else if (message.content.match(/^.+:spoils:.+$/)) {
            let parts = message.content.split(':spoils:');
            checkMarkPermission(message.channelId, message.authorId, (canMark) => {
                if (canMark) {
                    fetchMessage(message.channelId, parts[0], spoilerMessage => {
                        let topic = parts[1];
                        callback(null, new Spoiler(spoilerMessage, topic, spoilerMessage.content));
                    });
                } else {
                    callback('You don\'t have permission to mark spoilers.');
                }
            });
        } else {
            callback(null, null);
        }
    }

    /**
     * @param {DiscordMessage} originalMessage
     * @param {string} error
     */
    printError(originalMessage, error) {
        let messageContent = `<@${originalMessage.authorId}> ${error}`;
        this.client.sendMessage(originalMessage.channelId, messageContent, () => null);
    }

    /**
     * @param {DiscordMessage} originalMessage
     * @param {Spoiler} spoiler
     */
    printSpoiler(originalMessage, spoiler) {
        let messageContent = `<@${spoiler.message.authorId}>: **${spoiler.topic}** spoiler`;
        if (originalMessage.id !== spoiler.message.id) {
            messageContent += ` (marked by <@${originalMessage.authorId}>)`;
        }
        let maxLines = this.config.maxLines ? this.config.maxLines : DEFAULT_MAX_LINES;
        GifGenerator.createSpoilerGif(spoiler, maxLines, filePath => {
            this.client.sendFile(spoiler.message.channelId, filePath, 'spoiler.gif', messageContent, () => {
                fs.unlink(filePath, (err) => err ? console.error(`Could not remove GIF: ${err}`) : null);
            });
        });
    }

}

SpoilerBot.Spoiler = Spoiler;

module.exports = SpoilerBot;
