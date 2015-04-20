/*
Local Server:
This NodeJS code runs on local server that fetches sensor values from the remote node server 
and talks to over ride controller over serial. It then pushes the final values to the 
Phillips Hue bridge to change the Lighting.
*/

//Global variables for storing values from remote server and serial port.

var update = false;
var lastValue = ["0","0"];
var off = true;
var jsonWeb ;
var brightTune, hueTune;
var newTune = true;
var lastTune, lastHueTune;


//-------Serial Port operations-----------------//
var serialport = require('serialport');// include the library
SerialPort = serialport.SerialPort, // make a local instance of it

// get port name from the command line:
portName = process.argv[2];

var serialController = ["0","0","0"];

// Serial data to receive values from the override controller.
var myPort = new SerialPort(portName, {
   baudRate: 9600,
   // look for return and newline at the end of each data packet:
   parser: serialport.parsers.readline("\r\n")
 });

myPort.on('open', showPortOpen);
myPort.on('data', saveLatestData);
myPort.on('close', showPortClose);
myPort.on('error', showError);

function showPortOpen() {
   console.log('port open. Data rate: ' + myPort.options.baudRate);
}
 
function saveLatestData(data) {
   //Store serial data in a global variable.
   serialController = data;
}
 
function showPortClose() {
   console.log('port closed.');
}
 
function showError(error) {
   console.log('Serial port error: ' + error);
}



//-------Hue bridge and remote server stuff-----------------//
var request = require("request")
//Remember to start the remote server before running this program 
var url = "http://104.131.179.31:8080/json"

var HueApi = require("node-hue-api").HueApi;

var displayResult = function(result) {
    console.log(result);
};
var displayError = function(err) {
    console.error(err);
};

var host = "128.122.151.141",
    username = "newdeveloper",
    api;


api = new HueApi(host, username);

//Get the current status of the lights
api.lightStatus(1)
    .then(displayStatus)
    .done();
var displayStatus = function(status) {
    if(status.state.on){ off = false};
};


// Refresh values of sensor data from the remote server.
setInterval(function(){
	request({
    	url: url,
    	json: true
	}, function (error, response, body) {

    	if (!error && response.statusCode === 200) {
    		jsonWeb = body;
     	}
	})

  // Resolve serial data and check for change in it.
  var serialVals = serialController.split(",");
  brightTune = map_range(serialVals[0],0,255,-100, 100);
  hueTune = map_range(serialVals[2],0,255,-20,20);

  if (lastTune != brightTune || lastHueTune != hueTune){
    update = true;

  }
  //console.log(brightTune);
  lastTune = brightTune;
  lastHueTune = hueTune;
},500);



//-------Function to talk to the hue bridge and update lights-----------------//
setInterval(function () {
  
    //Checking for update in remote sensor values 
   if(jsonWeb[0].val1 !== lastValue[0] || jsonWeb[0].val2 !== lastValue[1]){
    //console.log("newStuff");
    update = true;

   }


   if(update){
      // Turn the light on only if outside light is less than 2000 Lumens
   		if(jsonWeb[0].val1 < 2000){
        //Brightness value from remote light sensor.
   			var britVal = map_range(1*jsonWeb[0].val1,0,2000,255,0);
        // Final brightness value after adding tuning from Serial controller
        britVal = britVal + brightTune;

        // Hue value from remote temperature sensor
        var hueVal = map_range(1*jsonWeb[0].val2,15,30,100,135);
        // Final Hue value after adding tuning from serial controller
        hueVal = hueVal + hueTune;

        // Set limits to values
        if (britVal>255) britVal = 255;
        if (britVal<0) britVal = 0;
        // Turn the lights on if OFF
   			if(off){
   				api.setGroupLightState(1, {"on": true}) // provide a value of false to turn off
      		.then(displayResult)
      		.fail(displayError)
      		.done();
      		off = false;	
   			}

      // Update the state of the lights  
    	api.setGroupLightState(1, {"bri": britVal , "hue": 255*hueVal, "sat":120}) // provide a value of false to turn off
      		.then(displayResult)
      		.fail(displayError)
      		.done();
    	
      update = false;
  		}else{
        // Turn off lights if ON (and outside lighting is >2000 Lumens)
  			if(!off){
  		api.setGroupLightState(1, {"on": false}) // provide a value of false to turn off
      		.then(displayResult)
      		.fail(displayError)
      		.done();
      		off = true;	
      	}

  		}
    }

  //  store last values for update checking
  lastValue[0] = jsonWeb[0].val1;
  lastValue[1] = jsonWeb[0].val2;
}, 1000);



// A map function to map values over a range.
function map_range(value, low1, high1, low2, high2) {

  var mappedVal = Math.floor(low2 + (high2 - low2) * (value - low1) / (high1 - low1));
  return mappedVal;
}