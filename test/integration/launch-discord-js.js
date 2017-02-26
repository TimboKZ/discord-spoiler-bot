/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license MIT
 */

const Discord = require('discord.js');
const SpoilerBot = require('../../src/SpoilerBot');
const config = require('./config');

let client = new Discord.Client();
client.login(config.token);

delete config.token;
config.client = client;

let bot = new SpoilerBot(config);
bot.connect();
