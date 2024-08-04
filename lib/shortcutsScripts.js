const shortcutsInput = document.getElementById("shortcutsInput");
shortcutsInput.addEventListener("click", shortcutsSend);

function shortcutsSend(){
    console.log("input clicked")
    console.log(shortcutsInput.value)
     //send obs_textSourceName to OBS
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "shortcuts-result",
      event_data: { shortcutsResult },
    },
  });
}