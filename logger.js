const bunyan = require('bunyan');

var defaultOptions = {
  name   : process.env.APP_NAME,
  streams: [{
    type : 'file',
    path : concatLogPath('.log')
  }]
};
if (isDebug()) {
  defaultOptions.streams.push({
    stream: process.stdout,
    level: "debug"
  });
}
const Logger = bunyan.createLogger(defaultOptions);

function concatLogPath(suffix)
{
  return process.env.LOG_PATH + '/' + process.env.APP_NAME.toLowerCase() + suffix;
}

function info()
{
  Logger.info(...arguments);
}

function error()
{
  Logger.error(...arguments);
}

function debug()
{
  Logger.debug(...arguments);
}

/**
 * # 1 - error, 2 - info, 3 - debug
 */
function isDebug()
{
  return (process.env.LOG_LEVEL && process.env.LOG_LEVEL >= 3);
}

const LoggerActivities = bunyan.createLogger({
  name   : process.env.APP_NAME +'-activities',
  streams: [{
    type :'file',
    path : concatLogPath('-activities.log')
  }]
});

module.exports = {
  info             : info,
  error            : error,
  debug            : debug,
  isDebug          : isDebug,
  activitiesLogger : LoggerActivities
}
