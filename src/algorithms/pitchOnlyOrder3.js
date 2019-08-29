

function highestNote(event) {
  return Math.max(event.map((n) => n.midi))
}

// Given a list of events with the oldest event not processed at index zero,
// Generate a look up key that's used as the row identifier in the transition
// matrix.
function getKey(events) {
  const event1 = events[0]
  const event2 = events[1]
  const event3 = events[2]
  if (!event1 || !event2 || !event3) {
    return null
  }

  return `k${highestNote(event1)}${highestNote(event2)}${highestNote(event3)}`
}

// Given a list of events with the oldest event not processed at index zero,
// Generate a list of events that the `recreateEvent` and `getNextKey functions
// can use. The set of events have to match the set of events you used in `getKey`.
function getEventSequence(events) {
  const event1 = events[0]
  const event2 = events[1]
  const event3 = events[2]
  return [[{
    midi: highestNote(event1),
    duration: 0.125
  }],
  [{
    midi: highestNote(event2),
    duration: 0.125
  }],
  [{
    midi: highestNote(event3),
    duration: 0.125
  }]]
}

// Given a list of events with the oldest event not processed at index zero,
// and knowing how you generate the row key, here you return the column key of
// the next event corresponding to the row key chosen with `getKey`.
function getNextKey(events) {
  const event = events[3]
  if (!event) {
    return null
  }

  return highestNote(event)
}

// Given a list of events with the oldest event not processed at index zero,
// Generate an event that the `recreateEvent` function can use, corresbonding
// to the `getNextKey` implementation.
function getNextEvent(events) {
  const event = events[3]
  return [{
    midi: highestNote(event),
    duration: 0.125
  }]
}

// Adds an event onto the midi track at time.
// MUST return the duration of the event.
function recreateEvent(track, event, time) {
  if (event[0].midi === -1) {
    //rests don't need to be created.
    return event[0].duration
  }
  track.addNote({
    midi : event[0].midi,
    time : time,
    duration: event[0].duration
  })
  return event[0].duration
}

module.exports = {
  getKey,
  getEventSequence,
  getNextKey,
  getNextEvent,
  recreateEvent
}