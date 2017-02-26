# Discord Spoiler Bot

[![npm](https://img.shields.io/npm/dt/discord-spoiler-bot.svg)](https://www.npmjs.com/package/discord-spoiler-bot)
![npm dependencies](https://david-dm.org/TimboKZ/discord-spoiler-bot.svg)

A Discord bot that replaces spoiler messages with GIFs that reveal content on hover.

# Demo

### Single line

![Discord Spoiler Bot in action](https://foxypanda-ghost.s3.amazonaws.com/2017/Feb/Spoiler_Bot_One_Line-1487990846207.gif)

### Multi-line

![Discord Spoiler Bot with multi-line comments](https://foxypanda-ghost.s3.amazonaws.com/2017/Feb/Spoiler_Bot_Multiple_Lines-1487991244852.gif)

# Documentation
 
 Check [Discord Spoiler Bot Wiki](https://github.com/TimboKZ/discord-spoiler-bot/wiki) on GitHub for full documentation. See section below for the quick start guide.

### Quick start

If you know what you're doing, you can jump right in. First, make sure you have [all prerequisites for `node-canvas` installed](https://github.com/Automattic/node-canvas#installation). Then add Discord Spoiler Bot to your npm project:

```shell
$ npm install discord-spoiler-bot --save
```

Now get a secret token for your bot and make sure the bot has permission to read, write and delete messages as well as upload files. Create a file called `index.js` and put the following inside:

```javascript
'use strict';

const SpoilerBot = require('discord-spoiler-bot');

let config = {
    token: 'you_secret_token_here',
};

let bot = new SpoilerBot(config);
bot.connect();
```

Launch your bot using Node.js:

```shell
$ node index.js
```

And you're done! Write messages of format `<topic>:spoiler:<content>` to mark your own messages as spoilers, e.g.:

```
FMA:spoiler:Elric brothers are alchemists!
```

To mark someone else's messages, use `<message-id>:spoils:<topic>`, but you will have to configure permissions first. See [Configuration](https://github.com/TimboKZ/discord-spoiler-bot/wiki/Configuration) section.

# Reporting bugs

Please create an issue thread [here](https://github.com/TimboKZ/discord-spoiler-bot/issues). I will try to reply and resolve issues to the best of my ability.

### Known issues

* It's been reported that GIFs play continuously on mobile devices instead of stopping after revealing the spoiler. Sadly this is a limitation of the mobile Discord app and I can't do anything about it.
* On Windows, `node-canvas` library does not support true type fonts so Discord Spoiler Bot uses the default `node-canvas` font instead of Source Sans Pro Regular. 

# Contributing

I believe this bot is feature-complete, and from now on will most likely only fix bugs. Before adding a new feature to this bot and creating a pull request, make sure said feature makes sense in the context of Discord Spoiler Bot.

Make sure `npm test` and `npm run lint` return no errors before making a pull request, otherwise I might reject it.