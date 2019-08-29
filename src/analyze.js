'use strict'
const util = require('./modules/util')
const MidiStreamer = require('./modules/MidiStreamer')
const MidiBuilder = require('./modules/MidiBuilder')
const MarkovBuilder = require('./modules/MarkovBuilder')
const fs = require('fs')

const args = util.readArgs()

if (!args['i'] || !args['o']) {
  console.log('Usage:')
  console.log('  node src/analyze.js -i path/to/input/midi.mid -o path/to/output/html.html')
  process.exit(1)
}

const algorithms = require('./algorithms/pitchOnlyOrder1')

const stream = new MidiStreamer({path: args['i'], ignoreRests: true})
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

console.log('Calculating P')
builder.calculateP()

const matrix = builder.matrix

// TODO: SORT THE KEYS. IF THE KEY ISN'T ALREADY MIDI NUMBERS!
// THIS IS A LOT OF WORK!

const noteList = Object.keys(matrix)
const low = Number(noteList[0])
const high = Number(noteList[noteList.length-1])
const arr = []
for (let i = low; i <= high; i += 1) {
  const row = []
  for (let j = low; j <= high; j += 1) {
    if (matrix[i]) {
      if (matrix[i].next[j]) {
        row.push(matrix[i].next[j].p)
      } else {
        row.push(0)
      }
    } else {
      row.push(0)
    }
  }
  arr.push(row)
}

const template = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Transition Matrix</title>
    <style>
      body {
        margin: 0;
      }
      .cell {
        border-style: dotted;
        border-width: thin;
        border-color: #CCCCCC;
        position:absolute;
      }
      .text {
        text-align: center;
        position:absolute;
      }
    </style>
  </head>
  <body>
    <div class="matrix">
    </div>

    <script>
      var matrix = ${JSON.stringify(arr)}
      var canvas = document.querySelector('.matrix');
      var width = window.innerWidth;
      var height = window.innerHeight;
      canvas.style.cssText = \`width:\${width}px;height:\${height}px;\`
      var size = Math.min(width, height) * .9

      var horizCenter = width/2
      var vertCenter = height/2
      var blockSize = size/matrix.length

      function drawData(x, y) {
        var p = matrix[y][x]
        var log = Math.log(1+p)/Math.log(2)
        var c = (1-log)*255

        var obj = document.createElement('div');
        obj.className = "cell"
        obj.style.cssText = \`left:\${horizCenter-size/2 + blockSize * x}px;top:\${vertCenter-size/2 + blockSize * y}px;width:\${blockSize}px;height:\${blockSize}px;background-color:rgb(\${c},\${c},\${c});\`
        canvas.appendChild(obj);
      }

      function drawMargin(i) {
        text = document.createElement('div');
        text.className = "text"
        text.style.cssText = \`font-size:\${blockSize/2}px;left:\${horizCenter-size/2 + i * blockSize + blockSize/4}px;top:\${vertCenter-size/2 - blockSize}px;\`
        text.innerHTML = ${low} + i
        canvas.appendChild(text);

        text = document.createElement('div');
        text.className = "text"
        text.style.cssText = \`font-size:\${blockSize/2}px;left:\${horizCenter-size/2 - blockSize}px;top:\${vertCenter-size/2 +i*blockSize + blockSize/4}px;\`
        text.innerHTML = ${low} + i
        canvas.appendChild(text);
      }

      for (var i = 0; i < matrix.length; i += 1) {
        drawMargin(i)
        for (var j = 0; j < matrix[i].length; j += 1) {
          drawData(j, i)
        }
      }
    </script>
  </body>
</html>
`

fs.writeFileSync(args['o'], template, 'utf-8')
