// Settings
var SCENE_WIDTH = 800;
var SCENE_HEIGHT = 450;
var cur_data, canvasElement, now, delta;
var frameRate = 30;
var interval = 1000 / frameRate;
var then = Date.now();
var POSE_CONNECTIONS = [
  {
    start: 0,
    end: 1,
  },
  {
    start: 1,
    end: 2,
  },
  {
    start: 2,
    end: 3,
  },
  {
    start: 3,
    end: 7,
  },
  {
    start: 0,
    end: 4,
  },
  {
    start: 4,
    end: 5,
  },
  {
    start: 5,
    end: 6,
  },
  {
    start: 6,
    end: 8,
  },
  {
    start: 9,
    end: 10,
  },
  {
    start: 11,
    end: 12,
  },
  {
    start: 11,
    end: 13,
  },
  {
    start: 13,
    end: 15,
  },
  {
    start: 15,
    end: 17,
  },
  {
    start: 15,
    end: 19,
  },
  {
    start: 15,
    end: 21,
  },
  {
    start: 17,
    end: 19,
  },
  {
    start: 12,
    end: 14,
  },
  {
    start: 14,
    end: 16,
  },
  {
    start: 16,
    end: 18,
  },
  {
    start: 16,
    end: 20,
  },
  {
    start: 16,
    end: 22,
  },
  {
    start: 18,
    end: 20,
  },
  {
    start: 11,
    end: 23,
  },
  {
    start: 12,
    end: 24,
  },
  {
    start: 23,
    end: 24,
  },
  {
    start: 23,
    end: 25,
  },
  {
    start: 24,
    end: 26,
  },
  {
    start: 25,
    end: 27,
  },
  {
    start: 26,
    end: 28,
  },
  {
    start: 27,
    end: 29,
  },
  {
    start: 28,
    end: 30,
  },
  {
    start: 29,
    end: 31,
  },
  {
    start: 30,
    end: 32,
  },
  {
    start: 27,
    end: 31,
  },
  {
    start: 28,
    end: 32,
  },
];

window.addEventListener("pose-landmarks", function (event) {
  console.log("message received: ", event);
  cur_data = event.detail.poseLandmarkerResult;
});

console.log("pose-broadcast started");
//add canvas element
canvasElement = document.createElement("canvas");
canvasElement.setAttribute("class", "output_canvas");
canvasElement.setAttribute("id", "output_canvas");
canvasElement.setAttribute("style", "position: absolute; left: 0px; top: 0px;");
canvasElement.setAttribute("width", SCENE_WIDTH);
canvasElement.setAttribute("height", SCENE_HEIGHT);

document.body.prepend(canvasElement);

import { DrawingUtils } from "../../mediapipe_Tasks/tasks-vision/vision_bundle.mjs";

canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

renderLoop();

function renderLoop() {
  now = Date.now();
  delta = now - then;
  if (delta > interval) {
    then = now - (delta % interval);
    //Draw landmarks on screen.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    drawingUtils.drawLandmarks(cur_data);
    drawingUtils.drawConnectors(
      cur_data,
      POSE_CONNECTIONS
    );
  }
  canvasCtx.restore();
  window.requestAnimationFrame(renderLoop);
}
