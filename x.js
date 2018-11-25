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

var v1, v2;

v1 = '1';
v2 = 1;
console.log(compare(v1, v2));

v1 = [ '1', '2' ];
v2 = [ '2', '1' ];
console.log(compare(v1, v2));

v1 = { a: '1', b: '2' };
v2 = { b: '2', a: '1' };
console.log(compare(v1, v2));

v1 = [ { a: 1, b: 2 }];
v2 = [ { b: '2', a: '1' }];
console.log(compare(v1, v2));

v1 = { a: '1', b: [ 'a', 'b' ] };
v2 = { b: [ 'b', 'a' ], a: '1' };
console.log(compare(v1, v2));
