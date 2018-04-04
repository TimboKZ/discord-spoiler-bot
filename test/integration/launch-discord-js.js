/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot/wiki
 * @copyright 2017
 * @license MIT
 */

const Discord = require('discord.js');
const SpoilerBot = require('../../src/SpoilerBot');
const config = require('./config');

let token = config.token;
delete config.token;

let client = new Discord.Client();
config.client = client;
let bot = new SpoilerBot(config);

client.login(token)
    .then(() => bot.connect())
    .catch(console.error);
