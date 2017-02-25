/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot
 * @copyright 2017
 * @license MIT
 */

'use strict';

const SpoilerBot = require('./../src/SpoilerBot');
const {describe, it} = require('mocha');
const assert = require('chai').assert;

describe('SpoilerBot config', () => {
    describe('token', () => {
        it('should succeed when token is present', () => {
            let config = {
                token: '123456'
            };
            assert.doesNotThrow(() => new SpoilerBot(config));
        });
        it('should throw error on no config', () => {
            assert.throws(() => new SpoilerBot(), /no bot token/i);
        });
        it('should throw error on missing token', () => {
            assert.throws(() => new SpoilerBot({}), /no bot token/i);
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
