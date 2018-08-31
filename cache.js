const Fs      = require('fs');
const Cluster = require('cluster');
const Memored = require('memored');

const TIMEOUT = (process.env.CACHE_TIMEOUT) ? process.env.CACHE_TIMEOUT : (5 * 60 * 1000);

function init(beforePurgeFn)
{
  Memored.setup({
    purgeInterval: TIMEOUT,
    beforePurge: function(entry) {
      if (beforePurgeFn) {
        return beforePurgeFn(entry);
      } else {
        return true;
      }
    }
  });
}

function get(key, callback)
{
  Memored.read(key, callback);
}

function set()
{
  var key      = arguments[0];
  var value    = arguments[1];
  var timeout  = (arguments.length > 3) ? arguments[2] : TIMEOUT;
  var callback = (arguments.length > 3) ? arguments[3] : arguments[2];
  Memored.store(key, value, timeout, callback);
}

function del(key, callback)
{
  Memored.remove(key, callback);
}

module.exports = {
  init : init,
  get  : get,
  set  : set,
  del  : del
}