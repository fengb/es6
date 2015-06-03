# co comparison

## synchronous

```javascript
var pg = require('pg-sync');

var client = pg("postgres://username:password@localhost/database");
try {
  var conn = client.connect();
} catch(err) {
  console.error('could not connect to postgres', err);
  return
}

try {
  var timeResult = conn.query('SELECT NOW() AS "theTime"');
  var now = timeResult.rows[0].theTime;

  var updateResult = client.query('UPDATE users SET change_time=$1', [now]);
  console.log('updated to', now);
} catch(err) {
  console.error('error running query', err);
} finally {
  conn.done();
}

## callbacks

```javascript
var pg = require('pg');

pg.connect("postgres://username:password@localhost/database", (err, client, done) => {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', (err, timeResult) => {
    if(err) {
      return console.error('error running query', err);
    }

    var now = timeResult.rows[0].theTime;
    client.query('UPDATE users SET change_time=$1', [now], (err, updateResult) => {
      if(err) {
        return console.error('error running query', err);
      }

      console.log('updated to', now);
      client.end();
    })
  });
});
```

## promises

```javascript
var pg = require('pg-promise');

var client = pg("postgres://username:password@localhost/database");
client.connect().then((conn) => {
  var now;
  return conn.query('SELECT NOW() AS "theTime"').then((timeResult) => {
    now = timeResult.rows[0].theTime;
    return client.query('UPDATE users SET change_time=$1', [now]);
  }).then((updateResult) => {
    console.log('updated to', now);
  }).catch((err) => {
    console.error('error running query', err);
  }).done(() => {
    conn.done();
  })
}, (err) => {
  console.error('could not connect to postgres', err);
})
```

## co

```javascript
co(function*(){
  var pg = require('pg-promise');

  var client = pg("postgres://username:password@localhost/database");
  try {
    var conn = yield client.connect();
  } catch(err) {
    console.error('could not connect to postgres', err);
    return
  }

  try {
    var timeResult = yield conn.query('SELECT NOW() AS "theTime"');
    var now = timeResult.rows[0].theTime;

    var updateResult = yield client.query('UPDATE users SET change_time=$1', [now]);
    console.log('updated to', now);
  } catch(err) {
    console.error('error running query', err);
  } finally {
    conn.done();
  }
}); // returns a promise
```

# simple implementation

```javascript
function co(generator) {
  var promise = new Promise.resolve();

  do {
    var result = generator.next(); // { value: Promise, done: boolean }
    promise = promise.then(result.value).catch((err) => generator.throw(err));
  } while(!result.done);
  return promise;
}
```
