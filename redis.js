var NCommons = require('./index');
var Logger   = require('./logger');

const SESSION_PREFIX = (process.env.REDIS_SESSION_PREFIX) ? process.env.REDIS_SESSION_PREFIX : 'sess:';
const TTL = (process.env.REDIS_LOCK_TTL) ? process.env.REDIS_LOCK_TTL : 5000;

var redisClient = require('redis').createClient();
redisClient.on('error', function(err) {
  Logger.error(err);
});

var Redlock = require('redlock');
var redlock = new Redlock([redisClient], { driftFactor: 0.01, retryCount: 5, retryDelay: 200 });
redlock.on('clientError', function(err) {
  Logger.error(err);
});

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
  var ttl_ = (ttl) ? ttl : TTL;
  redlock.lock(resource, ttl_, NCommons.ok(callback, function(lock) {
    var done = function() {
      lock.unlock(function(err) {
        if (err) Logger.error(err);
      });
    }
    return callback(null, done);
  }));
}

module.exports = {
  redisCache        : redisClient,
  redisSession      : redisClient,
  redisCart         : redisClient,
  end               : end,
  redLock           : redLock,
  getSession        : getSession,
  delSession        : delSession,
  updateUserSession : updateUserSession
}