var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor


var sp = new SerialPort("/dev/ttyUSB0", {
	baudrate: 57600,
  parser: serialport.parsers.readline("\n")
});

var config_pins = require('./config_pins');

sp.on("data", function (data) {
	console.log(data);
	var jsonObj = JSON.parse(data);
  	//for(var jsonKey in jsonObj) {
    	//console.log("key:"+jsonKey+", value:"+jsonObj[jsonKey]);
  	//};
  	for(var config_pins_key in config_pins){
  		if (typeof jsonObj[config_pins_key] !== 'undefined'){
  			console.log(config_pins[config_pins_key] +"="+ jsonObj[config_pins_key]);	
  		}
  		
  	}

});