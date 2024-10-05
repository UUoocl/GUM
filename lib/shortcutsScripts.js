const ptzInput = document.getElementById("ptzValues");
const mouseInput = document.getElementById("mouseCoordinates");
const keynoteInput = document.getElementById("keynoteNotes");
const powerPointInput = document.getElementById("powerPointNotes");
ptzInput.addEventListener("click", ptzSend);
mouseInput.addEventListener("click", mouseSend);
keynoteInput.addEventListener("click", keynoteSend);
powerPointInput.addEventListener("click", powerPointSend);

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
function powerPointSend() {
  console.log("powerPointNotes input clicked");
  console.log(powerPointInput.value);
  let shortcutsResult = powerPointInput.value;
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "powerpoint-message",
      event_data: { shortcutsResult },
    },
  });
}