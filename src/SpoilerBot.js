/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot/wiki
 * @copyright 2017
 * @license MIT
 */

'use strict';

const fs = require('fs');
const Promise = require('bluebird');

const DiscordClient = require('./DiscordClient');
const GifGenerator = require('./GifGenerator');
const Util = require('./Util');

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
     * @param {Object} [config.gif]
     */
    constructor(config) {
        const throwErr = message => {
            throw new Error(message);
        };
        if (!config) {
            throwErr('No config has been specified!');
        }
        if (config.token === undefined && config.client === undefined) {
            throwErr('You need to specify `token` or `client` for this bot to work!');
        }
        if (config.token !== undefined && config.client !== undefined) {
            throwErr('You can\'t specify both `token` and `client`! Choose one.');
        }
        if (
            config.client !== undefined
            && !(DiscordClient.objectIsDiscordJS(config.client) || DiscordClient.objectIsDiscordIO(config.client))
        ) {
            throwErr('`client` must be an instance of discord.js or discord.io client!');
        }
        if (config.maxLines !== undefined && (typeof config.maxLines !== 'number' || config.maxLines < 1)) {
            throwErr('`maxLines` should be an integer greater than zero!');
        }
        if (config.include !== undefined && config.exclude !== undefined) {
            throwErr('You can\'t specify both included and excluded channels - choose one.');
        }
        if (config.extractSpoiler !== undefined && typeof config.extractSpoiler !== 'function') {
            throwErr('`extractFunction` must be a function!');
        }
        this.config = config;
        this.gifGenerator = new GifGenerator(this.config.gif);

        this.checkMarkPermission = this.checkMarkPermission.bind(this);
    }

    connect() {
        Promise.resolve()
            .then(() => this.client = new DiscordClient(this.config))
            .then(() => this.client.addMessageListener(this.processMessage.bind(this)))
            .then(() => this.client.loginIfNecessary())
            .then(() => this.client.setPresence('<1>:spoiler:<2>'))
            .then(() => Util.log('Discord Spoiler Bot is running!'))
            .catch(error => Util.error(error));
    }

    /**
     * @param {DiscordMessage} message
     */
    processMessage(message) {
        // Ignore bot's own messages, check if we're supposed to listen to the channel.
        if (message.authorId !== this.client.getBotId() && this.checkChannel(message.channelId)) {
            /** @type {Spoiler} */
            let spoiler;
            return Promise.resolve()
                .then(() => this.extractSpoiler(message, this.client.fetchMessage, this.checkMarkPermission))
                .then(_spoiler => {
                    // No spoiler extracted, do nothing
                    if (!_spoiler) return;

                    // Otherwise process the spoiler
                    spoiler = _spoiler;
                    return Promise.resolve()
                        .then(() => this.client.deleteMessage(message))
                        .then(() => {
                            // If trigger message is not the same as spoiler message (e.g. we marked someone else's
                            // message, we need to delete the spoiler message too.
                            if (message.id !== spoiler.message.id) {
                                return this.client.deleteMessage(spoiler.message);
                            }
                        })
                        .then(() => this.printSpoiler(message, spoiler))
                        .then(() => {
                            let topic = spoiler.topic ? `'${spoiler.topic}'` : 'untitled';
                            if (message.id === spoiler.message.id)
                                Util.log(`Processed ${topic} spoiler from ${message.authorName}.`);
                            else
                                Util.log(`${message.authorName} marked ${topic} spoiler by ${spoiler.message.authorName}.`);
                        });
                })
                .catch(error => this.sendErrorMessage(message, error));
        }

        return Promise.resolve(null);
    }

    /**
     * @param {string} channelId
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
     * @param {markCallback} callback deprecated: Used in legacy code
     * @return {Promise}
     */
    checkMarkPermission(channelId, userId, callback) {
        let promise = Promise.resolve()
            .then(() => {
                if (this.config.markAllowAll === true) {
                    return true;
                } else if (this.config.markUserIds !== undefined && this.config.markUserIds.indexOf(userId) !== -1) {
                    return true;
                } else if (this.config.markRoleIds !== undefined) {
                    return this.client.hasRoles(channelId, userId, this.config.markRoleIds);
                }
                return false;
            });

        // Handle legacy callback
        if (callback) {
            promise.then(canMark => callback(canMark))
                .catch(error => {
                    Util.error(error);
                    callback(false);
                });
        }

        return promise;
    }

    /**
     * @callback fetchMessageCallback
     * @param {DiscordMessage} message
     */

    /**
     * @callback fetchMessageLegacy
     * @param {string} channelId
     * @param {string} messageId
     * @param {fetchMessageCallback} callback
     * @return {DiscordMessage}
     */

    /**
     * @callback fetchMessage
     * @param {string} channelId
     * @param {string} messageId
     * @return {DiscordMessage}
     */

    /**
     * @callback checkMarkPermissionLegacy
     * @param {string} channelId
     * @param {string} userId
     * @param {markCallback} callback
     */

    /**
     * @callback checkMarkPermission
     * @param {string} channelId
     * @param {string} userId
     */

    /**
     * @callback spoilerCallback
     * @param {string|null} error
     * @param {Spoiler} [spoiler]
     */

    /**
     * @param {DiscordMessage} message
     * @param {fetchMessage|fetchMessageLegacy} fetchMessage
     * @param {checkMarkPermission|checkMarkPermissionLegacy} checkMarkPermission
     * @returns {Promise|PromiseLike}
     */
    extractSpoiler(message, fetchMessage, checkMarkPermission) {

        // Try user's custom spoiler extracting message (if any))
        if (this.config.extractSpoiler) {
            // In legacy version of the config, `extractSpoiler` used a callback of form (error, spoiler) as the last
            // argument. The new implementation uses promises, but we need to support the "old" approach too for
            // backwards compatibility.

            let potentialPromise;
            const legacyPromise = new Promise((resolve, reject) => {
                let callback = (error, spoiler) => error ? reject(error) : resolve(spoiler);

                // Record return value (if any)
                potentialPromise = this.config.extractSpoiler(message, fetchMessage, checkMarkPermission, callback);
            });

            // The original function returned a promise, so we're good.
            if (potentialPromise && potentialPromise.then !== undefined) return potentialPromise;

            // The original function used legacy callback system, return the wrapped version.
            return legacyPromise;
        }


        // Check if current message is a spoiler
        let selfSpoilerMatch = message.content.match(/(^.*):spoiler:(.+)$/);
        if (selfSpoilerMatch) {
            let topic = selfSpoilerMatch[1].trim();
            let content = selfSpoilerMatch[2];
            return Promise.resolve(new Spoiler(message, topic, content));
        }

        // Check if current message wants to mark a spoiler
        let spoilerMarkMatch = message.content.match(/^(.+):spoils:(.*)$/);
        if (spoilerMarkMatch) {
            let idOfMessageToMark = spoilerMarkMatch[1];
            let spoilerTopic = spoilerMarkMatch[2];
            return Promise.resolve()
                .then(() => checkMarkPermission(message.channelId, message.authorId))
                .then(canMark => {
                    if (canMark) {
                        return fetchMessage(message.channelId, idOfMessageToMark);
                    } else {
                        throw new Error('You don\'t have permission to mark spoilers.');
                    }
                })
                .then(spoilerMessage => new Spoiler(spoilerMessage, spoilerTopic, spoilerMessage.content));
        }

        // Not an "interesting message", do nothing
        return Promise.resolve(null);
    }

    /**
     * @param {DiscordMessage} originalMessage
     * @param {string|Error} error
     * @returns {Promise}
     */
    sendErrorMessage(originalMessage, error) {
        let errorMessage = typeof(error) === 'string' ? error : error.message;
        let messageContent = `<@${originalMessage.authorId}> ${errorMessage}`;
        return Promise.resolve()
            .then(() => this.client.sendMessage(originalMessage.channelId, messageContent))
            .then(() => {
                Util.log(`Sent error message to ${originalMessage.authorName}:`, error);
            })
            .catch(error => {
                Util.error('Failed to send error message to user (see below).');
                Util.error(error);
            });
    }

    /**
     * @param {DiscordMessage} originalMessage
     * @param {Spoiler} spoiler
     */
    printSpoiler(originalMessage, spoiler) {
        let messageContent = `<@${spoiler.message.authorId}>: `;
        messageContent += spoiler.topic ? `**${spoiler.topic}** spoiler` : 'Spoiler';
        if (originalMessage.id !== spoiler.message.id) {
            messageContent += ` (marked by <@${originalMessage.authorId}>)`;
        }
        let maxLines = this.config.maxLines ? this.config.maxLines : DEFAULT_MAX_LINES;
        this.gifGenerator.createSpoilerGif(spoiler, maxLines, filePath => {
            this.client.sendFile(spoiler.message.channelId, filePath, 'spoiler.gif', messageContent, () => {
                fs.unlink(filePath, (err) => err ? console.error(`Could not remove GIF: ${err}`) : null);
            });
        });
    }

}

SpoilerBot.Spoiler = Spoiler;

module.exports = SpoilerBot;
