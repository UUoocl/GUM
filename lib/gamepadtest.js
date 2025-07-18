/*
 * Gamepad API Test
 * Written in 2013 by Ted Mielczarek <ted@mielczarek.org>
 *
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */
var haveEvents = "GamepadEvent" in window;
var controllers = {};
var rAF = window.requestAnimationFrame;
var previous = [];
function connecthandler(e) {
    addgamepad(e.gamepad);
}
function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  var d = document.createElement("div");
  d.setAttribute("id", "controller" + gamepad.index);
  var t = document.createElement("h4");
  t.appendChild(document.createTextNode(`gamepad-${gamepad.index}:  `+ gamepad.id));
  d.appendChild(t);
  var b = document.createElement("div");
  b.className = "buttons";
  for (var i = 0; i < gamepad.buttons.length; i++) {
    var e = document.createElement("span");
    e.className = "button";
    //e.id = "b" + i;
    e.innerHTML = i;
    b.appendChild(e);
  }
  d.appendChild(b);
  var a = document.createElement("div");
  a.className = "axes";
  for (i = 0; i < gamepad.axes.length; i++) {
    e = document.createElement("meter");
    e.className = "axis";
    //e.id = "a" + i;
    e.setAttribute("min", "-1");
    e.setAttribute("max", "1");
    e.setAttribute("value", "0");
    e.innerHTML = i;
    a.appendChild(e);
  }
  d.appendChild(a);
  document.getElementById("startGP").style.display = "none";
  document.getElementById("gpData").appendChild(d);
  rAF(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  var d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}

function updateStatus() {
  scangamepads();
  for (j in controllers) {
    var controller = controllers[j];
    var d = document.getElementById("controller" + j);
    var buttons = d.getElementsByClassName("button");
    let sum = 0;
    let current = ``;
    for (var i = 0; i < controller.buttons.length; i++) {
      var b = buttons[i];
      var val = controller.buttons[i];
      var pressed = val == 1.0;
      var touched = false;
      if (typeof val == "object") {
        pressed = val.pressed;
        if ("touched" in val) {
          touched = val.touched;
        }

        //sum += val.value;
        val = val.value;
      }
      current += `${val}, `
      var pct = Math.round(val * 100) + "%";
      b.style.backgroundSize = pct + " " + pct;
      b.className = "button";
      if (pressed) {
        b.className += " pressed";
      }
      if (touched) {
        b.className += " touched";
      }
    }
    
    var axes = d.getElementsByClassName("axis");
    for (var i = 0; i < controller.axes.length; i++) {
      var a = axes[i];
      a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      a.setAttribute("value", controller.axes[i]);
      //sum += Math.abs(controller.axes[i]);
      if(Math.abs(controller.axes[i]) > 0.5){
      current += `${controller.axes[i]}, `
      }else{current += '0, '
      }
    }
    //if sum is > 0 a button is pressed or stick moved
    //if the a button is pressed
    if (previous[j] !== current) {
      //console.log(controller.id, current)
      //console.log(sum)
      previous[j]
       = current;
      //https://github.com/svidgen/www.thepointless.com/blob/main/src/routes/experimental/raw-gamepad-api/index.js
      //stringify the gamepad event 
      const gamepadEvent = JSON.stringify(
        navigator.getGamepads()
        .filter(p => p)
        .filter(p => p.index == j)
        .map(pad => ({
            index: pad.index,
            id: pad.id,
            mapping: pad.mapping,
            axes: pad.axes,
            buttons: [...pad.buttons].map(b => ({
                pressed: b.pressed,
                touched: b.touched,
                value: b.value
            })),
            vibrationActuator: pad.vibrationActuator
        }))[0],
        null,
        2
    )
    //send results to OBS Browser Source
    //console.log(sum, gamepadEvent)
      obs.call("CallVendorRequest", {
        vendorName: "obs-browser",
        requestType: "emit_event",
        requestData: {
          event_name: `gamepad-message`,
          event_data: { gamepadEvent },
        },
      });
      
      //send results to Advanced Scene Switcher
      // obs.call("CallVendorRequest", {
      //   vendorName: "AdvancedSceneSwitcher",
      //   requestType: "AdvancedSceneSwitcherMessage",
      //   requestData: {
      //     message: gamepadEvent,
      //   },
      // });
    }
  }
  rAF(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads();
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && gamepads[i].index in controllers) {
      controllers[gamepads[i].index] = gamepads[i];
    }
  }
}

if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);
} else {
  setInterval(scangamepads, 500);
}