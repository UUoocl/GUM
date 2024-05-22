console.log("Document Loaded");

let peerConnections = [];
let offer, answer, numberOfPeerConnections, peerIndex;

//RTC settings
const targetIDinput = document.getElementById("pcName");
targetIDinput.addEventListener("change", setRTCid);
setRTCid();
async function setRTCid() {
  rtcID = document.getElementById("pcName").value;
}

//start webRTC
const rtcButton = document.getElementById("rtcButton");
rtcButton.addEventListener("click", init);


    async function init() {
      console.log("rtc process started", rtcType);
      
      peerIndex = 0;
      numberOfPeerConnections = document.getElementById("pcNumber").value;
      
      console.log(numberOfPeerConnections);
      createPeerConnection(peerIndex);
    }
      
    function createPeerConnection(i){
      console.log(`create PC ${rtcID}_${i}`)
      peerConnections[i] = new RTCPeerConnection();
      
      //add video track to host
      if (rtcType.includes("Video")) {
        localStream.getTracks().forEach((track) => {
            peerConnections[i].addTrack(track, localStream);
        });
      }
      
      //add audio track to host
      if (rtcType.includes("Audio")) {
        localAudioStream.getTracks().forEach((track) => {
            peerConnections[i].addTrack(track, localAudioStream);
        });
      }
      
      //create webRTC connection offers
        createOffer(i);
    }
  
    
    //createOffer
    async function createOffer(i) {

      peerConnections[i].onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
        if (event.candidate) {
          console.log("create offer", offer);
          console.log(`create offer rtc-offer-${rtcID}_${i}`);
          
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
      await obs.on("CustomEvent", async function (event) {
        console.log(`rtc answer from ${rtcID}_${i}`, event);
        if (event.event_name === `rtc-answer-${rtcID}_${i}`) {
          let answer = JSON.parse(event.event_data.answerMessage);
          if (!peerConnections[i].currentRemoteDescription) {
            await peerConnections[i].setRemoteDescription(answer);
            await rtcConnectionComplete(i);
          }
        }
      });
    }
    
    async function rtcConnectionComplete(i) {
      const msg = "rtc connected";
      await obs.call("CallVendorRequest", {
        vendorName: "obs-browser",
        requestType: "emit_event",
        requestData: {
          event_name: `rtc-connected-${rtcID}_${i}`,
          event_data: { msg },
        },
      });
      console.log("rtc connected sent");
     peerIndex++
     console.log(`create a PC if ${peerIndex} < ${numberOfPeerConnections} `, peerIndex < numberOfPeerConnections)
     if(peerIndex < numberOfPeerConnections){
      createPeerConnection(peerIndex);
     }
    }
    
    //refresh webRTC target browsers
    const refreshRTCbutton = document.getElementById("refreshRTCbrowsers");
    refreshRTCbutton.addEventListener("click", refreshOBSbrowsers);
    
    //send websocket details to the webRTC sources
    
    //targets are connected to the webSocket server
    
