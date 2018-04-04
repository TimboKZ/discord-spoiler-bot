/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2018
 * @license MIT
 */

'use strict';

class Util {

    static log(/* arguments */) {
        let now = new Date();
        let options = {
            hour12: false,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        let timeString = now.toLocaleString('en-us', options);
        let args = [].slice.call(arguments);
        console.log.apply(null, [`[${timeString}]`].concat(args));
    }

    static error(/* arguments */) {
        let now = new Date();
        let options = {
            hour12: false,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        let timeString = now.toLocaleString('en-us', options);
        let args = [].slice.call(arguments);
        console.error.apply(null, [`[${timeString}]`].concat(args));
    }

}

module.exports = Util;
