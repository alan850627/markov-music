"use strict"

const readArgs = function () {
  let myArgs = process.argv.slice(2);
  let ret = {}
  if (!myArgs.length) {
    return ret
  }
  if (myArgs.length % 2 !== 0) {
    console.error('Warning: Possible argument error')
  }
  while(myArgs.length) {
    let cmd = myArgs.shift()
    // get rid of the minus
    ret[cmd.substring(1)] = myArgs.shift()
  }

  return ret
}

module.exports = {
  readArgs
}