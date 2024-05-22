  var setupDetails,
  sourceWidth,
  sourceHeight,
  eltWidth,
  eltHeight,
  windowID,
  sourceName,
  MPvalues;
var frameRate, FPSElement, canvasElement, IP, PORT, PW;
var now;
var then = Date.now();
var interval;
var delta;


document.getElementById("FPS").addEventListener("change",updateFPS)

function updateFPS() {
  console.log("FPS changed");
  frameRate = document.getElementById("FPS").value;
  interval = 1000/frameRate
  loadRenderer();
}

//window.addEventListener("DOMContentLoaded", async () => {
async function loadRenderer() {
  const videoEl = document.getElementById("videoStream") 
  videoEl.remove();
  document.getElementById("FPS").addEventListener("change", updateFPS);
  //read FPS input
  frameRate = document.getElementById("FPS").value;
  interval = 1000/frameRate

  //add canvas element
  canvasElement = document.createElement("canvas");
  canvasElement.setAttribute("class", "output_canvas");
  canvasElement.setAttribute("id", "output_canvas");
  canvasElement.setAttribute("width", 400);
  canvasElement.setAttribute("height", 200);
  canvasElement.setAttribute(
    "style",
    "position: absolute; left: 0px; top: 100px;"
  );

  document.body.prepend(canvasElement);
 
 const audio = document.getElementById("audioStream").srcObject
   //audio.play();
  //audio.muted = false;
  
  console.log(audio.srcObject);

  console.log("Analyse called");
  const canvas = document.getElementById("output_canvas");
  const canvasCtx = canvas.getContext("2d");

  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();

  const source = audioCtx.createMediaStreamSource(audio);
  source.connect(analyser);
  console.log(source);
  console.log(analyser);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const WIDTH = 400;
  const HEIGHT = 200;
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  
  function draw() {
    //console.log("draw started");
    window.requestAnimationFrame(draw);
    now = Date.now();
    delta = now - then;
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.fillStyle = "rgb(0 0 0)";
    
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;
      
      canvasCtx.fillStyle = `rgb(${barHeight + 100} 50 50)`;
      canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);
      
      x += barWidth + 1;
    }
    if (delta > interval) {
      then = now - (delta % interval);
      console.log(dataArray);
      
      //send results to OBS Browser Source
      obs.call("CallVendorRequest", {
        vendorName: "obs-browser",
      requestType: "emit_event",
      requestData: {
        event_name: "audio-input",
        event_data: { dataArray},
      },
    });
  }
}
  draw();
}