/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot/wiki
 * @copyright 2017
 * @license MIT
 */

const Promise = require('bluebird');
const DiscordJS = require('discord.js');

const Util = require('./Util');

const DISCORD_JS = 'discord.js';
const DISCORD_IO = 'discord.io';

class DiscordMessage {

    /**
     * @param {object} data
     * @param {string} data.id
     * @param {string} data.channelId
     * @param {string} data.authorId
     * @param {string} data.authorName
     * @param {string} data.content
     */
    constructor(data) {
        this.id = data.id;
        this.channelId = data.channelId;
        this.authorId = data.authorId;
        this.authorName = data.authorName;
        this.content = data.content;
    }

}

class DiscordClient {

    /**
     * @param {Object} config
     * @param {DiscordJS.Client|DiscordIO.Client} config.client
     * @param {string} config.token
     */
    constructor(config) {
        this.token = config.token;
        this.client = config.client;
        this.externalClient = true;
        if (config.token) {
            this.client = new DiscordJS.Client();
            this.externalClient = false;
        }
        this.type = DiscordClient.objectIsDiscordJS(this.client) ? DISCORD_JS : DISCORD_IO;

        this.fetchMessage = this.fetchMessage.bind(this);
    }

    loginIfNecessary() {
        if (this.externalClient) return Promise.resolve();
        if (this.type !== DISCORD_JS) return Promise.reject(new Error('Bad Discord client type!'));
        return this.client.login(this.token);
    }

    /**
     * @param {Object} client
     * @return {boolean}
     */
    static objectIsDiscordJS(client) {
        let checks = true;
        checks = checks && typeof client.fetchUser === 'function';
        checks = checks && typeof client.login === 'function';
        checks = checks && typeof client.sweepMessages === 'function';
        checks = checks && typeof client.syncGuilds === 'function';
        checks = checks && typeof client.on === 'function';
        return checks;
    }

    /**
     * @param {Object} client
     * @return {boolean}
     */
    static objectIsDiscordIO(client) {
        let checks = true;
        checks = checks && typeof client.connect === 'function';
        checks = checks && typeof client.disconnect === 'function';
        checks = checks && typeof client.sendMessage === 'function';
        checks = checks && typeof client.uploadFile === 'function';
        checks = checks && typeof client.on === 'function';
        return checks;
    }

    /**
     * @callback messageListener
     * @param {DiscordMessage} message
     */

    /**
     * @param {messageListener} listener
     */
    addMessageListener(listener) {
        if (this.isDiscordJs()) {
            this.client.on('message', DiscordClient.processDiscordJSMessage.bind(null, listener));
        } else {
            this.client.on('message', DiscordClient.processDiscordIOMessage.bind(null, listener));
        }
    }

    /**
     * @param {messageListener} listener
     * @param {DiscordJS.Message} message
     */
    static processDiscordJSMessage(listener, message) {
        listener(new DiscordMessage({
            id: message.id,
            channelId: message.channel.id,
            authorId: message.author.id,
            authorName: message.author.username,
            content: message.content,
        }));
    }

    /**
     * @param {messageListener} listener
     * @param {string} user
     * @param {string} userID
     * @param {string} channelID
     * @param {string} message
     * @param {Object} event
     */
    static processDiscordIOMessage(listener, user, userID, channelID, message, event) {
        listener(new DiscordMessage({
            id: event.d.id,
            channelId: channelID,
            authorId: userID,
            authorName: user,
            content: message,
        }));
    }

    isDiscordJs() {
        return this.type === DISCORD_JS;
    }

    /**
     * @returns {string}
     */
    getBotId() {
        if (this.isDiscordJs()) {
            return this.client.user.id;
        } else {
            return this.client.id;
        }
    }

    /**
     * @param message
     * @returns {Promise<ClientUser>}
     */
    setPresence(message) {
        if (this.type === DISCORD_JS) {
            return this.client.user.setPresence({game: {name: message, type: 'LISTENING'}});
        } else {
            return Promise.resolve()
                .then(() => this.client.setPresence({game: message, type: 1}));
        }
    }

