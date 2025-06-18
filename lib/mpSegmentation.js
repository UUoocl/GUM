// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//      http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { ImageSegmenter, FilesetResolver } from "../mediapipe_tasks/tasks-vision/vision_bundle.mjs";
// Get DOM elements
const video = document.getElementById("videoStream");
const canvasElement = document.getElementById("segmentationCanvas");
const canvasCtx = canvasElement.getContext("2d");
const webcamPredictions = document.getElementById("webcamPredictions");
const demosSection = document.getElementById("demos");
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";
let runningMode = "VIDEO";
const resultWidthHeigth = 256;
let imageSegmenter;
let labels;
const legendColors = [
    [255,255, 255, 255],//white
    [0, 0, 0, 255]//black
];
const createImageSegmenter = async () => {
    const vision = await FilesetResolver.forVisionTasks("mediapipe_tasks/tasks-vision/wasm");
    imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "mediapipe_models/selfie_segmenter.tflite",
            
            delegate: "GPU"
        },
        runningMode: runningMode,
        outputCategoryMask: true,
        outputConfidenceMasks: false
    });
    labels = imageSegmenter.getLabels();
   // demosSection.classList.remove("invisible");
};
createImageSegmenter();
// const imageContainers = document.getElementsByClassName("segmentOnClick");
// // Add click event listeners for the img elements.
// for (let i = 0; i < imageContainers.length; i++) {
//     imageContainers[i]
//         .getElementsByTagName("img")[0]
//         .addEventListener("click", handleClick);
// }
/**
 * Demo 1: Segmented images on click and display results.
 */
// let canvasClick;
// async function handleClick(event) {
//     // Do not segmented if imageSegmenter hasn't loaded
//     if (imageSegmenter === undefined) {
//         return;
//     }
//     canvasClick = event.target.parentElement.getElementsByTagName("canvas")[0];
//     canvasClick.classList.remove("removed");
//     canvasClick.width = event.target.naturalWidth;
//     canvasClick.height = event.target.naturalHeight;
//     const cxt = canvasClick.getContext("2d");
//     cxt.clearRect(0, 0, canvasClick.width, canvasClick.height);
//     cxt.drawImage(event.target, 0, 0, canvasClick.width, canvasClick.height);
//     event.target.style.opacity = 255;
//     // if VIDEO mode is initialized, set runningMode to IMAGE
//     if (runningMode === "VIDEO") {
//         runningMode = "IMAGE";
//         await imageSegmenter.setOptions({
//             runningMode: runningMode
//         });
//     }
//     // imageSegmenter.segment() when resolved will call the callback function.
//     imageSegmenter.segment(event.target, callback);
// }
// function callback(result) {
//     const cxt = canvasClick.getContext("2d");
//     const { width, height } = result.categoryMask;
//     let imageData = cxt.getImageData(0, 0, width, height).data;
//     canvasClick.width = width;
//     canvasClick.height = height;
//     let category = "";
//     const mask = result.categoryMask.getAsUint8Array();
//     for (let i in mask) {
//         if (mask[i] > 0) {
//             category = labels[mask[i]];
//         }
//         const legendColor = legendColors[mask[i] % legendColors.length];
//         imageData[i * 4] = (legendColor[0] + imageData[i * 4]);
//         imageData[i * 4 + 1] = (legendColor[1] + imageData[i * 4 + 1]);
//         imageData[i * 4 + 2] = (legendColor[2] + imageData[i * 4 + 2]);
//         imageData[i * 4 + 3] = (legendColor[3] + imageData[i * 4 + 3]);
//     }
//     const uint8Array = new Uint8ClampedArray(imageData.buffer);
//     const dataNew = new ImageData(uint8Array, width, height);
//     cxt.putImageData(dataNew, 0, 0);
//     const p = event.target.parentNode.getElementsByClassName("classification")[0];
//     p.classList.remove("removed");
//     p.innerText = "Category: " + category;
// }
function callbackForVideo(result) {
    let imageData = canvasCtx.getImageData(0, 0, video.videoWidth, video.videoHeight).data;
    const mask = result.categoryMask.getAsFloat32Array();
    let j = 0;
    for (let i = 0; i < mask.length; ++i) {
        const maskVal = mask[i];
        const legendColor = legendColors[maskVal];
        imageData[j] = (legendColor[0]);
        imageData[j + 1] = (legendColor[1]);
        imageData[j + 2] = (legendColor[2]);
        imageData[j + 3] = (legendColor[3]);
        j += 4;
    }
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const dataNew = new ImageData(uint8Array, video.videoWidth, video.videoHeight);
    canvasCtx.putImageData(dataNew, 0, 0);
    if (true) {
        window.requestAnimationFrame(predictWebcam);
    }
}
/********************************************************************
// Demo 2: Continuously grab image from webcam stream and segmented it.
********************************************************************/
// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// Get segmentation from the webcam
let lastWebcamTime = -1;
async function predictWebcam() {
    if (video.currentTime === lastWebcamTime) {
        //if (webcamRunning === true) {
            window.requestAnimationFrame(predictWebcam);
        //}
        return;
    }
    lastWebcamTime = video.currentTime;
    canvasCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    // Do not segmented if imageSegmenter hasn't loaded
    if (imageSegmenter === undefined) {
        return;
    }
    // if image mode is initialized, create a new segmented with video runningMode
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await imageSegmenter.setOptions({
            runningMode: runningMode
        });
    }
    let startTimeMs = performance.now();
    // Start segmenting the stream.
    imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
}
// Enable the live webcam view and start imageSegmentation.
async function enableCam() {
    if (imageSegmenter === undefined) {
        return;
    }
    // if (webcamRunning === true) {
    //     webcamRunning = false;
    //     enableWebcamButton.innerText = "ENABLE SEGMENTATION";
    // }
    // else {
    //     webcamRunning = true;
    //    enableWebcamButton.innerText = "DISABLE SEGMENTATION";
    //}

    // Activate the webcam stream.
    video.srcObject = localStream;
    video.addEventListener("loadeddata", predictWebcam);
    rtcSegmentInit();
}
// If webcam supported, add event listener to button.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("startSegmentation");
    enableWebcamButton.setAttribute("value","Start Image Segmentation")
    enableWebcamButton.addEventListener("click", enableCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}
