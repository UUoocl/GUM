var eltWidth,
  eltHeight,
  canvasElement
console.log("pose-broadcast started")
//add canvas element
var canvasElement = document.createElement("canvas");
canvasElement.setAttribute("class", "output_canvas");
canvasElement.setAttribute("id", "output_canvas");
canvasElement.setAttribute(
  "style",
  "position: absolute; left: 0px; top: 0px;"
);

document.body.prepend(canvasElement);

var v = document.getElementById("videoStream");

  v.addEventListener(
    "loadedmetadata",
    function (e) {
      (eltWidth = this.videoWidth), (eltHeight = this.videoHeight);
     // console.log(`width: ${eltWidth}`);
     // console.log(`height: ${eltHeight}`);
      canvasElement.setAttribute("width", eltWidth);
      canvasElement.setAttribute("height", eltHeight);
    },
    false
  );
  
  import {
     PoseLandmarker,
     FilesetResolver,
     DrawingUtils,
  } from "../../mediaPipe_Tasks/tasks-vision/vision_bundle.mjs"
  //console.log("listening for rtc-connected-",rtcID )
  window.addEventListener(`rtc-connected-${rtcID}`, function (event) {
  //console.log("Module started");
  
  var poseLandmarker = undefined;
  
  async function createPoseLandmarker(){
    const vision = await FilesetResolver.forVisionTasks(
      "../mediapipe_tasks/tasks-vision/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `../mediapipe_Models/pose_landmarker_full.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      outputSegmentationMasks: 0,
    }).then((poseLandmarker)=>{
      var lastVideoTime = -1;
            
      const video = document.getElementById("videoStream");
      const canvasElement = document.getElementById("output_canvas");
      const canvasCtx = canvasElement.getContext("2d");
      const drawingUtils = new DrawingUtils(canvasCtx);
      
      renderLoop();
      
      function renderLoop() {
        let startTimeMs = performance.now();
        if (video.currentTime !== lastVideoTime) {
          let poseLandmarkerResult = poseLandmarker.detectForVideo(
            video,
            startTimeMs
          );
          poseLandmarkerResult = poseLandmarkerResult.landmarks[0];
          //Draw landmarks on screen.
          lastVideoTime = video.currentTime;
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          drawingUtils.drawLandmarks(poseLandmarkerResult);
          drawingUtils.drawConnectors(
            poseLandmarkerResult,
            PoseLandmarker.POSE_CONNECTIONS
          );
                   
          //processResults(poseLandmarkerResult.landmarks[0]);
          //send results to OBS Browser Source
          obs.call("CallVendorRequest", {
            vendorName: "obs-browser",
            requestType: "emit_event",
            requestData: {
              event_name: "pose-landmarks",
              event_data: { poseLandmarkerResult },
            },
          });
          
          //send results to Advanced Scene Switcher
          const AdvancedSceneSwitcherMessage = JSON.stringify(poseLandmarkerResult);
          obs.call("CallVendorRequest", {
            vendorName: "AdvancedSceneSwitcher",
            requestType: "AdvancedSceneSwitcherMessage",
            requestData: {
              message: AdvancedSceneSwitcherMessage,
            },
          });
          
          //console.log(poseLandmarkerResult);
          
        }
        canvasCtx.restore();
        window.requestAnimationFrame(renderLoop);
      }
    })
  }
    createPoseLandmarker();
  })