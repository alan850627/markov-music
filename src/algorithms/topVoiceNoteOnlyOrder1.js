
// will only use the zeroth index
function getKey(events) {
  const event = events[0]
  if (!event) {
    console.error('No event')
    return null
  }

  return event[0].midi
}

// metadata required to recreate
function getEventSequence(events) {
  return [[{
    midi: events[0][0].midi,
    duration: 0.5
  }]]
}

function getNextKey(events) {
  const event = events[1]
  if (!event) {
    console.error('No event')
    return null
  }

  return event[0].midi
}

// metadata required to recreate
function getNextEvent(events) {
  return [{
    midi: events[1][0].midi,
    duration: 0.5
  }]
}

// RETURN THE DURATION!
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