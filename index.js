const http = require('http');
const https = require('https');
const path = require('path');

const config = {
  initialized: false,
};

const formatMessage = (error) => {
  const dir = process.cwd();
  const json = require(path.resolve(path.join(dir, '/package.json')));

  const header = [
    'Lastly encountered an error.',
    `\n\t\t*dir*: ${dir}`,
    `\n\t\t*name*: ${json.name || null}`,
    `\n\t\t*ver*: ${json.version || null}`,
  ];

  return JSON.stringify({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: header.join(''),
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: error.stack,
        }
      },
      {
        type: 'divider'
      }
    ]
  });
};

process.on('uncaughtException', error => {
  if (!config.initialized) {
    return console.error('Lastly is not sending error because config was not properly initialized.');
  }

  try {
    const message = formatMessage(error);

    const {
      url,
      secure,
      hostname,
      path,
      callback,
    } = config;

    const request = (secure ? https : http).request({
      hostname,
      port: secure ? 443 : 80,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': message.length
      }
    }, (response) => {
      console.log(`Lastly sent an error to ${url} and recieved status code: ${response.statusCode}`);
      if (callback) callback(error);
      process.exit(1);
    });

    request.on('error', error => {
      console.error(`Lastly encountered an error sending to ${url}.`);
      console.error(error);
      process.exit(1);
    });

    request.write(message);
    request.end();
  } catch(err) {
    console.error('Lastly failed to send error.', err);
    process.exit(1);
  }
});

module.exports = (url, callback = null) => {
  try {
    let error = false;
    const urlPattern = /^http(s)?:\/\/([^\/]*)(.*)/
    if (typeof url !== 'string') {
      console.error(`url [${url}] is not a valid string.`);
      error = true;
    } else {
      const patternMatch = url.match(urlPattern);
      if (patternMatch && patternMatch.length === 4) {
        config.secure = patternMatch[1] === 's';
        config.hostname = patternMatch[2];
        config.path = patternMatch[3] || '/';
      } else {
        console.error(`url [${url}] is not a valid url.`);
        error = true;
      }
    }

    if (callback !== null && typeof callback !== 'function') {
      console.error(`callback [${callback}] is not a function.`);
      error = true;
    }

    if (!error) {
      config.initialized = true;
      config.url = url;
      config.callback = callback;
    }
  } catch (err) {
    console.error('Lastly encountered an error initializing.');
  }
};
