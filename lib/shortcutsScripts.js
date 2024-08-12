const shortcutsInput = document.getElementById("shortcutsInput");
shortcutsInput.addEventListener("click", shortcutsSend);

function shortcutsSend(){
    console.log("input clicked")
    console.log(shortcutsInput.value)
    let shortcutsResult = shortcutsInput.value;
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "shortcuts-message",
      event_data: { shortcutsResult },
    },
  });
}