'use strict'
const util = require('./modules/util')
const MidiStreamer = require('./modules/MidiStreamer')
const MidiBuilder = require('./modules/MidiBuilder')
const MarkovBuilder = require('./modules/MarkovBuilder')

const args = util.readArgs()

if (!args['i'] || !args['o'] || !args['a']) {
  console.log('Usage:')
  console.log('  node src/index.js -a <algorithm> -i path/to/input/midi.mid -o path/to/output/midi.mid [-n <num>]')
  process.exit(1)
}

const algorithms = require(`./algorithms/${args['a']}`)

const stream = new MidiStreamer({path: args['i'], tolerance: 0.1})
const builder = new MarkovBuilder({algorithms: algorithms})

while(stream._validPtr()) {
  let event = stream.getNextEvent()
  const events = []

  while(event) {
    events.push(event)
    event = stream.getNextEvent()
  }
  while(events.length) {
    builder.processEvents(events)
    events.shift()
  }
  stream.nextTrack()
  console.log(`Track ${stream.trackPtr} done.`)
}

builder.calculateP()

const out = new MidiBuilder({algorithms: algorithms, path: args['o'], matrix: builder.matrix})
out.addTrack(args['n'] || 100)
out.done()