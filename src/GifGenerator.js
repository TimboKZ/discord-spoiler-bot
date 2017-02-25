/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot
 * @copyright 2017
 * @license MIT
 */

"use strict";

const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const GIFEncoder = require('gifencoder');

const GIF_WIDTH = 400;
const MARGIN = 10;
const LINE_WIDTH = GIF_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 40;
const MAX_LINES = 6;
const SPOILER_MESSAGE = 'Hover to reveal spoiler';
const GIF_PATH = path.join(__dirname, '..', 'gifs');
const FONT_PATH = path.join(__dirname, '..', 'fonts');

const SOURCE_SANS_PRO = new Canvas.Font('SourceSansPro', path.join(FONT_PATH, 'SourceSansPro-Regular.ttf'));

class GifGenerator {

    /**
     * @callback done
     * @param {string} filePath
     */

    /**
     * @param {SpoilerMessage} spoiler
     * @param {done} done
     * @return {string}
     */
    static createSpoilerGif(spoiler, done) {
        let hash = `${spoiler.author.id}-${(new Date()).getTime()}`;
        let gifPath = path.join(GIF_PATH, `${hash}.gif`);
        GifGenerator.createGif(spoiler, gifPath, done);
        return gifPath;
    }

    /**
     * @param {SpoilerMessage} spoiler
     * @param {string} filePath
     * @param {done} done
     */
    static createGif(spoiler, filePath, done) {
        let context = GifGenerator.createCanvasContext(15);
        let lines = GifGenerator.breakIntoLines(spoiler.content, context);
        console.log(lines);
        let height = (lines.length + 0.5) * LINE_HEIGHT / 2;
        context = GifGenerator.createCanvasContext(height);
        let encoder = GifGenerator.prepareEncoder(height, filePath, done);
        GifGenerator.clearContextBackground(context, height);
        GifGenerator.renderTextToContext(context, LINE_HEIGHT / 2, SPOILER_MESSAGE);
        encoder.addFrame(context);
        GifGenerator.clearContextBackground(context, height);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let marginTop = LINE_HEIGHT / 2 * (i + 1);
            GifGenerator.renderTextToContext(context, marginTop, line);
        }
        encoder.addFrame(context);
        encoder.finish();
    }

    /**
     * @param {string} text
     * @param {Context2d} context
     * @return {string[]}
     */
    static breakIntoLines(text, context) {
        let words = text.split(' ');
        let lines = [];
        let line = '';
        for (let i = 0; i < words.length; i++) {
            if (line !== '') line += ' ';
            let word = words[i];
            let max = Math.max(context.measureText(line).width, context.measureText(line + word).width);
            if (max > LINE_WIDTH) {
                lines.push(line);
                line = '';
            }
            line += word;
        }
        if(line !== '' || lines.length === 0) {
            lines.push(line);
        }
        if(lines.length > MAX_LINES) {
            lines = lines.slice(0, MAX_LINES);
            lines[lines.length - 1] += '...';
        }
        return lines;
    }

    /**
     * @param {number} height
     * @param {string} filePath
     * @param {done} done
     * @return {GIFEncoder}
     */
    static prepareEncoder(height, filePath, done) {
        let encoder = new GIFEncoder(GIF_WIDTH, height);
        let readStream = encoder.createReadStream();
        readStream.pipe(fs.createWriteStream(filePath));
        readStream.on('end', () => done(filePath));
        encoder.start();
        encoder.setRepeat(-1);
        encoder.setDelay(500);
        encoder.setQuality(10);
        return encoder;
    }

    /**
     * @param {number} height
     * @return {Context2d}
     */
    static createCanvasContext(height) {
        let canvas = new Canvas(GIF_WIDTH, height);
        let context = canvas.getContext('2d');
        context.addFont(SOURCE_SANS_PRO);
        context.font = '13px aSourceSansPro';
        return context;
    }

    static clearContextBackground(context, height) {
        context.fillStyle = '#3c3f44';
        context.rect(0, 0, GIF_WIDTH, height);
        context.fill();
    }

    /**
     *
     * @param {Context2d} context
     * @param {number} marginTop
     * @param {string} text
     */
    static renderTextToContext(context, marginTop, text) {
        context.fillStyle = '#c0ba9e';
        context.fillText(text, MARGIN, marginTop);
    }

}

module.exports = GifGenerator;
