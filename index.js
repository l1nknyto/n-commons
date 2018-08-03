const Intformat = require('biguint-format');
const FlakeId   = require('flake-idgen');
const Sliced    = require('Sliced');

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

function compareArray(array, array2, strict)
{
  if (!array && !array2) return false;
  if (!array || !array2) return false;
  if (array2.length != array.length) return false;

  if (!strict) return compareArray(array.sort(), array2.sort(), true);
  else for (var i = array2.length - 1; i >= 0; i--) {
    if (array2[i] instanceof Array && array[i] instanceof Array) {
      if (!compareArray(array[i], array2[i], strict)) return false;
    } else if (array2[i] != array[i]) {
      return false;
    }
  }
  return true;
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

module.exports = {
  ok              : ok,
  noop            : noop,

  async           : async,
  asyncObject     : asyncObject,
  getObjectFn     : getObjectFn,

  compareArray    : compareArray,

  getUniqueId     : getUniqueId,

  finallyCall     : finallyCall,

  ellipsis        : ellipsis,
  stringifyParams : stringifyParams
}