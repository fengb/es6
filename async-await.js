import https from 'https'
import url from 'url'
import co from './vendor/co'

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
