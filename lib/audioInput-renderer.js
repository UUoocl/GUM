console.log("Audio Analysis Loaded");

let fftFrameRate, canvasElement;
var now;
var then = Date.now();
var interval;
var delta;

function updateFPS() {
  console.log("FPS changed");
  fftFrameRate = document.getElementById("FPS").value;
  interval = 1000/fftFrameRate
}

//loadRenderer();
//window.addEventListener("DOMContentLoaded", async () => {
async function startAudioAnalysis() {
  //console.log('add audio element')
  document.getElementById("FPS").addEventListener("change", updateFPS);
  //read FPS input
  fftFrameRate = document.getElementById("FPS").value;
  interval = 1000/fftFrameRate

  //add audio element
  var domElement = document.createElement("audio");
  domElement.setAttribute("playsinline", "");
  domElement.setAttribute("id", "desktopAudio");
  domElement.setAttribute("style","height: 0")
  document.getElementById('fft').append(domElement);
  
  //add canvas element
  canvasElement = document.createElement("canvas");
  canvasElement.setAttribute("class", "output_canvas");
  canvasElement.setAttribute("id", "output_canvas");
  canvasElement.setAttribute("width", 400);
  canvasElement.setAttribute("height", 200);
  // canvasElement.setAttribute(
    //   "style",
    //   "position: absolute; left: 0px; top: 100px;"
    // );
    
  document.getElementById('fft').append(canvasElement);
  
  //start desktopcapture stream
  const stream = localAudioStream;
  //console.log(stream);
  stream.getTracks().forEach(function (track) {
    //console.log(track.getSettings());
  });
  //handleStream(stream);
  analyze(stream);
}

function analyze(stream) {
  const audio = document.querySelector("audio");
  audio.srcObject = localAudioStream;
  //audio.play();
  audio.muted = false;
  
  //console.log(audio.srcObject);

  console.log("Analyse called");
  const canvas = document.getElementById("output_canvas");
  const canvasCtx = canvas.getContext("2d");

  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();

  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);
  //console.log(source);
  //console.log(analyser);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const WIDTH = 400;
  const HEIGHT = 200;
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);


  
  function draw() {
    //console.log("draw started");
    drawVisual = requestAnimationFrame(draw);
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
      //console.log(dataArray);
      
      //send results to OBS Browser Source
      obs.call("CallVendorRequest", {
        vendorName: "obs-browser",
      requestType: "emit_event",
      requestData: {
        event_name: "audio-input",
        event_data: { dataArray},
      },
    });
    
    //send results to Advanced Scene Switcher
  //  const AdvancedSceneSwitcherMessage = JSON.stringify(dataArray)
  //   obs.call("CallVendorRequest", {
  //     vendorName: "AdvancedSceneSwitcher",
  //     requestType: "AdvancedSceneSwitcherMessage",
  //     requestData: {
  //       "message": dataArray,
  //     },
  //   });
  }
}
  draw();
}
