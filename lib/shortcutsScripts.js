const ptzInput = document.getElementById("ptzValues");
const mouseInput = document.getElementById("mouseCoordinates");
ptzInput.addEventListener("click", ptzSend);
mouseInput.addEventListener("click", mouseSend);

function ptzSend() {
  console.log("ptz input clicked");
  console.log(ptzInput.value);
  let shortcutsResult = ptzInput.value;
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "ptz-message",
      event_data: { shortcutsResult },
    },
  });
}
function mouseSend() {
  console.log("mouse input clicked");
  console.log(mouseInput.value);
  let shortcutsResult = mouseInput.value;
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "mouse-message",
      event_data: { shortcutsResult },
    },
  });
}
