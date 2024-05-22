 console.log("script loaded")
    //console.error("Test log")
    var peerConnection = new RTCPeerConnection();
    peerConnection.onicecandidate = e => onIceCandidate(peerConnection, e);
    var localStream;
    var remoteStream;
    var clientID, offer, answer

    //get client ID from file name
    let pname = window.location.pathname
    clientID = pname.split("-").pop().replace(".html", "")
    //ID
    wssID=clientID.split("_")[0]
    //ID_Index
    rtcID= clientID
    console.log("rtcID",rtcID)
    console.log("wssID",wssID)

    // obs.call("BroadcastCustomEvent", {
    //   eventData: {
    //     event_name: `client-connected-${wssID}`
    //   },
    // });


    //listen for start rtc message
    //window.addEventListener(`rtc-connected-${rtcID}`, function (event) {
    playRemoteStream()
    async function playRemoteStream() {
      console.log(`play stream ${rtcID}`)

      remoteStream = new MediaStream();

      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          console.log("event  ", event)
          console.log("remotestream  ", remoteStream)
          if (event.track.kind == "video") {
            //document.getElementById("videoStream").srcObject = remoteStream;
            remoteStream.addTrack(track);
            const video = document.getElementById("videoStream");
            video.autoplay = true;
            video.srcObject = remoteStream;
            console.log("video source object", video.srcObject)
            console.log("video element", video)
            //video.classList.remove("hide");
          }
          if (event.track.kind == "audio") {
            remoteStream.addTrack(track);
            const audio = document.getElementById("audioStream");
            audio.autoplay = true;
            audio.srcObject = remoteStream;
            console.log("audio source object", audio.srcObject)
            console.log("audio element", audio)
            // audio.classList.remove("hide");
          }
        });
      };
    }

    //create and send webRTC Answer to host
    let createAnswer = async () => {

      offer = JSON.parse(offer);

      peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if (event.candidate) {
          console.log("Adding answer candidate...:", event.candidate);

          //send answer to host 
          answerMessage = JSON.stringify(peerConnection.localDescription)
          console.log(`send Answer ${rtcID}`)
          obs.call("BroadcastCustomEvent", {
            eventData: {
              event_name: `rtc-answer-${rtcID}`,
              event_data: { answerMessage },
            },
          });
        }
      };

      await peerConnection.setRemoteDescription(offer);

      let answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
    };

    //listen for webRTC offer message
    window.addEventListener(`rtc-offer-${rtcID}`, function (event) {
      console.log(`${rtcID} received offer `,event);
      offer = JSON.stringify(JSON.parse(event.detail.offerMessage))
      createAnswer()
    }); 