/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license MIT
 */

"use strict";

const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const GIFEncoder = require('gifencoder');

const SPOILER_MESSAGE = 'Hover to reveal spoiler';
const GIF_PATH = path.join(__dirname, '..', 'gifs');
const FONT_PATH = path.join(__dirname, '..', 'fonts');

const SOURCE_SANS_PRO = new Canvas.Font('SourceSansPro', path.join(FONT_PATH, 'SourceSansPro-Regular.ttf'));

class GifGenerator {

    /**
     * @param {SpoilerMessage} spoiler
     * @return {string}
     */
    static createSpoilerGif(spoiler) {
        let hash = `${spoiler.author.id}-${(new Date()).getTime()}`;
        let gifPath = path.join(GIF_PATH, `${hash}.gif`);
        GifGenerator.createGif(spoiler, gifPath);
        return gifPath;
    }

    /**
     * @param {SpoilerMessage} spoiler
     * @param {string} filePath
     */
    static createGif(spoiler, filePath) {
        let width = 400;
        let height = 50;
        let encoder = GifGenerator.prepareEncoder(width, height, filePath);
        let context = GifGenerator.createCanvasContext(width, height);
        GifGenerator.renderTextToContext(context, width, height, SPOILER_MESSAGE);
        encoder.addFrame(context);
        GifGenerator.renderTextToContext(context, width, height, spoiler.content);
        encoder.addFrame(context);
        encoder.finish();
    }

    /**
     * @param {number} width
     * @param {number} height
     * @param {string} filePath
     * @return {GIFEncoder}
     */
    static prepareEncoder(width, height, filePath) {
        let encoder = new GIFEncoder(width, height);
        encoder.createReadStream().pipe(fs.createWriteStream(filePath));
        encoder.start();
        encoder.setRepeat(-1);
        encoder.setDelay(500);
        encoder.setQuality(10);
        return encoder;
    }

    /**
     * @param {number} width
     * @param {number} height
     * @return {Context2d}
     */
    static createCanvasContext(width, height) {
        let canvas = new Canvas(width, height);
        let context = canvas.getContext('2d');
        context.addFont(SOURCE_SANS_PRO);
        context.font = '18px aSourceSansPro';
        return context;
    }

    /**
     *
     * @param {Context2d} context
     * @param {number} width
     * @param {number} height
     * @param {string} text
     */
    static renderTextToContext(context, width, height, text) {
        context.fillStyle = '#36393e';
        context.rect(0, 0, width, height);
        context.fill();
        context.fillStyle = '#c0ba9e';
        context.fillText(text, 10, 30);
    }

}

module.exports = GifGenerator;
