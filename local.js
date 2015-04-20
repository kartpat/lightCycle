var update = false;
var lastValue = ["0","0"];

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
    api.setGroupLightState(1, {"bri": 1*jsonWeb[0].val1 , "hue": 255*jsonWeb[0].val2, "sat":255}) // provide a value of false to turn off
      .then(displayResult)
      .fail(displayError)
      .done();
    //console.log("CHANGE!");
      
      //console.log(vals);

      update = false;
    }

  // api.setLightState(3, {"bri": 1*vals[0] , "hue": 255*vals[2], "sat":1*vals[1]}) // provide a value of false to turn off
  //   .then(displayResult)
  //   .fail(displayError)
  //   .done();
    
lastValue[0] = jsonWeb[0].val1;
lastValue[1] = jsonWeb[0].val2;
}, 1000);
