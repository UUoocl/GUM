// p5js r1b2 websocket example

// SETTINGS/ VARIABLES START

var EPHEMERAL = false //true;
var EPHEMERAL_ALPHA = 5; // 0-255. lower = longer lasting persistence
var FPS = 20;
var SCENE_SCALE = 1;
var SCENE_WIDTH = 800  //2750 
var SCENE_HEIGHT = 450 //768

// oscilator for sound 
//var osc

// Hack for live installation: Add more colors to force more lines being drawn
// Keep other palettes to allow fast switching with some copy paste
var PALETTES = [
  //["Autumn Rhythm", '#d3b893', ['#e3ded640', '#100d0340', '#99846040', '#99846040', '#4a4b5440', '#85756640', '#21211d40']],
  //["Number 1", '#e4caa8', ['#d2aa3440', '#30393d40', '#fff1d540', '#428e9440', '#f7ccc840', '#5c1a1440', '#10624440']],
  //["Number 18", '#a0a18f', ['#08090440', '#a7161b40', '#b0914140', '#eadbdc40', '#27494b40', '#c88e7a40', '#0a0a0840']],
  ["Dune", '#0c0606', [
    '#ab252640', '#e4712040', '#f8b21c40', '#e5761f40', '#d8513b40', '#fcea7340', '#35131440',
    '#ab252640', '#e4712040', '#f8b21c40', '#e5761f40', '#d8513b40', '#fcea7340', '#35131440',
    '#ab252640', '#e4712040', '#f8b21c40', '#e5761f40', '#d8513b40', '#fcea7340', '#35131440',
    '#ab252640', '#e4712040', '#f8b21c40', '#e5761f40', '#d8513b40', '#fcea7340', '#35131440',
    '#ab252640', '#e472040', '#f8b2c40'
  ]],
  //["Reversion", '#cdd2d6', ['#00149140', '#efbb0d40', '#03010240', '#5e8aaf40', '#9c53bf20', '#b1262340', '#098d5e40']],
  //["The Abyss", '#06060c', ['#006d7740', '#83c5be40', '#edf6f940', '#05052040', '#05052040', '#00000040', '#f0f0f040']],
  //["Luncheon On The Grass", '#f0f0f0', ["#150F1840", "#44301A40", "#6F451C40", "#B0211340", "#E58D2A40", "#E2A53240", "#ADABC240"]],
  //["Kandinsky", '#f0f0f0', ["#80948640", "#194B6D40", "#D7100E40", "#11121940", "#D9771C40", "#59231940", "#EDE5DA40"]]
];

var JOINTS = [
  "LEFT_INDEX",
  "RIGHT_INDEX",
  "LEFT_ELBOW",
  "RIGHT_ELBOW",
  "LEFT_HIP",
  "LEFT_WRIST",
  "RIGHT_WRIST"
];

var PALETTE;
var DATA;
var SUBDATA;
var PAINTLINES;
var DRIPS = [];

var no_detection = false;
var timer = 0;

var raw_data
var cur_data

// Adjust IP to your local network IP of interfaces server
// var my_ws_uri = "ws://127.0.0.1:4242"
// var my_websocket = new WebSocket(my_ws_uri);

// my_websocket.addEventListener("message", (event) => {
//     raw_data = JSON.parse(event.data);
//     cur_data = raw_data.payload
// });

window.addEventListener("pose-landmarks", function (event) {
  //console.log("message received: ",event)
  //pose = event.detail.poseLandmarkerResult
  //raw_data = JSON.parse(event.detail);
  cur_data = event.detail.poseLandmarkerResult
});




// SETTINGS/ VARIABLES END

// HELPER FUNCTIONS START

// helper functions which may live outside of the sketch scope
// as they don't rely on p5 components ( call stuff from p namespace )

// https://www.desmos.com/calculator/1930qsv4kw
function parabolaInterpolator(y0, y1, y2)
{
  var a = (y2 - 2 * y1 + y0) / 2;
  var b = (y1 - y0 - a);
  return (x) => a * x * x + b * x + y0;
}

function getJointPosition(jointnr)
{
  // Another hack for live ws mode: fetch coordinates from
  // cur_data which comes via websocket event listener
  // return coordinates far away from canvas and set flag if nothing found
  if (cur_data && cur_data[0]) {

    let cur_x = cur_data[jointnr].x
    let cur_y = cur_data[jointnr].y
    no_detection = false
    //  console.log(cur_x, cur_y)
    return [cur_x, cur_y]
  } else {
    no_detection = true
    return [-1000,-1000]
  }
}

// HELPER FUNCTIONS END

// MAIN PART START

