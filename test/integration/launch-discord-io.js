/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot/wiki
 * @copyright 2017
 * @license MIT
 */

const Discord = require('discord.io');
const SpoilerBot = require('../../src/SpoilerBot');
const config = require('./config');

let client = new Discord.Client({
    autorun: true,
    token: config.token
});

delete config.token;
config.client = client;

let bot = new SpoilerBot(config);
bot.connect();
