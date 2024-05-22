const obs = new OBSWebSocket();

//connect to OBS wss
window.addEventListener(`ws-details`, async function (event) {
  console.log("message received: ", event)
  
  //event wss details
  const websocketIP = event.detail.wssDetails.IP;
  const websocketPort = event.detail.wssDetails.PORT;
  const websocketPassword = event.detail.wssDetails.PW;

//async function connectOBS(websocketIP,websocketPort,websocketPassword) {
// const websocketIP = wssDetails.IP
// const websocketPort = wssDetails.PORT
// const websocketPassword = wssDetails.PW

 //connect to OBS web socket server
 try {
   const {
     obsWebSocketVersion,
     negotiatedRpcVersion
   } = await obs.connect(`ws://${websocketIP}:${websocketPort}`, websocketPassword, {
     rpcVersion: 1
   });
   console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
   //document.title = "connection set";
 } catch (error) {
   console.error('Failed to connect', error.code, error.message);
 }
 obs.on('error', err => {
   console.error('Socket error:', err)
 })
 console.log(`ws://${websocketIP}:${websocketPort}`)
 return obs;
}
)