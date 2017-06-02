/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot
 * @copyright 2017
 * @license MIT
 */

'use strict';

const fs = require('fs');
const lipsum = require('lorem-ipsum');
const assert = require('chai').assert;
const {describe, it} = require('mocha');
const GifGenerator = require('./../../src/GifGenerator');
const SpoilerBot = require('./../../src/SpoilerBot');

const defaultGifGen = new GifGenerator();

const createGif = (content, done) => {
    let spoiler = new SpoilerBot.Spoiler({id: 'test'}, 'Test Topic', content);
    defaultGifGen.createSpoilerGif(spoiler, 6, (filePath) => {
        assert.isTrue(fs.existsSync(filePath));
        if (!process.env.NO_DELETE) {
            fs.unlink(filePath, (err) => err ? console.error(`Could not remove GIF: ${err}`) : null);
        }
        done();
    });
};

const context = defaultGifGen.createCanvasContext(15);
const countLines = (content, lineCount) => {
    let lines = defaultGifGen.breakIntoLines(content, context, lineCount);
    assert.strictEqual(lines.length, lineCount);
};

describe('GifGenerator', () => {
    describe('#createSpoilerGif', () => {
        it('should create a GIF', (done) => {
            createGif('Test Content', done);
        });
        it('should properly create a multi-line GIF', (done) => {
            createGif('First line \n Second line', done);
        });
    });
    describe('#breakIntoLines', () => {
        it('should limit the amount of lines to the specified number', (done) => {
            let content = lipsum({count: 20, units: 'sentences'});
            countLines(content, 1);
            countLines(content, 6);
            countLines(content, 8);
            countLines('Line 1\nLine 2\nLine 3', 1);
            done();
        });
        it('should properly parse newline characters', (done) => {
            countLines('Line 1', 1);
            countLines('Line 1\nLine 2', 2);
            countLines('Line 1\nLine 2\nLine 3', 3);
            done();
        });
    });
});
