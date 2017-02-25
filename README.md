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

To create spoilers, send a message of the following format: `<topic>:spoiler:<content>`, e.g.:

```
FMA:spoiler:Elric brothers are alchemists!
```

# Basic usage

First of all, you'll need to obtain a secret token for your bot. The steps you need to take to do this [are described here](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token). Make sure to give the bot enough permissions to post messages and delete messages of other users. Once you have your token, you can begin using Discord Spoiler Bot! Create a file called `index.js` and put the following inside:

```javascript
'use strict';

const SpoilerBot = require('./src/SpoilerBot');

let config = {
    token: 'you_secret_token_here',
};

let bot = new SpoilerBot(config);
bot.connect();
```

Use the following command to start the bot:

```shell
$ node index.js
```

Now you should be able to send messages of the format `<topic>:spoiler:<content>` to create spoiler GIFs. Read sections below to see how you can change the format of spoiler messages.

# Advanced configuration

As seen above, you have to create a config to initialise `SpoilerBot`. Below you can find the config properties you can set.

| Property               | Default value | Description                                                                                                                                                                                                                |
|------------------------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `token` **[required]** | None          | Secret token of your Discord bot                                                                                                                                                                                           |
| `maxLines`             | 6             | Maximum amount of lines that spoiler content can span over.                                                                                                                                                                |
| `include`              | None          | Array of strings, where each string represents an ID of a channel. When this property is set, bot will only listen to the specified channels. Cannot be used together with `exclude`.                                      |
| `exclude`              | None          | Array of strings, where each string represents an ID of a channel. When this property is set, bot will listen to all channels but the one specified in this array. Cannot be used together with `include`.                 |
| `extractSpoiler`       | None          | Function that takes a [Discord.js `Message`](https://discord.js.org/#/docs/main/stable/class/Message) object and returns a `Spoiler` object if the message contains a spoiler or `null` if it does not. See example below. |

### Config example

Here's a sample config with some comments:

```javascript
let config = {
    token: 'you_secret_token_here',
    
    // Allow 20 lines in a spoiler, results in some big GIFs
    maxLines: 20,
    
    // Only listen to 2 specific channels
    include: [
        '241271400869003265',
        '241512070854606848'
    ],
    
    // Mark messages that begin with `spoiler:` as spoilers.
    // Sets `Some Topic` as the topic for all spoilers and
    // passes original message content as spoiler content.
    extractSpoiler: (message) => {
        if (!message.content.match(/^spoiler:/gi)) {
            return null;
        }
        return new SpoilerBot.Spoiler(message.author, 'Some Topic', message.content);
    }
};
```

# Reporting bugs

Please create an issue thread [here](https://github.com/TimboKZ/discord-spoiler-bot/issues). I will try to reply and resolve issues to the best of my ability.

# Contributing

I believe this bot is feature-complete, and from now on will most likely only fix bugs. Before adding a new feature to this bot and creating a pull request, make sure said feature makes sense in the context of Discord Spoiler Bot. There are no unit tests at the moment so you will have to test your solution yourself and I will review your code for any issues.