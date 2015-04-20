var update = false;
var lastValue = ["0","0"];
var off = true;
var jsonWeb ;
var brightTune, hueTune;
var newTune = true;
var lastTune, lastHueTune, lastAmount, lastDuration;
var duration, amount;
var brightness;
var sign = 1;

var serialport = require('serialport'),// include the library
   SerialPort = serialport.SerialPort, // make a local instance of it
   // get port name from the command line:
   portName = process.argv[2];

var serialController = ["0","0","0","0","0"];



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
   //console.log(data);
   serialController = data;
   //changeLight();
}
 
function showPortClose() {
   console.log('port closed.');
}
 
function showError(error) {
   console.log('Serial port error: ' + error);
}


// var request = require("request")

// var url = "http://104.131.179.31:8080/json"

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

// var host = "192.168.0.9",
//     username = "newdeveloper",
//     api;

api = new HueApi(host, username);

//This is how we get the values from the website

api.lightStatus(1)
    .then(displayStatus)
    .done();
var displayStatus = function(status) {
 // var jasoos = JSON.stringify(status, null, 2);
if(status.state.on){ off = false};
};

// Interval function to read values off Serial Port

setInterval(function(){
	/*request({
    	url: url,
    	json: true
	}, function (error, response, body) {

    	if (!error && response.statusCode === 200) {
    		jsonWeb = body;
        	
    	}
	})*/

  var serialVals = serialController.split(",");
  brightTune = serialVals[0];
  hueTune = map_range(serialVals[2],0,255,110,130);
  amount = map_range(serialVals[1],0,255,0,150);
  duration = map_range(serialVals[3],0,255,1,20);

  if (lastTune != brightTune || lastHueTune != hueTune || lastAmount != amount || lastDuration != duration){
    update = true;

  }
  //console.log(brightTune);
  lastTune = brightTune;
  lastHueTune = hueTune;
  lastAmount = amount;
  lastDuration = duration;
},500);


setInterval(function () {
   //console.log(brightness);
  // var vals = brightness.split(",");
   
   
  /* if(jsonWeb[0].val1 !== lastValue[0] || jsonWeb[0].val2 !== lastValue[1]){
    //console.log("newStuff");

    update = true;

   }*/
   if(update){
    brightness = brightTune;

   }

   brightness = brightness - sign*duration;
   			/*var britVal = map_range(1*jsonWeb[0].val1,0,2000,255,0);
        britVal = britVal + brightTune;
        var hueVal = map_range(1*jsonWeb[0].val2,15,30,100,135);
        hueVal = hueVal + hueTune;*/


        //if (brightness>255) brightness = 255;
        if (brightness<0) brightness = 0;
   			if(off){
   				api.setGroupLightState(1, {"on": true}) // provide a value of false to turn off
      		.then(displayResult)
      		.fail(displayError)
      		.done();
      		off = false;	
   			}


    	api.setGroupLightState(1, {"bri": brightness , "hue": 255*hueTune, "sat":120}) // provide a value of false to turn off
      		.then(displayResult)
      		.fail(displayError)
      		.done();
          console.log(brightness);

          if (brightness < brightTune - amount || brightness > brightTune || brightness > 255){
            sign *= -1;
          }
    		//console.log("CHANGE!");
      
      		//console.log(vals);

      update = false;
  		
    
    

}, 1000);




function map_range(value, low1, high1, low2, high2) {

  var mappedVal = Math.floor(low2 + (high2 - low2) * (value - low1) / (high1 - low1));
  return mappedVal;
}