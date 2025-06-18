//Connect an OBS browser source to the OBS Web Socket Server(WSS).
//1. Check if the URL includes WSS details
//2. Check if the browser local storage includes WSS details
//3. listen for WSS details message
//4. listen for a button press to start 

var obs = new OBSWebSocket();

window.addEventListener('DOMContentLoaded', async function() {
  obs.connected = false;

  //get URL parameters
  const params = new URLSearchParams(window.location.search);
  //get local storage
  const localStorageWssDetails = localStorage.getItem('wssDetails');
  switch(true){
    //1. check if the URL has WSS details
    case params.has("wsspw"):
        wssDetails = {
          IP: params.get("wssip"),
          PORT: params.get("wssport"),
          PW: params.get("wsspw"),
        };
        const paramsConnected = await connectOBS(wssDetails);    
        console.log("paramsConnected",paramsConnected)
        if(paramsConnected === 'connected'){break;}
    //2. check local storage for OBS Web Socket Details
    case (localStorageWssDetails !== null):
      console.log("try saved websocket details")
      const result = await connectOBS(JSON.parse(window.localStorage.getItem('wssDetails')))    
      if(result === 'connected'){break;}
  }
  //
})

//3. get web socket details from a message
window.addEventListener(`ws-details`, async function (event) {
  //event wss details
  console.log("message received: ", event)
  if(event.detail.hasOwnProperty('wssDetails')){
    await connectOBS(event.detail.wssDetails);
  }
})

//4. listen for a button press to start 
async function wsConnectButton() {
  //change to this.
  wssDetails = {
    IP: document.getElementById("IP").value,
    PORT: document.getElementById("Port").value,
    PW: document.getElementById("PW").value,
  };

  localStorage.setItem("wssDetails", JSON.stringify(wssDetails))

  await connectOBS(wssDetails).then(async (result) => {
    if (result === "failed") {
      document.getElementById("WSconnectButton").style.background = "#ff0000";
    }
  });
}


//connect to OBS web socket server
async function connectOBS(wssDetails) {
  try {
    //avoid duplicate connections
    await disconnect();

    //connect to OBS Web Socket Server
    const { obsWebSocketVersion, negotiatedRpcVersion } = 
    await obs.connect(`ws://${wssDetails.IP}:${wssDetails.PORT}`,wssDetails.PW,{rpcVersion: 1,});
    console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
    
    localStorage.setItem("wssDetails",JSON.stringify(wssDetails))
    
    return "connected";
  } catch (error) {
    console.error("Failed to connect", error.code, error.message);
    //localStorage.setItem("wssDetails",null)
    return "failed";
  }
  //console.log(`ws://${wssDetails.IP}:${wssDetails.PORT}`);
}

async function disconnect () {
  try{
    await obs.disconnect()
    console.log("disconnected")
    obs.connected = false
  } catch(error){
    console.error("disconnect catch",error)
  }
  
}

obs.on('ConnectionOpened', () => {
  console.log('Connection to OBS WebSocket successfully opened');
  obs.status = "connected";
});

obs.on('ConnectionClosed', () => {
  console.log('Connection to OBS WebSocket closed');
  obs.status = "disconnected";
});

obs.on('ConnectionError', err => {
  console.error('Connection to OBS WebSocket failed', err);
});

obs.on("Identified", async (data) => {
  obs.connected = true;
  console.log("OBS WebSocket successfully identified", data);
});


obs.on("error", (err) => {
  console.error("Socket error:", err);
});

async function sendWSSdetails() {
  const event_name = `ws-details-for-client-${rtcID}`;
  console.log("event_name",event_name, wssDetails);
  await obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: event_name,
      event_data: { wssDetails },
    },
  })
    }

    //TODO: make refresh all browsers in all scenes, all browsers in 1 scene, 1 browser
async function refreshOBSbrowsers(){
      
  let SceneItems = await obs.call("GetSceneItemList", {
    sceneName: "rtc_target",
  });
  
  SceneItems = SceneItems.sceneItems;
  console.log(SceneItems)
  const browsers = await SceneItems.filter(async (item) => {
    console.log("item",item)
    if (item.inputKind == "browser_source") {
      await obs.call("PressInputPropertiesButton", {
        inputUuid: item.sourceUuid,
        propertyName: "refreshnocache",
      });
    }
  });
  setTimeout(connectOBS,1000)
  console.log('browser refresh complete')
}
