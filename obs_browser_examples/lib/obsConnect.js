document
  .getElementById("WSconnectButton")
  .addEventListener("click", connectOBS);

var wssDetails;
var obs = new OBSWebSocket();
async function connectOBS() {
  const websocketIP = document.getElementById("IP").value;
  const websocketPort = document.getElementById("Port").value;
  const websocketPassword = document.getElementById("PW").value;

  //connect to OBS web socket server
  try {
    const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
      `ws://${websocketIP}:${websocketPort}`,
      websocketPassword,
      {
        rpcVersion: 1,
      }
    );
    console.log(
      `Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
    );

    document.getElementById("WSconnectButton").style.background = "#00ff00";
    wssDetails = {
      IP: websocketIP,
      PORT: websocketPort,
      PW: websocketPassword,
    };
    //send websocket server connection details to OBS browser source
    await obs.call("CallVendorRequest", {
      vendorName: "obs-browser",
      requestType: "emit_event",
      requestData: {
        event_name: "ws-details",
        event_data: { wssDetails },
      },
    });
  } catch (error) {
    console.error("Failed to connect", error.code, error.message);
    document.getElementById("WSconnectButton").style.background = "#ff0000";
  }
  obs.on("error", (err) => {
    console.error("Socket error:", err);
  });
  console.log(`ws://${websocketIP}:${websocketPort}`);

  return obs;
}

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