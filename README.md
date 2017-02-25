# Discord Spoiler Bot

A Discord bot that replaces spoiler messages with GIFs that reveal content on hover.

> Note: At the moment this bot is not very mobile-friendly.

# Demo

### Single line

![Discord Spoiler Bot in action](https://foxypanda-ghost.s3.amazonaws.com/2017/Feb/Spoiler_Bot_One_Line-1487990846207.gif)

### Multi-line

![Discord Spoiler Bot with multi-line comments](https://foxypanda-ghost.s3.amazonaws.com/2017/Feb/Spoiler_Bot_Multiple_Lines-1487991244852.gif)

# Quick start

Add `discord-spoiler-bot` to your NPM project:

```shell
$ npm install discord-spoiler-bot --save
```

Put this into your `index.js`:

```javascript
'use strict';

const SpoilerBot = require('./src/SpoilerBot');
const token = 'your_secret_token';

let bot = new SpoilerBot({token});
bot.connect();
```

Run the bot:

```shell
$ node index.js
```

# Installation

Make sure you have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed. This bot was test with Node v6+ so if you experience any issues, try upgrading your Node.js.

First, you'll have to create a npm project and customise details as appropriate:

```shell
$ npm init
```

This bot uses [node-canvas](https://github.com/Automattic/node-canvas) to generate GIFs, so make sure you install the prerequisites mentioned in [its installation section](https://github.com/Automattic/node-canvas#installation).

Then, you'll need to install `discord-spoiler-bot` and save it as a dependency:

```shell
$ npm install discord-spoiler-bot --save
```

# Basic usage

First of all, you'll need to obtain a secret token for your bot. The steps you need to take to do this [are described here](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token). Once you have your token, you can begin using Discord Spoiler Bot! Create a file called `index.js` and put the following inside:

```javascript
'use strict';

const SpoilerBot = require('./src/SpoilerBot');

let config = {
    token: 'you_secret_token_here',
};

let bot = new SpoilerBot(config);
bot.connect();
```

# Advanced configuration

> This section is still incomplete.

# Reporting bugs

Please create an issue thread [here](https://github.com/TimboKZ/discord-spoiler-bot/issues). I will try to reply and resolve issues to the best of my ability.

# Contributing

I believe this bot is feature-complete, and from now on will most likely only fix bugs. Before adding a new feature to this bot and creating a pull request, make sure said feature makes sense in the context of Discord Spoiler Bot. There are no unit tests at the moment so you will have to test your solution yourself and I will review your code for any issues.