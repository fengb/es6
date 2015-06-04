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
