# lastly
lastly is a lightweight, no-dependency Node.js library sending a final error via POST to an absolute url.

## How it works
<!-- - Run `npm i -s lastly` in your project -->
When your program encounters an uncaught exception lastly takes over. Lastly follows the same rules for error handling as `process.on('uncaughtException', error => {})` so it will only handle runtime errors. If you had an error in your syntax, for example, then you'll need to fix your code the hard way! Currently, lastly will only send a POST request formatted like a Slack message. It is important to mention that if you currently have the aforementioned `uncaughtException` process event set up you will need to wrap that inside of lastly's `callback` function.

If you are sending to a Slack incoming webhook then setup is very simple. You can provide an optional callback if you want to do something with the error after lastly processes it.

**It is important that lastly is configured before en error is thrown. For this reason I suggest you configure lastly as early as you can in your project**

## Basic setup
Lastly has only one required parameter, an absolute URI. It can optionally take a second parameter, a callback function, that will return the error that lastly processed.
```js
const lastly = require('lastly')
lastly('https://hooks.slack.com/services/XXXXX/XXXXX/xxxxxxxxxx');
```

## Setup with callback
```js
const lastly = require('lastly')
lastly('https://hooks.slack.com/services/XXXXX/XXXXX/xxxxxxxxxx', (err) => {
  // Handle err
  console.error(err);
});
```