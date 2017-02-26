/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot
 * @copyright 2017
 * @license MIT
 */

'use strict';

const SpoilerBot = require('./../../src/SpoilerBot');
const DiscordJS = require('discord.js');
const DiscordIO = require('discord.io');
const {describe, it} = require('mocha');
const assert = require('chai').assert;

describe('SpoilerBot config', () => {
    describe('config', () => {
        it('should throw error on no config', () => {
            assert.throws(() => new SpoilerBot(), /no config/i);
        });
    });
    describe('token', () => {
        it('should succeed when token is present', () => {
            let config = {
                token: '123456'
            };
            assert.doesNotThrow(() => new SpoilerBot(config));
        });
        it('should throw error on missing token', () => {
            assert.throws(() => new SpoilerBot({}), /`token` or `client`/i);
        });
        it('should throw error when specified with client', () => {
            let config = {
                token: '123456',
                client: {}
            };
            assert.throw(() => new SpoilerBot(config), /both `token` and `client`/i);
        });
    });
    describe('client', () => {
        it('should succeed when DiscordJS client is present', () => {
            let client = new DiscordJS.Client();
            let config = {
                client: client
            };
            assert.doesNotThrow(() => new SpoilerBot(config));
        });
        it('should succeed when DiscordIO client is present', () => {
            let client = new DiscordIO.Client({ token: '123' });
            let config = {
                client: client
            };
            assert.doesNotThrow(() => new SpoilerBot(config));
        });
        it('should throw error on invalid client object', () => {
            let config = {
                client: {}
            };
            assert.throws(() => new SpoilerBot(config), /instance of discord.js or discord.io/i);
        });
    });
    describe('maxLines', () => {
        it('should throw error on negative max lines', () => {
            let config = {
                token: '123456',
                maxLines: -100
            };
            assert.throws(() => new SpoilerBot(config), /`maxLines` should be an integer/i);
        });
        it('should throw error when max lines is not a number', () => {
            let config = {
                token: '123456',
                maxLines: '5'
            };
            assert.throws(() => new SpoilerBot(config), /`maxLines` should be an integer/i);
        });
    });
    describe('include, exclude', () => {
        it('should throw error on include and exclude', () => {
            let config = {
                token: '123456',
                include: [],
                exclude: [],
            };
            assert.throws(() => new SpoilerBot(config), /you can't specify both/i);
        });
    });
    describe('extractSpoiler', () => {
        it('should throw error when extractSpoiler is not a function', () => {
            let config = {
                token: '123456',
                extractSpoiler: ''
            };
            assert.throws(() => new SpoilerBot(config), /must be a function/i);
        });
    });
});
