/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot
 * @copyright 2017
 * @license MIT
 */

'use strict';

const fs = require('fs');
const DiscordJS = require('discord.js');
const DiscordIO = require('discord.io');
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
     * @param {Discord.Message} message
     * @return {Spoiler}
     */

    /**
     * @param {Object} config
     * @param {DiscordJS.Client|DiscordIO.Client} [config.client]
     * @param {string} [config.token]
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
            && !(config.client instanceof DiscordJS.Client || config.client instanceof DiscordIO.Client)
        ) {
            throw new Error('`client` must be an instance of Discord.js or discord.io client!');
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
            let spoiler = this.extractSpoiler(message);
            if (spoiler) {
                this.client.deleteMessage(spoiler.message, () => {
                    this.printSpoiler(message, spoiler);
                });
            }
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
     * @param {DiscordMessage} message
     * @return {Spoiler}
     */
    extractSpoiler(message) {
        if (this.config.extractSpoiler) {
            return this.config.extractSpoiler(message);
        }
        if (!message.content.match(/^.+:spoiler:.+$/)) return null;
        let parts = message.content.split(':spoiler:');
        return new Spoiler(message, parts[0], parts[1]);
    }

    /**
     * @param {DiscordMessage} originalMessage
     * @param {Spoiler} spoiler
     */
    printSpoiler(originalMessage, spoiler) {
        let messageContent = `<@${spoiler.message.authorId}>: **${spoiler.topic}** spoiler`;
        if (originalMessage.authorId !== spoiler.message.authorId) {
            messageContent += ` (marked by <@${originalMessage.authorId}>)`;
        }
        let maxLines = this.config.maxLines ? this.config.maxLines : DEFAULT_MAX_LINES;
        GifGenerator.createSpoilerGif(spoiler, maxLines, filePath => {
            this.client.sendFile(spoiler.message.channelId, filePath, 'spoiler.gif', messageContent, () => {
                fs.unlink(filePath);
            });
        });
    }

}

SpoilerBot.Spoiler = Spoiler;

module.exports = SpoilerBot;
