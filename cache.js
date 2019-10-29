const NodeCache = require("node-cache");

class ClusterCache {

  init(beforePurgeFn = null) {
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

  get(key, callback) {
    Memored.read(key, callback);
  }

  set(key, value, timeout, callback) {
    Memored.store(key, value, timeout, callback);
  }

  setForever(key, value, callback) {
    Memored.store(key, value, callback);
  }

  del(key, callback) {
    Memored.remove(key, callback);
  }
}

class StandaloneCache {

  constructor() {
    this.nCache = new NodeCache();
  }

  init(beforePurgeFn = null) {
    this.nCache.on("expired", function(key, value) {
      return beforePurgeFn(value);
    });
  }

  get(key, callback) {
    return callback(null, this.nCache.get(key));
  }

  set(key, value, timeout, callback) {
    var success = this.nCache.set(key, value, timeout);
    this.handleSetResponse(success, callback);
  }

  handleSetResponse(success, callback) {
    if (success) {
      return callback(null);
    } else {
      return callback({ message: 'Set cache failed' });
    }
  }

  setForever(key, value, callback) {
    var success = this.nCache.set(key, value);
    this.handleSetResponse(success, callback);
  }

  del(key, callback) {
    this.nCache.del(key);
    return callback(null);
  }
}

var instance = null;

function init(beforePurgeFn = null, isStandalone = false) {
  instance = (isStandalone) ? new StandaloneCache() : new ClusterCache();
  instance.init(beforePurgeFn);
}

function get(key, callback) {
  instance.get(key, callback);
}

function set() {
  var key = arguments[0];
  var value = arguments[1];
  var timeout, callback;
  if (arguments.length > 3) {
    timeout = (arguments[2]) ? arguments[2] : TIMEOUT;
    callback = arguments[3];
  } else {
    timeout = TIMEOUT;
    callback = arguments[2];
  }
  instance.set(key, value, timeout, callback);
}

function setForever(key, value, callback) {
  instance.setForever(key, value, callback);
}

function del(key, callback) {
  instance.del(key, callback);
}

module.exports = {
  init: init,
  get: get,
  set: set,
  setForever: setForever,
  del: del
}