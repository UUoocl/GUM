//get client ID from file name
let pname = window.location.pathname
clientID = pname.split("-").pop().replace(".html", "")
console.log(clientID)
rtcID= clientID