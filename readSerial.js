var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var sp = new SerialPort("/dev/ttyUSB0", {
	baudrate: 57600,
  parser: serialport.parsers.readline("\n")
});

sp.on("data", function (data) {
	console.log(data);
	var start = data.indexOf("[");
	var end = data.indexOf("]");
	//console.log(end);
	if (start===0 && end >0){
		data =data.slice(start+1,end);
		serialData = data.split("|");
		//console.log(serialData);
		var s1 = serialData[0];	var s2 =s1.split(":");	H = s2[1];
		s1 = serialData[1];	var s2 =s1.split(":");	T = s2[1];
		s1 = serialData[2];	var s2 =s1.split(":");	A0 = s2[1];
		s1 = serialData[3];	var s2 =s1.split(":");	A1 = s2[1];
		s1 = serialData[4];	var s2 =s1.split(":");	A2 = s2[1];
		s1 = serialData[5];	var s2 =s1.split(":");	A3 = s2[1];
		s1 = serialData[6];	var s2 =s1.split(":");	A4 = s2[1];
		s1 = serialData[7];	var s2 =s1.split(":");	A5 = s2[1];
		console.log("A5:"+A5);

	}
});