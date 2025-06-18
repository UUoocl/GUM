let obs = new OBSWebSocket();
obs.connected = false;
let configMap = new Map();


//check local storage for OBS Web Socket Details
//on load, if storage item exists
window.addEventListener('load', async function() {
  if(localStorage.getItem('wssDetails') !== null){
    //try to connect
    console.log("try saved websocket details")
    const wssDetails = JSON.parse(window.localStorage.getItem('wssDetails'));
    setTimeout(() => connectOBS(wssDetails), 2000);
  }

  if (localStorage.getItem("configName")) {
      getLocalStorageConfigOptions();
  }

})

async function wsConnect() {
  const wssDetails = {
    IP: document.getElementById("IP").value,
    PORT: document.getElementById("Port").value,
    PW: document.getElementById("PW").value,
  };

  localStorage.setItem("wssDetails", JSON.stringify(wssDetails))

// Saves config data to retrieve later
configMap.set(`${document.getElementById("configName").value}`,
    {
        obsName: document.getElementById("obsName").value,
        profileName: document.getElementById("profileName").value,
        collectionName: document.getElementById("collectionName").value,
        IP: wssDetails.IP,
        Port: wssDetails.PORT,
        obsPW: wssDetails.PW,
        debugMode: document.getElementById("Debug").checked,
        apiID: document.getElementById("gasID")?.value,
        sheetID: document.getElementById("sheetID")?.value
    })

localStorage.setItem("configName", document.getElementById("configName").value);
const str = JSON.stringify(configMap, replacer)
localStorage.setItem("configName", str);
  
  await connectOBS(wssDetails)
    .then(async (result) => {
      if (result === "failed") {
        document.getElementById("WSconnectButton").style.background = "#ff0000";
    }
  });
}

async function connectOBS(wssDetails) {
  //connect to OBS web socket server
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

function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

function reviver(key, value) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}

function getLocalStorageConfigOptions() {
    //get configurations in local storage
    configMap = JSON.parse(localStorage.getItem("configName"), reviver)

    for (const key of configMap.keys()) {
        const parentElement = document.getElementById("configNameValues");
        const newElement = document.createElement("option");
        newElement.textContent = key;
        parentElement.appendChild(newElement);
    }
}

function getLocalStorageConfigValue(selectedConfig) {
    const config = localStorage.getItem("configName")
    //get configurations in local storage
    configItem = configMap.get(selectedConfig);

    document.getElementById("configName").value = selectedConfig;
    document.getElementById("obsName").value = configItem?.obsName;
    document.getElementById("IP").value = configItem?.IP;
    document.getElementById("Port").value = configItem?.Port;
    document.getElementById("PW").value = configItem?.obsPW;
    document.getElementById("profileName").value = configItem?.profileName;
    document.getElementById("collectionName").value = configItem?.collectionName;
    document.getElementById("Debug").value = configItem?.debugMode;
    document.getElementById("gasID").value = configItem?.apiID;
    document.getElementById("sheetID").value = configItem?.sheetID;
}

function configSelected() {
  console.log(this)
    const selectedValue = this.value;
    // Perform actions based on the selected value

    // Check if the selected value exists in the datalist options
    const datalist = document.getElementById(this.getAttribute('list'));
    let optionFound = false;
    for (let i = 0; i < datalist.options.length; i++) {
        if (selectedValue === datalist.options[i].value) {
            optionFound = true;
            break;
        }
    }

    if (optionFound) {
        console.log("Valid selection from datalist");
        getLocalStorageConfigValue(selectedValue)
    } else {
        console.log("Not a valid selection from datalist");
        //Actions when the input doesn't match any datalist option
    }

    //updateCollectionControlLinks();
}

function obsLaunchCommand(event){
    console.log(window.navigator.platform)
    const obsParameters = document.getElementById("obsData")
    console.log("Parameters",obsParameters)
    console.log("Parameters",obsParameters.PW.value)
    console.log("Parameters",obsParameters.Debug.checked)
    let commandString = '';
    if(window.navigator.platform.startsWith("Mac")){
        commandString = 'open -n -a "';
    }else{
        document.getElementById("openOBSbutton").hidden = true;
        document.getElementById("obsNameLabel").innerText = "Enter OBS app name including path:"
        commandString = '"';
    }
    commandString += obsParameters.obsName.value;
    commandString += '" --args --profile "';
    commandString += obsParameters.profileName.value ;
    commandString += '" --collection "';
    commandString += obsParameters.collectionName.value ;
    commandString += '" --websocket_port "';
    commandString += obsParameters.Port.value ;
    commandString += '" --websocket_password "';
    commandString += obsParameters.PW.value ;
    commandString += '" --multi';
    if(obsParameters.Debug.checked){
        commandString += ' --remote-debugging-port=9222 --remote-allow-origins=http://localhost:9222';
    }
    
//   --websocket_password "Dictionary (password)"
    // const changedElement = event.target;
    // const elementName = changedElement.name;
    // const newValue = changedElement.value;

    // console.log(`Element ${elementName} changed to: ${newValue}`);
    document.getElementById('obsOpenCommand').value = commandString
}

async function copyCode(triggerButton, elementToCopy, buttonText) {
    event.preventDefault()
  
    const button = document.getElementById(triggerButton)
    if(button.innerText.endsWith("Copied")){
        return //copied
    }else{
        let copyText = document.getElementById(elementToCopy).value//"obsOpenCommand");
        await navigator.clipboard.writeText(copyText);
    }

    // visual feedback that task is completed
    button.innerText = `${buttonText} Copied`;

    setTimeout(() => {
        button.innerText = buttonText;
    }, 7000);
}