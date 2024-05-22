var eltWidth,
  eltHeight,
  poseCanvasElement
console.log("pose-broadcast started")
//add canvas element
var poseCanvasElement = document.createElement("canvas");
poseCanvasElement.setAttribute("class", "output_canvas");
poseCanvasElement.setAttribute("id", `pose_canvas`);
poseCanvasElement.setAttribute(
  "style",
  "height: 100px"
);

document.getElementById('poseLandmarksCanvas').append(poseCanvasElement);

var v = document.getElementById("videoStream");

  v.addEventListener(
    "loadedmetadata",
    function (e) {
      (eltWidth = this.videoWidth), (eltHeight = this.videoHeight);
     // console.log(`width: ${eltWidth}`);
     // console.log(`height: ${eltHeight}`);
     poseCanvasElement.setAttribute("width", eltWidth);
     poseCanvasElement.setAttribute("height", eltHeight);
    },
    false
  );
  
  import {
     PoseLandmarker,
     FilesetResolver,
     DrawingUtils,
  } from "../mediapipe_tasks/tasks-vision/vision_bundle.mjs"
  //console.log("listening for rtc-connected-",rtcID )
 //console.log("Module started");
  
  var poseLandmarker = undefined;
  
  async function createPoseLandmarker(){
    const vision = await FilesetResolver.forVisionTasks(
      "mediapipe_tasks/tasks-vision/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `mediapipe_models/pose_landmarker_full.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      outputSegmentationMasks: 0,
    }).then((poseLandmarker)=>{
      var lastVideoTime = -1;
            
      const video = document.getElementById("videoStream");
      const canvasElement = document.getElementById("pose_canvas");
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
          drawingUtils.drawLandmarks(poseLandmarkerResult,{color: "#FF0000"});
          drawingUtils.drawConnectors(
            poseLandmarkerResult,
            PoseLandmarker.POSE_CONNECTIONS,
            {color:"#00FF00"}
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
          // const AdvancedSceneSwitcherMessage = JSON.stringify(poseLandmarkerResult);
          // obs.call("CallVendorRequest", {
          //   vendorName: "AdvancedSceneSwitcher",
          //   requestType: "AdvancedSceneSwitcherMessage",
          //   requestData: {
          //     message: AdvancedSceneSwitcherMessage,
          //   },
          // });
          
          //console.log(poseLandmarkerResult);
          
        }
        canvasCtx.restore();
        window.requestAnimationFrame(renderLoop);
      }
    })
  }
    createPoseLandmarker();
