
const { Midi } = require('@tonejs/midi')
const fs = require('fs')

class MidiBuilder {
  constructor(options) {
    this.matrix = options.matrix
    this.algorithms = options.algorithms
    this.path = options.path
    this.midi = new Midi()
  }

  addTrack(length) {
    const track = this.midi.addTrack()

    let currentRow = this.matrix[Object.keys(this.matrix)[0]]
    let events = [...currentRow.eventSequence]

    if (!currentRow.next) {
      console.log('can\'t create track. make input mid longer.')
      return
    }

    let time = 0
    currentRow.eventSequence.forEach(event => {
      time += this.algorithms.recreateEvent(track, event, time)
    })

    while(Object.keys(currentRow.next).length > 0 && length) {
      const nextKeys = Object.keys(currentRow.next)
      const rand = Math.random()
      let i = 0
      let acc = currentRow.next[nextKeys[i]].p

      while (rand > acc) {
        i += 1
        acc += currentRow.next[nextKeys[i]].p
      }
      const event = currentRow.next[nextKeys[i]].event
      time += this.algorithms.recreateEvent(track, event, time)

      events.push(event)
      events.shift()
      currentRow = this.matrix[this.algorithms.getKey(events)]
      length -= 1
    }
  }

  done() {
    fs.writeFileSync(this.path, Buffer.from(this.midi.toArray()))
  }
}

module.exports = MidiBuilder