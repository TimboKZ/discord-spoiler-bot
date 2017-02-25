/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot
 * @copyright 2017
 * @license MIT
 */

"use strict";

const fs = require('fs');
const Discord = require('discord.js');
const GifGenerator = require('./GifGenerator');

class SpoilerMessage {

    /**
     * @param {Discord.User} author
     * @param {string} topic
     * @param {string} content
     */
    constructor(author, topic, content) {
        this.author = author;
        this.topic = topic;
        this.content = content;
    }

}

class SpoilerBot {

    /**
     * @callback extractSpoiler
     * @param {Discord.Message} message
     * @return {SpoilerMessage}
     */

    /**
     * @param {Object} config
     * @param {string} config.token
     * @param {string[]} [config.include]
     * @param {string[]} [config.exclude]
     * @param {extractSpoiler} [config.extractSpoiler]
     */
    constructor(config) {
        if (!config || !config.token) {
            throw new Error('No bot token has been specified!');
        }
        if (config.include && config.exclude) {
            throw new Error('You can\'t specify both included and excluded channels - choose one.');
        }
        if (config.extractSpoiler && typeof config.extractSpoiler !== 'function') {
            throw new Error('`extractFunction` must be a function!');
        }
        this.config = config;
    }

    connect() {
        this.client = new Discord.Client();
        this.client.on('message', this.processMessage.bind(this));
        this.client.login(this.config.token);
    }

    /**
     * @param {Discord.Message} message
     */
    processMessage(message) {
        if (this.checkChannel(message.channel)) {
            let spoiler = this.extractSpoiler(message);
            if(spoiler) {
                message.delete();
                this.printSpoiler(message, spoiler);
            }
        }
    }

    /**
     * @param {Discord.Channel} channel
     * @return {boolean}
     */
    checkChannel(channel) {
        if (!this.config.include && !this.config.exclude) return true;
        if (this.config.include) return this.config.include.indexOf(channel.id) !== -1;
        if (this.config.exclude) return this.config.exclude.indexOf(channel.id) === -1;
        return false;
    }

    /**
     * @param {Discord.Message} message
     * @return {SpoilerMessage}
     */
    extractSpoiler(message) {
        if (this.config.extractSpoiler) {
            return this.config.extractSpoiler(message);
        }
        if (!message.content.match(/^.+:spoiler:.+$/)) return null;
        let parts = message.content.split(':spoiler:');
        return new SpoilerMessage(message.author, parts[0], parts[1]);
    }

    /**
     * @param {Discord.Message} originalMessage
     * @param {SpoilerMessage} spoiler
     */
    printSpoiler(originalMessage, spoiler) {
        let messageContent = `**${spoiler.topic}** spoiler from <@${spoiler.author.id}>`;
        let filePath = GifGenerator.createSpoilerGif(spoiler);
        originalMessage.channel.sendFile(filePath, 'spoiler.gif', messageContent).then(() => {
            fs.unlink(filePath);
        });
    }

}

module.exports = SpoilerBot;
