const Intformat = require('biguint-format');
const FlakeId   = require('flake-idgen');
const Sliced    = require('sliced');

const FlakeIdGen = new FlakeId();

function ok()
{
  var onError = null, onSuccess = null;
  if (arguments.length == 2) {
    onError   = arguments[0];
    onSuccess = arguments[1];
  } else if (arguments.length == 1) {
    onError = onSuccess = arguments[0];
  } else {
    throw new Error('Invalid arguments');
  }

  return function(err) {
    if (err) {
      return onError(err);
    } else {
      return onSuccess.apply(onSuccess, Sliced(arguments, 1));
    }
  };
}

function noop()
{
}

function getObjectFn(obj, method)
{
  return function() {
    method.apply(obj, arguments);
  };
}

function async(method)
{
  var params = Sliced(arguments, 1) || []
  return function(callback) {
    method.apply(method, params.concat(callback))
  }
}

function asyncObject(obj, method)
{
  var params = Sliced(arguments, 2) || []
  return function(callback) {
    method.apply(obj, params.concat(callback))
  }
}

function compare(value1, value2)
{
  if (Array.isArray(value1)) {
    return compareArray(value1, value2);
  } else if (typeof value1 === 'object') {
    return compareObject(value1, value2);
  } else {
    return (value1 == value2);
  }
}

function compareObject(obj1, obj2)
{
  if (obj1 != null && obj1 != null) {
    var keys = Object.keys(obj1);
    if (keys.length != Object.keys(obj2).length) return false;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!compare(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  } else {
    return (obj1 == obj2);
  }
}

function compareArray(arr1, arr2, strict = false)
{
  if (Array.isArray(arr1) && Array.isArray(arr2)) {
    if (arr1.length != arr2.length) return false;
    if (strict) {
      for (var i = 0; i < arr1.length; i++) {
        if (!compare(arr1[i], arr2[i])) {
          return false;
        }
      }
      return true;
    } else {
      return compareArray(arr1.sort(), arr2.sort(), true);
    }
  } else {
    return (arr1 == arr2);
  }
}

function getUniqueId()
{
  return Intformat(FlakeIdGen.next(), 'dec');
}

/**
 * Mimics finally call
 * params: ..., onSuccessFn, onErrorFn, onFinallyFn
 */
function finallyCall(method)
{
  var l = arguments.length
  var params          = Sliced(arguments, 1, l - 3)
  var successCallback = arguments[l - 3]
  var errorCallback   = arguments[l - 2]
  var finallyCall     = arguments[l - 1]
  var finallyOk = function() {
    try {
      successCallback.apply(successCallback, arguments)
    } finally {
      finallyCall()
    }
  }
  var finallyErr = function() {
    try {
      errorCallback.apply(errorCallback, arguments)
    } finally {
      finallyCall()
    }
  }
  method.apply(method, params.concat(finallyOk, finallyErr))
}

function ellipsis(s, maxLength)
{
  if (s.length <= maxLength) return s;
  var c = s.charAt(maxLength);
  var pos = (c == ' ') ? maxLength : s.lastIndexOf(' ', maxLength);
  return s.substring(0, pos) + "...";
}

function stringifyParams(params)
{
  if (params === null) return null;
  var newParams = {};
  Object.keys(params).forEach((key) => {
    var value = params[key];
    if (value && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        if (value.constructor === Array) {
          newParams[key] = value;
        } else {
          newParams[key] = convertParams(value);
        }
      } else {
        newParams[key] = String(value);
      }
    }
  });
  return newParams;
}

function init()
{
  require('dotenv').config();
}

module.exports = {
  init            : init,
  ok              : ok,
  noop            : noop,
  async           : async,
  asyncObject     : asyncObject,
  getObjectFn     : getObjectFn,
  compare         : compare,
  compareObject   : compareObject,
  compareArray    : compareArray,
  getUniqueId     : getUniqueId,
  finallyCall     : finallyCall,
  ellipsis        : ellipsis,
  stringifyParams : stringifyParams
}