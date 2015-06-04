# Generator

Generators are a new type of function that:

* suspends its own execution
* `yield` a value whenever it is suspended
* can be resumed at a later time
* can be sent a message while resuming
* can terminate itself with `return`

## Examples

### Basic

![vaguely useful lifecycle diagram](https://github.com/fengb/es6/blob/master/generator/lifecycle.png?raw=true)

```javascript
function* gc(){ // the * marks it as a generator
  yield 1
  yield 2
  return 3
}

let gen = gc() // create a generator object
gen.next()     // => { value: 1, done: false }
gen.next()     // => { value: 2, done: false }
gen.next()     // => { value: 3, done: true }

function* echo(){
  while(true){
    let msg = yield  // assign resume message
    if(msg === undefined){
      return
    }

    console.log(msg)
  }
}

gen = echo()
gen.next()      // executes up to the first yield, so nothing really happens
gen.next('foo') // => foo
gen.next(1)     // => 1
gen.next({})    // => [object Object]
gen.next()      // terminates
```

### Iterators

![iterator](https://github.com/fengb/es6/blob/master/generator/iterator.png?raw=true)

**https://github.com/fengb/es6/blob/master/generator/iterator.js**

```javascript
export function* counter(){
  let n = 0
  while(true){
    yield n++
  }
}

export function* timeout(ms, iterator){
  let expiration = new Date() + ms
  for(let val of iterator){
    if(new Date() > expiration){
      throw new Error(`Timeout! ${duration}`)
    }

    yield val
  }
}

export class Lazy {
  constructor(array){
    this.iterator = array
  }

  map(callback){
    let oldIterator = this.iterator
    this.iterator = (function*(){
      for(let value of oldIterator){
        yield callback(value)
      }
    })()
    return this
  }

  filter(callback){
    let oldIterator = this.iterator
    this.iterator = (function*(){
      for(let value of oldIterator){
        if(callback(value)){
          yield value
        }
      }
    })()
    return this
  }

  first(n){
    let oldIterator = this.iterator
    this.iterator = (function*(){
      for(let i=0; i < n; i++){
        let result = oldIterator.next()
        if(result.done){
          return
        }

        yield result.value
      }
    })()
    return this
  }

  value(){
    return Array.from(this.iterator)
  }
}
```

### async-await

![async-await](https://github.com/fengb/es6/blob/master/generator/async-await.png?raw=true)

**https://github.com/fengb/es6/blob/master/generator/async-await.js**

```javascript
import https from 'https'
import url from 'url'
import co from '../vendor/co'

function options(string){
  let options = url.parse(string)

  options.headers = {
    'User-Agent': 'Awesome-Octocat-App'
  }

  return options
}

function getJSONSync(url){
  throw new Error('No sync!')
}

/* Cons:
 * - synchronous: blocks world until response
 */
export function synchronous(username){
  let user = getJsonSync(`https://api.github.com/users/${username}`)

  let repos = getJsonSync(user.repos_url)

  return {
    name:  username,
    repos: repos.length,
    followers: followers.map((follower) => {
      let reposOfFollower = getJsonSync(follower.repos_url)

      return {
        name:  follower.login,
        repos: reposOfFollower.length
      }
    })
  }
}

function getJsonCallback(url, callback){
  console.log('GET', url)
  return https.get(options(url), (response) => {
    response.setEncoding('utf8')

    let body = ''
    response.on('data', (chunk) => {
      body += chunk
    })

    response.on('end', () => {
      console.log('COMPLETE', url)
      var json = JSON.parse(body)
      callback(json)
    })
  })
}

/* Cons:
 * - callback hell: pyramid of doom
 * - difficult to parallelize
 * - poor error handling
 */
export function callback(username, success, error = () => {}){
  let userReq = getJsonCallback(`https://api.github.com/users/${username}`, (user) => {

    let reposReq = getJsonCallback(user.repos_url, (repos) => {
      let followersReq = getJsonCallback(user.followers_url, (followers) => {
        success({
          name:      username,
          repos:     repos.length,
          followers: followers.map((follower) => {
            // callback hell on reposOfFollower
            return {
              name: follower.login,
              repos: NaN,
            }
          }),
        })
      }).on('error', error)
    }).on('error', error)
  }).on('error', error)
}

function getJsonPromise(url){
  return new Promise((resolve, reject) => {
    console.log('GET', url)
    https.get(options(url), (response) => {
      response.setEncoding('utf8')

      let body = ''
      response.on('data', (chunk) => {
        body += chunk
      })

      response.on('end', () => {
        console.log('COMPLETE', url)
        var json = JSON.parse(body)
        resolve(json)
      })
    }).on('error', reject)
  })
}

/* Cons:
 * - interlaces control flow and logic
 * - context switches between promise chains
 * - difficult to handle all errors
 */
export function promise(username){
  let ret = { name: username }
  let cheatFollowers

  return getJsonPromise(`https://api.github.com/users/${username}`).then((user) => {
    return Promise.all([
      getJsonPromise(user.repos_url),
      getJsonPromise(user.followers_url),
    ])
  }).then(([repos, followers]) => {
    ret.repos = repos.length
    cheatFollowers = followers
    return Promise.all(followers.map((follower) => getJsonPromise(follower.repos_url)))
  }).then((reposOfFollowers) => {
    ret.followers = cheatFollowers.map((follower, i) => {
      return {
        name: follower.login,
        repos: reposOfFollowers[i].length,
      }
    })

    return ret
  })
}

/* Cons:
 * - none?
 */
export function coPromise(username){
  return co(function*(){
    let user = yield getJsonPromise(`https://api.github.com/users/${username}`)

    let userExtra = yield {
      repos:     getJsonPromise(user.repos_url),
      followers: getJsonPromise(user.followers_url),
    }

    let reposOfFollowers = yield userExtra.followers.map((follower) => getJsonPromise(follower.repos_url))

    return {
      name:  username,
      repos: userExtra.repos.length,
      followers: userExtra.followers.map((follower, i) => {
        return {
          name: follower.login,
          repos: reposOfFollowers[i].length,
        }
      })
    }
  })
}
```