// create our sketch environment and wrap all p5-related stuff in it
// this is done to encapsulate the p5 namespace ( behind "p." ) and
// to plug it into the p5 stage at the p5 playground

  function randomizeColor(c)
  {
    var c0 = color(c);
    var r = random(-30, 30);
    return color(red(c0) + r, green(c0) + r, blue(c0) + r, alpha(c0));
  }

  class Drip
  {

    constructor(color, x, y, dx, dy, weight)
    {
      this.color = color;
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.weight = weight;
      this.k = 2.0;
    }

    update()
    {
      var k = random(0.5, 1);
      this.x += random(-4, 4) / SCENE_WIDTH + k * this.dx;
      this.y += random(-4, 4) / SCENE_HEIGHT + k * this.dy;
      fill(randomizeColor(this.color));
      noStroke();
      circle(this.x * SCENE_WIDTH, this.y * SCENE_HEIGHT, this.weight * this.k);
      this.k *= 0.95;
      return (this.k >= 0.5);
    }

  }

  class PaintLine
  {

    constructor(color, x, y)
    {
      this.color = color;
      this.x = x;
      this.y = y;
      this.x2 = x;
      this.y2 = y;
      this.weight = SCENE_SCALE;
      this.speed2 = 0;
    }

    directionChangedX(x)
    {
      return (this.x - x) * (this.x - this.x2) > 0;
    }

    directionChangedY(y)
    {
      return (this.y - y) * (this.y - this.y2) > 0;
    }

    move(x, y)
    {

      // compute parabola interpolation
      var px = parabolaInterpolator(this.x2, this.x, x);
      var py = parabolaInterpolator(this.y2, this.y, y);

      var dx = x - this.x;
      var dy = y - this.y;
      var speed2 = dx * dx + dy * dy;
      if (speed2 < 0.00000001)
      {
        var ndrops = random(1, 3);
        for (var i = 0; i < ndrops; ++i)
        {
          DRIPS.push(
            new Drip(
              this.color,
              x + random(-1, 1) / SCENE_WIDTH,
              y + random(-1, 1) / SCENE_HEIGHT,
              0.0,
              random(1.0, 2.0) / SCENE_HEIGHT,
              random(4, 10.0) * SCENE_SCALE
            )
          );
        }
      }
      else if (speed2 > 400 / (SCENE_WIDTH * SCENE_WIDTH))
      {
        if (this.directionChangedX(x) || this.directionChangedY(y))
        {
          var ndrops = random(4, 18);
          for (var i = 0; i < ndrops; ++i)
          {
            var r = random(1.0, 2.0);
            DRIPS.push(
              new Drip(
                this.color,
                px(1.1 + 0.25 * r),
                py(1.1 + 0.25 * r),
                0.1 * dx, 0.1 * dy,
                r * SCENE_SCALE
              )
            );
          }
        }
      }
      else if (speed2 < 0.0125 * this.speed2)
      {
        if (random() < 0.5)
        {
          for (var i = 0; i < 8; ++i)
          {
            DRIPS.push(
              new Drip(
                this.color,
                x + random(-20, 20) / SCENE_WIDTH,
                y + random(-20, 20) / SCENE_WIDTH,
                random(3.0, 4.0)
              )
            );
          }
        }
      }

      this.speed2 = speed2;

      var weight = (10 - 0.2 * 800 * (pow(speed2, 0.3)));
      if (weight < 1.5) weight = 1.5;
      weight *= random(0.5, 1.5);
      this.weight = 0.5 * this.weight + 0.5 * weight;
      strokeWeight(this.weight * SCENE_SCALE);
      stroke(randomizeColor(this.color));
      noFill();

      var prevx = this.x;
      var prevy = this.y;
      for (var i = 1; i <= 10; ++i)
      {
        var newx = px(1.0 + i * 0.1);
        var newy = py(1.0 + i * 0.1);
        line(
          prevx * SCENE_WIDTH,
          prevy * SCENE_HEIGHT,
          newx * SCENE_WIDTH,
          newy * SCENE_HEIGHT
        );
        prevx = newx; prevy = newy;
      }

      this.x2 = this.x;
      this.y2 = this.y;
      this.x = x;
      this.y = y;
    }
  }



  function setup()  {
    PALETTE = PALETTES[(0.5 + random() * (PALETTES.length - 1)) | 0];
    createCanvas(SCENE_WIDTH, SCENE_HEIGHT, P2D);

    clear();
    //background(PALETTE[1],0,0,0);
    frameRate(FPS);

    // Sound setup, prepare oscilator, makes little "boop" on start
    // osc = new p5.Oscillator('sine');
    // userStartAudio();
    // osc.freq(440, 0.1);
    // osc.amp(0, 0.1);
    // osc.start()

    PAINTLINES = [];
    var colors = PALETTE[2];
    for (var i = 0; i < colors.length; ++i)
    {
      var [x, y] = getJointPosition(i);
      PAINTLINES.push(new PaintLine(colors[i], x, y));
    }
  }

  function draw() {

    if (EPHEMERAL)
    {
      var bg = color(PALETTE[1]);
      bg.setAlpha(EPHEMERAL_ALPHA);
      fill(bg);
      rect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    }

    // clear canvas in live mode after some ticks
    timer++
    if (timer > 2500) {
      timer = 0
      clear();
      background(PALETTE[1]);
    }

    for (var i = 0; i < PAINTLINES.length; ++i)
    {
      let [x, y] = getJointPosition(i);

      if (no_detection) {
        no_detection = false;
        return;
      }

      PAINTLINES[i].move(x, y);
    }

    // sound generator hack
    // let left_hand = getJointPosition(16)
    // if (left_hand) {
    //     let my_freq = left_hand[1] * 500
    //     let my_amp = left_hand[0]
    //     // osc.freq(my_freq, 0.1);
    //     // osc.amp(my_amp, 0.1);
    // }

    var i = 0;
    while (i < DRIPS.length)
    {
      if (DRIPS[i].update()) i++;
      else DRIPS.splice(i, 1);
    }

  }


// make sure the following line remains unchanged!
//stage = new p5(sketch, 'p5_stage')