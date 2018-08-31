# n-commons
Node Commons Utilities

Api:
- init
- ok
- noop
- async
- asyncObject
- getObjectFn
- compareArray
- getUniqueId
- finallyCall
- ellipsis
- stringifyParams

env
name   : process.env.APP_NAME,
* # 1 - error, 2 - info, 3 - debug
*/
function isDebug()
{
 return (process.env.LOG_LEVEL && process.env.LOG_LEVEL >= 3);
return process.env.LOG_PATH + '/' + process.env.APP_NAME.toLowerCase() + suffix;


REDIS_SESSION_PREFIX
REDIS_LOCK_TTL


const TIMEOUT = (process.env.CACHE_TIMEOUT) ? process.env.CACHE_TIMEOUT : (5 * 60 * 1000);


TODO:
merge protocol from n-commons-server di amproker-core
replace require logger, redis, cache di semua project terutama ams ans amproker-core amproker-server