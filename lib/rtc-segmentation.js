var segmentID = "Segment";
let segmentPeerConnections = [];
let segmentOffer, segmentAnswer, segmentPeerIndex;
console.log("segment rtc Loaded");

async function rtcSegmentInit() {
let segmentStream = document.getElementById("segmentationCanvas").captureStream();

//RTC settings
// const targetIDinput = document.getElementById("pcName");
// targetIDinput.addEventListener("change", setRTCid);
console.log("segmentID = ", segmentID)

//start webRTC
// const rtcButton = document.getElementById("rtcButton");
// rtcButton.addEventListener("click", init);

      console.log("rtc process started");
      
      segmentPeerIndex = 0;
      //numberOfPeerConnections = document.getElementById("pcNumber").value;
      
      //console.log(numberOfPeerConnections);
      segmentCreatePeerConnection(segmentPeerIndex, segmentStream);
    }
      
    function segmentCreatePeerConnection(i, segmentStream){
      console.log(`create PC ${segmentID}_${i}`)
      segmentPeerConnections[i] = new RTCPeerConnection();
      
      //add video track to host
        segmentStream.getTracks().forEach((track) => {
          segmentPeerConnections[i].addTrack(track, segmentStream);
        });

      //create webRTC connection offers
        createSegmentOffer(i);
      }
    //createOffer
    async function createSegmentOffer(i) {

      segmentPeerConnections[i].onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
        if (event.candidate) {
          console.log("create offer", segmentOffer);
          console.log(`create offer rtc-offer-${segmentID}_${i}`);
          
          const offerMessage = JSON.stringify(segmentPeerConnections[i].localDescription);
          await obs.call("CallVendorRequest", {
            vendorName: "obs-browser",
            requestType: "emit_event",
            requestData: {
              event_name: `rtc-offer-${segmentID}_${i}`,
              event_data: { offerMessage },
            },
          });
        }
      };
      
      const segmentOffer = await segmentPeerConnections[i].createOffer();
      await segmentPeerConnections[i].setLocalDescription(segmentOffer);
      
      //listen for answer message
      await obs.on("CustomEvent", async function (event) {
        console.log(`rtc answer from ${segmentID}_${i}`, event);
        if (event.event_name === `rtc-answer-${segmentID}_${i}`) {
          segmentAnswer = JSON.parse(event.event_data.answerMessage);
          if (!segmentPeerConnections[i].currentRemoteDescription) {
            await segmentPeerConnections[i].setRemoteDescription(segmentAnswer);
            await rtcSegmentConnectionComplete(i);
          }
        }
      });
    }
    
    async function rtcSegmentConnectionComplete(i) {
      const msg = "rtc connected";
      await obs.call("CallVendorRequest", {
        vendorName: "obs-browser",
        requestType: "emit_event",
        requestData: {
          event_name: `rtc-connected-${segmentID}_${i}`,
          event_data: { msg },
        },
      });
      console.log("rtc connected sent");
      segmentPeerIndex++
     console.log(`create a PC if ${segmentPeerIndex} < ${segmentNumberOfPeerConnections} `, segmentPeerIndex < segmentNumberOfPeerConnections)
     if(segmentPeerIndex < segmentNumberOfPeerConnections){
      createPeerConnection(segmentPeerIndex);
     }
    }
    
    //refresh webRTC target browsers
    //const refreshRTCbutton = document.getElementById("refreshRTCbrowsers");
    //refreshRTCbutton.addEventListener("click", refreshOBSbrowsers);
    
    //send websocket details to the webRTC sources
    
    //targets are connected to the webSocket server
    
