/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license MIT
 */

const SpoilerBot = require('../../src/SpoilerBot');

module.exports = {
    token: 'your_bot_token_here',
    markUserIds: [
        '242276581039538178'
    ],
    markRoleIds: [
        '285235614805262339',
    ],
    maxLines: 6,
    exclude: [],

    extractSpoiler: (message) => {
        if (!message.content.match(/^spoiler:/gi)) {
            return null;
        }
        return new SpoilerBot.Spoiler(message.author, 'Some Topic', message.content);
    }
};
