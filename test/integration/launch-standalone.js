/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license MIT
 */

const SpoilerBot = require('../../src/SpoilerBot');
const config = require('./config');

let bot = new SpoilerBot(config);
bot.connect();
