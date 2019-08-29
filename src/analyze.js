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

const algorithms = require('./algorithms/topVoiceNoteOnlyOrder1')

const stream = new MidiStreamer({path: args['i'], tolerance: 0.0001, ignoreRests: true})

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
    <title>Canvas</title>
    <style>
      body {
        margin: 0;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <canvas class="myCanvas">
      <p>Canvas failed!!! -Alanolen</p>
    </canvas>

    <script>
      var matrix = ${JSON.stringify(arr)}
      var canvas = document.querySelector('.myCanvas');
      var width = canvas.width = window.innerWidth;
      var height = canvas.height = window.innerHeight;
      var ctx = canvas.getContext('2d');

      var horizCenter = width/2
      var vertCenter = height/2
      var size = 550
      ctx.fillStyle = 'rgb(0,0,0)';
      ctx.fillRect(horizCenter-size/2-2,vertCenter-size/2-2,size+4,size+4);

      ctx.fillText('${low}', horizCenter-size/2-20, vertCenter-size/2 + 5);
      ctx.fillText('${high}', horizCenter-size/2-20, vertCenter+size/2);

      ctx.fillText('${low}', horizCenter-size/2, vertCenter-size/2 - 10);
      ctx.fillText('${high}', horizCenter+size/2-10, vertCenter-size/2 - 10);

      var blockSize = size/matrix.length
      function drawData(x, y) {
        var p = matrix[y][x]
        var log = Math.log(1+p)/Math.log(2)
        var c = (1-log)*255
        ctx.fillStyle = \`rgb(\${c},\${c},\${c})\`;
        ctx.fillRect(horizCenter-size/2 + blockSize * x,vertCenter-size/2 + blockSize * y, blockSize, blockSize);
      }

      for (var i = 0; i < matrix.length; i += 1) {
        for (var j = 0; j < matrix[i].length; j += 1) {
          drawData(j, i)
        }
      }
    </script>
  </body>
</html>
`
fs.writeFileSync(args['o'], template, 'utf-8')
