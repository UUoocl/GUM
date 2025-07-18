window.addEventListener("pose-landmarks", function (event) {
  //console.log("message received: ",event)
  document.getElementById("poseResults").innerText = JSON.stringify(
    event.detail.poseLandmarkerResult
  );
});

window.addEventListener("hand-landmarks", function (event) {
  //console.log("message hand received: ",event)
  document.getElementById("handResults").innerText = JSON.stringify(
    event.detail.handLandmarkEventData
  );
});

window.addEventListener("face-landmarks", function (event) {
  //console.log("message received: ",event)
  document.getElementById("faceResults").innerText = JSON.stringify(
    event.detail.faceLandmarkerResult
  );
});
  
window.addEventListener("speechRecognition", function (event) {
  console.log("speech Recognition message received: ",event)
  document.getElementById("speechRecognition").innerText = JSON.stringify(
    event.detail.result
  );
});

  window.addEventListener("sentimentResult", function (event) {
    //console.log("sentiment received: ",event)
    document.getElementById("sentimentResult").innerText = JSON.stringify(
      event.detail.result
    );
  });
  
  window.addEventListener("audio-input", function (event) {
    //console.log("audio received: ",event)
    document.getElementById("audioFFT").innerText = JSON.stringify(event.detail);
  });
  
  window.addEventListener("midi-message", function (event) {
    //console.log("midi received: ",event)
    document.getElementById("midiMessage").innerText = JSON.stringify(
      event.detail
    );
  });
  
  window.addEventListener("gamepad-message", function (event) {
    //console.log("gamepad-message received: ",event)
    document.getElementById("gamepad-message").innerText = JSON.stringify(
      event.detail.gamepadEvent
    );
  });
  
  window.addEventListener("osc-message", function (event) {
    //console.log("osc-message received: ", event);
    document.getElementById("osc-message").innerText = JSON.stringify(
      event.detail.webSocketMessage
    );
  });
  
  window.addEventListener("ptz-position-message", function (event) {
    //console.log("ptz-position-message received: ", event);
    document.getElementById("ptz-position-message").innerText = JSON.stringify(
      event.detail.ptzMessage
    );
  });
  
  
  document.getElementById("lowerHands").addEventListener("click", function callZoom() {
  //console.log("lower hands")
    obs.call("BroadcastCustomEvent", {
      eventData: {
        event_name: `OSC-out`,
        osc_name:'zoomOSC',
  //      command with no arguments
       address: "/zoom/lowerAllHands",
  
      },
    });
  })
  document.getElementById("turnOnVideo").addEventListener("click", function callZoom() {
  console.log("lower hands")
    obs.call("BroadcastCustomEvent", {
      eventData: {
        event_name: `OSC-out`,
        osc_name:'zoomOSC', 
        //command with 1 arguments
        address: "/zoom/userName/videoOn",
        "arg1":"Jonathan Wood"
      },
    });
  })
  document.getElementById("sendChat").addEventListener("click", function callZoom() {
    obs.call("BroadcastCustomEvent", {
      eventData: {
        event_name: `OSC-out`,
        osc_name:'zoomOSC',
        address: "/zoom/userName/chat",
        "arg1":"Jonathan Wood",
        "arg2":"Hello!"
      },
    });
  })
  
  document.getElementById("getPTZ").addEventListener("click", () => {
    obs.call("BroadcastCustomEvent", {
      eventData: {
        event_name: `OSC-out`,
        osc_name: 'ptz',
        // address: "/OBSBOT/WebCam/General/GetDeviceInfo",
        // address: "/OBSBOT/WebCam/General/SetGimbalUp",
        // address: "/OBSBOT/WebCam/General/GetGimbalPosInfo",
        address: "/OBSBOT/WebCam/General/SetZoomMax",
        //address: "/OBSBOT/WebCam/General/Connected",
        "arg1": 0,
        // "arg2": 50,

      },
    });
  })