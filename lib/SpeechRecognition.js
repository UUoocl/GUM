//reference to the OBS Text Source to store speechRecognition results
var obs_textSourceName;

//Set Audio and Video Elements
const speechRecognitionButton = document.getElementById(
  "startSpeechRecognition"
);
speechRecognitionButton.addEventListener("click", startSpeechRecognition);

async function startSpeechRecognition() {
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
  var recognition = new SpeechRecognition();
  
  //Get text source name
  obs_textSourceName = document.getElementById("obs_textSourceName").value;
  
  //send obs_textSourceName to OBS
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "speechRecognition-started",
      event_data: { obs_textSourceName },
    },
  });
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = async function (event) {
    const rI = event.resultIndex;
    var result = event.results[rI][0].transcript;
    document.getElementById("speechRecognition").innerHTML = result;
    //console.log(event);
    //send results to OBS Browser Source    

    obs.call("CallVendorRequest", {
      vendorName: "obs-browser",
      requestType: "emit_event",
      requestData: {
        event_name: "speechRecognition",
        event_data: { result },
      },
    });
    //send results to OBS Text Source
    obs.call("SetInputSettings", {
      inputName: obs_textSourceName,
      inputSettings: {
        text: result,
      },
    });
  };

  // recognition.onspeechend = function() {
  //   recognition.stop();
  // }

  // recognition.onnomatch = function (event) {
  //   diagnostic.textContent = "I didn't recognise that color.";
  // };

  // recognition.onerror = function (event) {
  //   diagnostic.textContent = "Error occurred in recognition: " + event.error;
  // };
}