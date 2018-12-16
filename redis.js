var NCommons = require('./index');
var Logger   = require('./logger');

const SESSION_PREFIX = (process.env.REDIS_SESSION_PREFIX) ? process.env.REDIS_SESSION_PREFIX : 'sess:';
const TTL = (process.env.REDIS_LOCK_TTL) ? process.env.REDIS_LOCK_TTL : 5000;
const DEFAULT_REDLOCK_OPTIONS = { driftFactor: 0.01, retryCount: 5, retryDelay: 200 };

var redisClient = require('redis').createClient();
redisClient.on('error', function(err) {
  Logger.error(err);
});

var Redlock = require('redlock');
var redlock = new Redlock([redisClient], DEFAULT_REDLOCK_OPTIONS);
redlock.on('clientError', function(err) { Logger.error(err); });

function end()
{
  redisClient.quit();
}

function getSession(sessionId, callback) {
  redisClient.get(generateKey(sessionId), callback);
}

function generateKey(sessionId) {
  return SESSION_PREFIX + sessionId;
}

function delSession(sessionId) {
  redisClient.del(generateKey(sessionId));
}

function updateUserSession(sessionId, keyValues, callback) {
  getSession(sessionId, NCommons.ok(callback, function(reply) {
    var info = (reply) ? JSON.parse(reply) : {};
    for (var i = keyValues.length - 1; i >= 0; i--) {
      info.user[keyValues[i][0]] = keyValues[i][1];
    }
    redisClient.set(generateKey(sessionId), JSON.stringify(info));
    return callback(null);
  }))
}

function redLock(resource, ttl, callback)
{
  doLock(redlock, resource, ttl, callback)
}

function doLock(redisLock, resource, ttl, callback)
{
  var newTtl = (ttl) ? ttl : TTL;
  redisLock.lock(resource, newTtl, NCommons.ok(callback, function(lock) {
    var done = function() {
      lock.unlock(function(err) {
        if (err) Logger.error(err);
      });
    }
    return callback(null, done);
  }));
}

function redLockCustom(resource, options, callback)
{
  var newOptions = (options) ? options : {};
  var lock = new Redlock([redisClient], {
    driftFactor : (newOptions.driftFactor) ? newOptions.driftFactor : DEFAULT_REDLOCK_OPTIONS.driftFactor,
    retryCount  : (newOptions.retryCount)  ? newOptions.retryCount  : DEFAULT_REDLOCK_OPTIONS.retryCount,
    retryDelay  : (newOptions.retryDelay)  ? newOptions.retryDelay  : DEFAULT_REDLOCK_OPTIONS.retryDelay
  });
  lock.on('clientError', function(err) { Logger.error(err); });
  doLock(lock, resource, newOptions.ttl, callback)
}

module.exports = {
  end               : end,
  redisCache        : redisClient,
  redisSession      : redisClient,
  redLock           : redLock,
  redLockCustom     : redLockCustom,
  getSession        : getSession,
  delSession        : delSession,
  updateUserSession : updateUserSession
}
