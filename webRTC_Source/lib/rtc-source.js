console.log("Document Loaded");
var setupDetails, rtcID, rtcVideo="", rtcAudio="", rtcType="";



let localStream;
let offer, answer;

OBSconnect(); 

async function OBSconnect(){
  console.log("connection called")
  await connectOBS(obs)
  //connect
  await sendWSSdetails()
  
  // //refresh browser
  // let SceneItems = await obs.call("GetSceneItemList",{
  //   sceneName: "rtc_target"
  // })

  // SceneItems = SceneItems.sceneItems
  // await SceneItems.filter(async (item) => {
  //   if(item.inputKind == "browser_source"){
  //     await obs.call("PressInputPropertiesButton",{
  //     inputUuid: item.sourceUuid,
  //     propertyName: "refreshnocache"
  //   });
  // }})


  loadRenderer();
  
};

async function loadRenderer() {
  //get obs ws socket details
  
  // IP = setupDetails.websocketIP;
  // PORT = setupDetails.websocketPort;
  // PW = setupDetails.websocketPassword;
  
  let pname = window.location.pathname
  clientID = pname.split("-").pop().replace(".html", "")
  console.log(clientID)
  rtcID = clientID;
  
  const videoButton = document.getElementById("videoButton");
  videoButton.addEventListener("click", selectVideo);
  
  const audioButton = document.getElementById("audioButton");
  audioButton.addEventListener("click", selectAudio);
  
  const rtcButton = document.getElementById("rtcButton");
  rtcButton.addEventListener("click", init);
  
  async function selectVideo(){
    rtcVideo = "Video" 
    document.getElementById("clientInfo").innerText = `Sending ${rtcAudio}${rtcVideo} to client ID "${rtcID}"`
  }
  
  async function selectAudio(){
    rtcAudio = "Audio" 
    document.getElementById("clientInfo").innerText = `Sending ${rtcAudio}${rtcVideo} to client ID "${rtcID}"`
  }
}

async function sendWSSdetails(){
  const event_name = `ws-details-for-client-${rtcID}`;
  console.log(event_name);
  await obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: event_name,
      event_data: { wssDetails },
    },
  });
}



obs.on("CustomEvent", function (event) {
  console.log("wss response", event);
  if (event.event_name === `client-connected-${rtcID}`) {
    console.log("wss connection successful")
  }
});

var peerConnections=[];
async function init() {
  //let init = async () => {
    var i=0;
    const numberOfPeerConnections = document.getElementById("pcNumber").value
    
    while(i<numberOfPeerConnections){
      peerConnections[i] = new RTCPeerConnection();
      i++
    }

    console.log(peerConnections)
    //get a video stream
    rtcType = `${rtcAudio}${rtcVideo}`
    console.log("init started", rtcType)
    if (rtcType.includes("Video")) {
      console.log("Video stream");
      console.log(navigator.mediaDevices.getSupportedConstraints());
      localStream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: {
          cursor: 'never',
          displaySurface: 'application' 
      },
      });
      //add video track to host
      localStream.getTracks().forEach((track) => {
        i=0
        while(i<numberOfPeerConnections){
          peerConnections[i].addTrack(track, localStream);
          i++
        }
      });
    }
    
    //add audio stream
    if (rtcType.includes("Audio")) {
      console.log("Audio stream");
      var localAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      
      //add audio track to host
      localAudioStream.getTracks().forEach((track) => {
        i=0
        while(i<numberOfPeerConnections){
          peerConnections[i].addTrack(track, localAudioStream);
          i++
        }
      });
    }
     
    i=0
        while(i<numberOfPeerConnections){
          await createOffer(i);
          i++
        }
  }
  
  //createOffer
  async function createOffer(i){
    peerConnections[i].onicecandidate = async (event) => {
      //Event that fires off when a new offer ICE candidate is created
      if (event.candidate) {
        console.log("create offer", offer);
        console.log(`messageName rtc-offer-${rtcID}_${i}`);
        
        const offerMessage = JSON.stringify(peerConnections[i].localDescription);
        await obs.call("CallVendorRequest", {
          vendorName: "obs-browser",
          requestType: "emit_event",
          requestData: {
            event_name: `rtc-offer-${rtcID}_${i}`,
            event_data: { offerMessage },
          },
        });
      }
    };
    
    const offer = await peerConnections[i].createOffer();
    await peerConnections[i].setLocalDescription(offer);
    
    //listen for answer message
      obs.on("CustomEvent", function (event) {
          console.log("rtc answer", event);
          if (event.event_name === `rtc-answer-${rtcID}_${i}`) {
              let answer = JSON.parse(event.event_data.answerMessage);
              if (!peerConnections[i].currentRemoteDescription) {
                  peerConnections[i].setRemoteDescription(answer);
                  rtcConnectionComplete(i);
                }
              }
            });
  };

  async function rtcConnectionComplete(i){
    const msg="rtc connected"
    await obs.call("CallVendorRequest", {
      vendorName: "obs-browser",
      requestType: "emit_event",
      requestData: {
        event_name: `rtc-connected-${rtcID}_${i}`,
        event_data: { msg },
      },
    });
    console.log("rtc connected sent")
  }