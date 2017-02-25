# Discord Spoiler Bot

A Discord bot that replaces spoiler messages with GIFs that reveal content on hover.

> Note: At the moment this bot is not very mobile-friendly.

## Demo

### Single line

![Discord Spoiler Bot in action](https://foxypanda-ghost.s3.amazonaws.com/2017/Feb/Spoiler_Bot_One_Line-1487990846207.gif)

### Multi-line

![Discord Spoiler Bot with multi-line comments](https://foxypanda-ghost.s3.amazonaws.com/2017/Feb/Spoiler_Bot_Multiple_Lines-1487991244852.gif)

## Quick start

Add `discord-spoiler-bot` to your NPM project:

```
npm install discord-spoiler-bot --save
```

Put this into your `index.js`:

```javascript
const SpoilerBot = require('./src/SpoilerBot');
const token = 'your_secret_token';

let bot = new SpoilerBot({token});
bot.connect();
```

Run the bot:

```bash
node index.js
```