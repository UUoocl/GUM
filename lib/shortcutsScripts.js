const ptzInput = document.getElementById("ptzValues");
const mouseInput = document.getElementById("mouseCoordinates");
const keynoteInput = document.getElementById("keynoteNotes");
ptzInput.addEventListener("click", ptzSend);
mouseInput.addEventListener("click", mouseSend);
keynoteInput.addEventListener("click", keynoteSend);

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
function keynoteSend() {
  console.log("keynoteNotes input clicked");
  console.log(keynoteInput.value);
  let shortcutsResult = keynoteInput.value;
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "keynote-message",
      event_data: { shortcutsResult },
    },
  });
}