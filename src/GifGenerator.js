/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/discord-spoiler-bot/wiki
 * @copyright 2017
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const Font = Canvas.Font;
const GIFEncoder = require('gifencoder');

const BACKGROUND_COLOUR = '#3c3f44';
const STROKE_COLOUR = '#b2ac94';
const TEXT_COLOUR = '#c0ba9e';
const SPOILER_MESSAGE_COLOUR = '#8c8775';

const MARGIN = 10;
const GIF_WIDTH = 400;
const LINE_HEIGHT = 40;
const LINE_WIDTH = GIF_WIDTH - MARGIN * 2;
const SPOILER_MESSAGE = '( Hover to reveal spoiler )';

const GIF_PATH = path.join(__dirname, '..', 'gifs');
const FONT_PATH = path.join(__dirname, '..', 'fonts');
const SOURCE_SANS_PRO = Font ? new Font('SourceSansPro', path.join(FONT_PATH, 'SourceSansPro-Regular.ttf')) : null;

class GifGenerator {

    /**
     * @callback done
     * @param {string} filePath
     */

    /**
     * @param {Spoiler} spoiler
     * @param {number} maxLines
     * @param {done} done
     * @return {string}
     */
    static createSpoilerGif(spoiler, maxLines, done) {
        let hash = `${spoiler.authorId}-${(new Date()).getTime()}`;
        let gifPath = path.join(GIF_PATH, `${hash}.gif`);
        GifGenerator.createGif(spoiler, maxLines, gifPath, done);
        return gifPath;
    }

    /**
     * @param {Spoiler} spoiler
     * @param {number} maxLines
     * @param {string} filePath
     * @param {done} done
     */
    static createGif(spoiler, maxLines, filePath, done) {
        let lines = GifGenerator.prepareLines(spoiler, maxLines);
        let height = (lines.length + 0.5) * LINE_HEIGHT / 2;
        let context = GifGenerator.createCanvasContext(height);
        let encoder = GifGenerator.prepareEncoder(height, filePath, done);
        GifGenerator.renderSpoilerMessage(context, encoder, height);
        GifGenerator.renderLines(context, encoder, height, lines);
        encoder.finish();
    }

    /**
     * @param {Spoiler} spoiler
     * @param {number} maxLines
     * @return {string[]}
     */
    static prepareLines(spoiler, maxLines) {
        let context = GifGenerator.createCanvasContext(15);
        return GifGenerator.breakIntoLines(spoiler.content, context, maxLines);
    }

    /**
     * @param {string} text
     * @param {Context2d} context
     * @param {number} maxLines
     * @return {string[]}
     */
    static breakIntoLines(text, context, maxLines) {
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
        if(lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
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
        let writeStream = fs.createWriteStream(filePath);
        readStream.pipe(writeStream);
        writeStream.on('close', () => done(filePath));
        encoder.start();
        encoder.setRepeat(-1);
        encoder.setDelay(500);
        encoder.setQuality(10);
        return encoder;
    }

    /**
     * @param {Context2d} context
     * @param {GIFEncoder} encoder
     * @param {number} height
     */
    static renderSpoilerMessage(context, encoder, height) {
        GifGenerator.clearContextBackground(context, height);
        GifGenerator.renderTextToContext(context, LINE_HEIGHT / 2, SPOILER_MESSAGE, SPOILER_MESSAGE_COLOUR);
        encoder.addFrame(context);
    }

    /**
     * @param {Context2d} context
     * @param {GIFEncoder} encoder
     * @param {number} height
     * @param {string[]} lines
     */
    static renderLines(context, encoder, height, lines) {
        GifGenerator.clearContextBackground(context, height);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let marginTop = LINE_HEIGHT / 2 * (i + 1);
            GifGenerator.renderTextToContext(context, marginTop, line, TEXT_COLOUR);
        }
        encoder.addFrame(context);
    }

    /**
     * @param {number} height
     * @return {Context2d}
     */
    static createCanvasContext(height) {
        let canvas = new Canvas(GIF_WIDTH, height);
        let context = canvas.getContext('2d');
        if(SOURCE_SANS_PRO !== null) {
            context.addFont(SOURCE_SANS_PRO);
        }
        let fontName = SOURCE_SANS_PRO !== null ? 'aSourceSansPro' : '"Lucida Sans Unicode"';
        context.font = `13px ${fontName}`;
        return context;
    }

    /**
     * @param {Context2d} context
     * @param {number} height
     */
    static clearContextBackground(context, height) {
        context.fillStyle = BACKGROUND_COLOUR;
        context.strokeStyle = STROKE_COLOUR;
        context.rect(0, 0, GIF_WIDTH, height);
        context.fill();
        context.stroke();
    }

    /**
     *
     * @param {Context2d} context
     * @param {number} marginTop
     * @param {string} text
     * @param {string} colour
     */
    static renderTextToContext(context, marginTop, text, colour) {
        context.fillStyle = colour;
        context.fillText(text, MARGIN, marginTop);
    }

}

module.exports = GifGenerator;
