'use strict'
const util = require('./modules/util')
const MidiStreamer = require('./modules/MidiStreamer')
const MidiBuilder = require('./modules/MidiBuilder')
const MarkovBuilder = require('./modules/MarkovBuilder')
const algorithms = require('./algorithms/topVoiceNoteOnlyOrder1')

const args = util.readArgs()

if (!args['i'] || !args['o']) {
  console.log('Usage:')
  console.log('  node rename.js -i path/to/input/midi.mid -o path/to/output/midi.mid')
  process.exit(1)
}

const stream = new MidiStreamer({path: args['i'], tolerance: 0.1})

let event = stream.getNextEvent()
const events = []
while(event) {
  events.push(event)
  event = stream.getNextEvent()
}

const builder = new MarkovBuilder({algorithms: algorithms})
while(events.length) {
  builder.processEvents(events)
  events.shift()
}
builder.calculateP()

const out = new MidiBuilder({algorithms: algorithms, path: args['o'], matrix: builder.matrix})
out.addTrack(100)
out.done()