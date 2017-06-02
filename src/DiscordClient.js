/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot/wiki
 * @copyright 2017
 * @license MIT
 */

const DiscordJS = require('discord.js');

const DISCORD_JS = 'discord.js';
const DISCORD_IO = 'discord.io';

class DiscordMessage {

    /**
     * @param {string} id
     * @param {string} channelId
     * @param {string} authorId
     * @param {string} content
     */
    constructor(id, channelId, authorId, content) {
        this.id = id;
        this.channelId = channelId;
        this.authorId = authorId;
        this.content = content;
    }

}

class DiscordClient {

    /**
     * @param {Object} config
     * @param {DiscordJS.Client|DiscordIO.Client} config.client
     * @param {string} config.token
     */
    constructor(config) {
        let client = config.client;
        if (config.token) {
            client = new DiscordJS.Client();
            client.login(config.token);
        }
        this.type = DiscordClient.isDiscordJS(client) ? DISCORD_JS : DISCORD_IO;
        this.client = client;
    }

    /**
     * @param {Object} client
     * @return {boolean}
     */
    static isDiscordJS(client) {
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
    static isDiscordIO(client) {
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
        if (this.type === DISCORD_JS) {
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
        listener(new DiscordMessage(
            message.id,
            message.channel.id,
            message.author.id,
            message.content
        ));
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
        listener(new DiscordMessage(
            event.d.id,
            channelID,
            userID,
            message
        ));
    }

    /**
     * @param {string} channelId
     * @param {string} messageId
     * @param {messageListener} callback
     */
    fetchMessage(channelId, messageId, callback) {
        if (this.type === DISCORD_JS) {
            this.client.channels.get(channelId).fetchMessage(messageId).then((message) => {
                callback(new DiscordMessage(message.id, message.channel.id, message.author.id, message.content));
            });
        } else {
            this.client.getMessage({
                channelID: channelId,
                messageID: messageId
            }, (error, message) => {
                callback(new DiscordMessage(message.id, message.channel_id, message.author.id, message.content));
            });
        }
    }

    /**
     * @param {DiscordMessage} message
     * @param {function} done
     */
    deleteMessage(message, done) {
        if (this.type === DISCORD_JS) {
            this.client.channels.get(message.channelId).fetchMessage(message.id).then((message) => {
                message.delete();
                done();
            });
        } else {
            this.client.deleteMessage({
                channelID: message.channelId,
                messageID: message.id
            }, done);
        }
    }

    /**
     * @param {string} channelId
     * @param {string} userId
     * @param {string[]} roleIds
     * @param {markCallback} callback
     */
    hasRoles(channelId, userId, roleIds, callback) {
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
        callback(result);
    }

    /**
     * @param {string} channelId
     * @param {string} content
     * @param {function} done
     */
    sendMessage(channelId, content, done) {
        if (this.type === DISCORD_JS) {
            this.client.channels.get(channelId).send(content).then(() => done());
        } else {
            let options = {
                to: channelId,
                message: content,
            };
            this.client.sendMessage(options, done);
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
                .catch(error => console.log(`Error sending file: ${error}`));
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
