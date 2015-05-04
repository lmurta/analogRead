var ArduinoFirmata = require('arduino-firmata');
var arduino = new ArduinoFirmata().connect();
arduino.on('connect', function(){
  console.log("connect!! "+arduino.serialport_name);
  console.log("board version: "+arduino.boardVersion);
  var dht11 = arduino.dht11();
  
});