    /**
     * @param {string} channelId
     * @param {string} messageId
     * @param {messageListener} callback deprecated: Used in legacy code
     * @returns {Promise}
     */
    fetchMessage(channelId, messageId, callback) {
        let promise;
        if (this.type === DISCORD_JS) {
            promise = Promise.resolve()
                .then(() => this.client.channels.get(channelId).fetchMessage(messageId))
                .then((message) => new DiscordMessage({
                    id: message.id,
                    channelId: message.channel.id,
                    authorId: message.author.id,
                    authorName: message.author.username,
                    content: message.content,
                }));
        } else {
            promise = new Promise((resolve, reject) => {
                this.client.getMessage({channelID: channelId, messageID: messageId}, (error, message) => {
                    if (error) return reject(error);
                    resolve(new DiscordMessage({
                        id: message.id,
                        channelId: message.channel_id,
                        authorId: message.author.id,
                        authorName: message.author.username,
                        content: message.content,
                    }));
                });
            });
        }

        // Handle legacy callback
        if (callback) {
            promise
                .then(message => callback(message))
                .catch(error => {
                    Util.error(error);
                    callback(null);
                });
        }

        return promise;
    }

    /**
     * @param {DiscordMessage} message
     * @returns {Promise|PromiseLike}
     */
    deleteMessage(message) {
        if (arguments.length > 1)
            return Promise.reject(new Error('`done` parameter was deprecated, use promises instead!'));

        if (this.type === DISCORD_JS) {
            return Promise.resolve()
                .then(() => this.client.channels.get(message.channelId).fetchMessage(message.id))
                .then((message) => message.delete());
        } else {
            return new Promise((resolve, reject) => {
                const callback = error => error ? reject(error) : resolve();
                this.client.deleteMessage({
                    channelID: message.channelId,
                    messageID: message.id
                }, callback);
            });
        }
    }

    /**
     * @param {string} channelId
     * @param {string} userId
     * @param {string[]} roleIds
     * @returns {Promise}
     */
    hasRoles(channelId, userId, roleIds) {
        let roles = null;
        if (this.type === DISCORD_JS) {
            let channel = this.client.channels.get(channelId);
            roles = channel.guild.members.get(userId).roles.keyArray();
        } else {
            let guildId = this.client.channels[channelId].guild_id;
            roles = this.client.servers[guildId].members[userId].roles;
        }
        let result = false;
        for (let i = 0; i < roles.length; i++) {
            if (roleIds.indexOf(roles[i]) !== -1) {
                result = true;
                break;
            }
        }
        return Promise.resolve(result);
    }

    /**
     * @param {string} channelId
     * @param {string} content
     * @returns {Promise}
     */
    sendMessage(channelId, content) {
        if (this.type === DISCORD_JS) {
            return this.client.channels.get(channelId).send(content);
        } else {
            let options = {
                to: channelId,
                message: content,
            };
            return new Promise((resolve, reject) => {
                const callback = (error, response) => error ? reject(error) : resolve(response);
                this.client.sendMessage(options, callback);
            });
        }
    }

    /**
     * @param {string} channelId
     * @param {string} filePath
     * @param {string} fileName
     * @param {string} content
     * @param {function} done
     */
    sendFile(channelId, filePath, fileName, content, done) {
        if (this.type === DISCORD_JS) {
            let channel = this.client.channels.get(channelId);
            let options = {
                files: [{
                    attachment: filePath,
                    name: fileName,
                }],
            };
            channel.send(content, options)
                .then(() => done())
                .catch(error => Util.error('Error sending file:', error));
        } else {
            let options = {
                to: channelId,
                file: filePath,
                filename: fileName,
                message: content,
            };
            this.client.uploadFile(options, done);
        }
    }

}

DiscordClient.DiscordMessage = DiscordMessage;

module.exports = DiscordClient;
