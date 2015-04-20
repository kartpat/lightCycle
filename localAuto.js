var update = false;
var lastValue = ["0","0"];
var off = true;

var jsonWeb ;

var request = require("request")

var url = "http://104.131.179.31:8080/json"

var HueApi = require("node-hue-api").HueApi;

var displayResult = function(result) {
    console.log(result);
};
var displayError = function(err) {
    console.error(err);
};

// var host = "128.122.151.141",
//     username = "newdeveloper",
//     api;

var host = "192.168.0.9",
    username = "newdeveloper",
    api;

api = new HueApi(host, username);

//This is how we get the values from the website

api.lightStatus(1)
    .then(displayStatus)
    .done();
var displayStatus = function(status) {
 // var jasoos = JSON.stringify(status, null, 2);
if(status.state.on){ off = false};
};



setInterval(function(){
	request({
    	url: url,
    	json: true
	}, function (error, response, body) {

    	if (!error && response.statusCode === 200) {
    		jsonWeb = body;
        	
    	}
	})
},500);


setInterval(function () {
   //console.log(brightness);
  // var vals = brightness.split(",");
   
   
   if(jsonWeb[0].val1 !== lastValue[0] || jsonWeb[0].val2 !== lastValue[1]){
    //console.log("newStuff");

    update = true;

   }




   //console.log(vals[0]);

    // api.setLightState(1, {"bri": 1*vals[0] , "hue": 255*200, "sat":255}) // provide a value of false to turn off
    // .then(displayResult)
    // .fail(displayError)
    // .done();

   // api.setLightState(1, {"bri": 1*vals[0] , "hue": 255*vals[2], "sat":1*vals[1]}) // provide a value of false to turn off
   //  .then(displayResult)
   //  .fail(displayError)
   //  .done();


   if(update){
   		if(jsonWeb[0].val1 < 2000){
   			var britVal = map_range(1*jsonWeb[0].val1,0,2000,255,0);
   			if(off){
   				api.setGroupLightState(1, {"on": true}) // provide a value of false to turn off
      		.then(displayResult)
      		.fail(displayError)
      		.done();
      		off = false;	


   			}

    	api.setGroupLightState(1, {"bri": britVal , "hue": 255*jsonWeb[0].val2, "sat":130}) // provide a value of false to turn off
      		.then(displayResult)
      		.fail(displayError)
      		.done();
    		//console.log("CHANGE!");
      
      		//console.log(vals);

      update = false;
  		}else{
  			if(!off){
  		api.setGroupLightState(1, {"on": false}) // provide a value of false to turn off
      		.then(displayResult)
      		.fail(displayError)
      		.done();
      		off = true;	
      	}

  		}
    }

  // api.setLightState(3, {"bri": 1*vals[0] , "hue": 255*vals[2], "sat":1*vals[1]}) // provide a value of false to turn off
  //   .then(displayResult)
  //   .fail(displayError)
  //   .done();
    
lastValue[0] = jsonWeb[0].val1;
lastValue[1] = jsonWeb[0].val2;
}, 1000);




function map_range(value, low1, high1, low2, high2) {
    return Math.floor(low2 + (high2 - low2) * (value - low1) / (high1 - low1));
}