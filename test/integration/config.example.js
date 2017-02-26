/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license MIT
 */

module.exports = {
    token: 'your_bot_token_here',
    maxLines: 6,
    exclude: [],

    extractSpoiler: (message) => {
        if (!message.content.match(/^spoiler:/gi)) {
            return null;
        }
        return new SpoilerBot.Spoiler(message.author, 'Some Topic', message.content);
    }
};
