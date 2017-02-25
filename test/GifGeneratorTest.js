/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot
 * @copyright 2017
 * @license MIT
 */

'use strict';

const GifGenerator = require('./../src/GifGenerator');
const SpoilerBot = require('./../src/SpoilerBot');
const {describe, it} = require('mocha');
const assert = require('chai').assert;
const fs = require('fs');

describe('GifGenerator', () => {
    describe('#createSpoilerGif', () => {
        it('should create a GIF', (done) => {
            let spoiler = new SpoilerBot.Spoiler({id: 'test'}, 'Test Topic', 'Test Content');
            GifGenerator.createSpoilerGif(spoiler, 6, (filePath) => {
                assert.isTrue(fs.existsSync(filePath));
                fs.unlink(filePath);
                done();
            });
        });
    });
});