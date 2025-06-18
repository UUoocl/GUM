console.log("Document Loaded");

let setupDetails,
rtcID,
rtcVideo = "",
rtcAudio = "",
rtcType = "";

let localStream;
let localAudioStream;

//Set Audio and Video Elements 
const videoButton = document.getElementById("videoButton");
videoButton.addEventListener("click", selectVideo);

async function selectVideo() {
  rtcVideo = "Video";
  document.getElementById("clientInfo").innerText = `Sending ${rtcAudio}${rtcVideo} to client ID "${rtcID}"`;
  document.getElementById("captureSource").value = `Start ${rtcAudio}${rtcVideo} Capture`;
}

const audioButton = document.getElementById("audioButton");
audioButton.addEventListener("click", selectAudio);

async function selectAudio() {
  rtcAudio = "Audio";
  document.getElementById("clientInfo").innerText = `Sending ${rtcAudio}${rtcVideo} to client ID "${rtcID}"`;
  document.getElementById("captureSource").value = `Start ${rtcAudio}${rtcVideo} Capture`;
}

//start audio video capture
const avButton = document.getElementById("captureSource");
avButton.addEventListener("click", getAV);

async function getAV(){
  console.log("getAV started", rtcType);
  //get a video stream
  rtcType = `${rtcAudio}${rtcVideo}`;
  if (rtcType.includes("Video")) {
    console.log("Video stream");
    console.log(navigator.mediaDevices.getSupportedConstraints());
    localStream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: {
        cursor: "never",
        displaySurface: "application",
      },
    });
    
  }
  console.log(localStream)
  //add audio stream
  if (rtcType.includes("Audio")) {
    console.log("Audio stream");
    localAudioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    startAudioAnalysis();
  }
  const videoStreamElem = document.getElementById("videoStream")
  console.log(videoStreamElem, localStream)
  videoStreamElem.autoplay = true
  videoStreamElem.srcObject = localStream
  videoStreamElem.hidden = false;

}