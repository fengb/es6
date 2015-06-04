export function* counter(){
  let n = 0
  while(true){
    yield n++
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
