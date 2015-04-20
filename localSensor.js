var request = require("request")
var baseUrl = "http://104.131.179.31:8080/sensor/"

var serialport = require('serialport'),// include the library
   SerialPort = serialport.SerialPort, // make a local instance of it
   // get port name from the command line:
   portName = process.argv[2];

var serialData = ["0","0"];



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
   serialData = data;
   //changeLight();
}
 
function showPortClose() {
   console.log('port closed.');
}
 
function showError(error) {
   console.log('Serial port error: ' + error);
}



setInterval(function(){

	var vals = serialData.split(",");

	var url = baseUrl + vals[0]+"/"+vals[1];
	console.log(url);

	request(url, function (error, response, body) {
  		if (!error && response.statusCode == 200) {
   			 console.log(body) // Print the web page.
  		}
	})
},1000);