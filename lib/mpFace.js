var faceEltWidth, faceEltHeight, faceCanvasElement;
console.log("face-broadcast started");
//add canvas element
var faceCanvasElement = document.createElement("canvas");
faceCanvasElement.setAttribute("class", "output_canvas");
faceCanvasElement.setAttribute("id", "face_canvas");
faceCanvasElement.setAttribute("style", "height: 100px");

document.getElementById('faceLandmarks').append(faceCanvasElement);;

var v = document.getElementById("videoStream");

v.addEventListener(
  "loadedmetadata",
  function (e) {
    (faceEltWidth = this.videoWidth), (faceEltHeight = this.videoHeight);
    faceCanvasElement.setAttribute("width", faceEltWidth);
    faceCanvasElement.setAttribute("height", faceEltHeight);
  },
  false
);

import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "../mediapipe_tasks/tasks-vision/vision_bundle.mjs";
  //console.log("Module started");

  let faceLandmarker = undefined;

  async function createFaceLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      "mediapipe_tasks/tasks-vision/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `mediapipe_models/face_landmarker.task`,
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    }).then((faceLandmarker) => {
      var lastVideoTime = -1;
      
      const video = document.getElementById("videoStream");
      const faceCanvasElement = document.getElementById("face_canvas");
      const canvasCtx = faceCanvasElement.getContext("2d");
      const drawingUtils = new DrawingUtils(canvasCtx);

      renderLoop();

      function renderLoop() {
        let startTimeMs = performance.now();
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, faceCanvasElement.width, faceCanvasElement.height);
          
          let faceLandmarkerResult = faceLandmarker.detectForVideo(
            video,
            startTimeMs
          );
          if (faceLandmarkerResult.faceLandmarks) {
            for (const landmarks of faceLandmarkerResult.faceLandmarks) {
              drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                { color: "#C0C0C070", lineWidth: 1 }
              );
              drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                { color: "#FF3030" }
              );
              drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
                { color: "#FF3030" }
              );
              drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                { color: "#30FF30" }
              );
              drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
                { color: "#30FF30" }
              );
              drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
                { color: "#E0E0E0" }
              );
              drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LIPS,
                { color: "#E0E0E0" }
              );
              drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
                { color: "#FF3030" }
              );
              drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
                { color: "#30FF30" }
              );
            }
          }

          //processResults(poseLandmarkerResult.landmarks[0]);
          //send results to OBS Browser Source
          obs.call("CallVendorRequest", {
            vendorName: "obs-browser",
            requestType: "emit_event",
            requestData: {
              event_name: "face-landmarks",
              event_data: { faceLandmarkerResult },
            },
          });

          //send results to Advanced Scene Switcher
          const AdvancedSceneSwitcherMessage =
            JSON.stringify(faceLandmarkerResult);
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
        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(renderLoop);
      }
    });
  }
  createFaceLandmarker();
