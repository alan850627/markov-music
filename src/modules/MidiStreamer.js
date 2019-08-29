'use strict'

const { Midi } = require('@tonejs/midi')
const fs = require('fs')


class MidiStreamer {
  constructor(options) {
    this.path = options.path || ''
    this.tolerance = options.tolerance || 0
    this.ignoreRests = options.ignoreRests || false
    this.midi = new Midi(fs.readFileSync(this.path))
    this.trackPtr = 0
    this.notePtr = 0

    this.previousEvent = []
  }

  _validPtr() {
    if (this.midi.tracks.length <= this.trackPtr) {
      return false
    }
    if (this.midi.tracks[this.trackPtr].notes.length <= this.notePtr) {
      return false
    }
    return true
  }

  nextTrack() {
    this.notePtr = 0
    this.trackPtr += 1
  }

  _getNextNote() {
    if (!this._validPtr()) {
      return null
    }
    return this.midi.tracks[this.trackPtr].notes[this.notePtr]
  }

  _getEventEndingTime(event) {
    let ret = 0
    event.forEach(note => {
      const endTime = note.time + note.duration
      if (endTime > ret) {
        ret = endTime
      }
    })

    return ret
  }

  getNextEvent() {
    let note = this._getNextNote()
    if (!note) {
      return null
    }

    // check if there's rest in between
    if(!this.ignoreRests) {
      const prevEndTime = this._getEventEndingTime(this.previousEvent)
      if (note.time - prevEndTime > this.tolerance) {
        // there is a rest.
        const restEvent = [{
          midi: -1,
          time: prevEndTime,
          name: 'rest',
          pitch: 'rest',
          octave : 'rest',
          velocity: '0',
          duration: note.time - prevEndTime,
        }]
        this.previousEvent = restEvent
        return restEvent
      }
    }

    const out = []
    out.push(note)
    this.notePtr += 1

    let nextNote = this._getNextNote()
    while (nextNote && nextNote.time - note.time <= this.tolerance) {
      out.push(nextNote)
      note = nextNote
      this.notePtr += 1
      nextNote = this._getNextNote()
    }

    this.previousEvent = out
    return out
  }
}

module.exports = MidiStreamer
