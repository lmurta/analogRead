/////////////////////////
/////////////////////////USAR EM CONJUNTO COMO ARDUINO DTH11_JSON AT 57600
/////////////////////////
/////////////////////////



'use strict';
var express = require('express');
var debug = require('debug')('analogread_02:server');
var http = require('http');
var app = express();
var server = require('http').Server(app);
//var io = require('socket.io')(http);
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
var server = http.createServer(app);
server.listen(app.get('port'));
server.on('error', onError);
server.on('listening', onListening);
var io = require('socket.io').listen(server);

var path = require('path');
//var io = require('socket.io').listen(app.listen());

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

//var ArduinoFirmata = require('arduino-firmata');
//var arduino = new ArduinoFirmata().connect();

var portName = "/dev/ttyUSB0";
//var portName = "/dev/ttyACM0";

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var sp = new SerialPort(portName, {
  baudrate: 57600,
  parser: serialport.parsers.readline("\r\n")
});
sp.flush(function(err,results){});

var H,T, A0,A1,A2,A3,A4,A5 ;
var config_pins = require('./config_pins');
var new_data = {};
var new_CO2_data = {};
var new_MQ2_data = {};
var new_MQ4_data = {};


//two points are taken from the curve. 
//with these two points, a line is formed which is "approximately equivalent"
//to the original curve. 
//data format:{ x, y, slope}; point1: (lg200, 0.21), point2: (lg10000, -0.59) 
var pcurves = new Array;
var MQ2_GAS_LPG     =  0; pcurves[MQ2_GAS_LPG]     = [2.3,0.21,-0.47];
var MQ2_GAS_CO      =  1; pcurves[MQ2_GAS_CO]      = [2.3,0.72,-0.34];
var MQ2_GAS_SMOKE   =  2; pcurves[MQ2_GAS_SMOKE]   = [2.3,0.53,-0.44];
var MQ2_GAS_H2      =  3; pcurves[MQ2_GAS_H2]      = [2.3,0.33,-0.48];
var MQ2_GAS_CH4     =  4; pcurves[MQ2_GAS_CH4]     = [2.3,0.48,-0.36];
var MQ2_GAS_ETH     =  5; pcurves[MQ2_GAS_ETH]     = [2.3,0.45,-0.36];
var MQ2_GAS_PROPANE =  6; pcurves[MQ2_GAS_PROPANE] = [2.3,0.24,-0.46];

var MQ4_GAS_CO      =  7; pcurves[MQ4_GAS_CO]      = [2.3,0.62,-0.07];
var MQ4_GAS_ETH     =  8; pcurves[MQ4_GAS_ETH]     = [2.3,0.60,-0.09];
var MQ4_GAS_SMOKE   =  9; pcurves[MQ4_GAS_SMOKE]   = [2.3,0.59,-0.12];
var MQ4_GAS_H2      = 10; pcurves[MQ4_GAS_H2]      = [2.3,0.57,-0.18];
var MQ4_GAS_LPG     = 11; pcurves[MQ4_GAS_LPG]     = [2.3,0.41,-0.32];
var MQ4_GAS_CH4     = 12; pcurves[MQ4_GAS_CH4]     = [2.3,0.24,-0.35];
     
var MQ6_GAS_CO      = 13; pcurves[MQ6_GAS_CO]      = [2.3,0.95,-0.08];
var MQ6_GAS_ETH     = 14; pcurves[MQ6_GAS_ETH]     = [2.3,0.90,-0.16];
var MQ6_GAS_H2      = 15; pcurves[MQ6_GAS_H2]      = [2.3,0.76,-0.26];
var MQ6_GAS_CH4     = 16; pcurves[MQ6_GAS_CH4]     = [2.3,0.41,-0.40];
var MQ6_GAS_LPG     = 17; pcurves[MQ6_GAS_LPG]     = [2.3,0.32,-0.43];


var     MG811_DC_GAIN = 12.0;//8.5;
//These two values differ from sensor to sensor. user should derermine this value.
var         MG811_ZERO_POINT_VOLTAGE  = 0.220; //define the output of the sensor in volts when the concentration of CO2 is 400PPM
var         MG811_REACTION_VOLTAGE    = 0.020; //define the voltage drop of the sensor when move the sensor from air into 1000ppm CO2
//two points are taken from the curve.//with these two points, a line is formed which is
//"approximately equivalent" to the original curve.
//data format:{ x, y, slope}; point1: (lg400, 0.324), point2: (lg4000, 0.280)
//slope = ( reaction voltage ) / (log400 –log1000)
//float           MG811_CO2Curve[3]  =  {2.602, MG811_ZERO_POINT_VOLTAGE, (MG811_REACTION_VOLTAGE / (2.602 - 3))};
var MG811_GAS_CO2   = 18; pcurves[MG811_GAS_CO2]   =  [2.602, MG811_ZERO_POINT_VOLTAGE, (MG811_REACTION_VOLTAGE / (2.602 - 3))];


var MQ2_RL_VALUE                = 5;     //define the load resistance on the board, in kilo ohms
var MQ4_RL_VALUE                = 20;
var MQ6_RL_VALUE                = 20;

var MQ2_RO_CLEAN_AIR_FACTOR     = 9.83;  //RO_CLEAR_AIR_FACTOR=(Sensor resistance in clean air)/RO,
                                                     //which is derived from the chart in datasheet
 
//Ro is initialized to 10 kilo ohms
var           MQ2_Ro           =  9.7; //valor medido experimentalmente
var           MQ4_Ro           =  25.5; //valor medido experimentalmente
var           MQ6_Ro           =  5.68; //valor medido experimentalmente


var fs =require('fs');
var dateformat = require('date-format');
var date = new Date() ;

var fileName = "logs/"+ dateformat.asString('yyyyMMddhhmm',date) 
  + ".csv";
fs.appendFile(fileName, 'date,A0,A1,A2,A3,A4,A5,H,T\n', function (err) {
  if (err) throw err;
  console.log('The "data to append" was appended to file!');
});
var timeStamp;
var dataLog = false;
var logInterval = 1000 * 120; //1000 * X segundos
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.get('/foo', function (req, res, next) {
  res.render('foo', { title: "This is totally foo"});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

sp.on("data", function (data) {
  console.log(data);
  var re = /\0/g; //cleanup null characters
  var str = data.toString().replace(re, "");

  var jsonObj = JSON.parse(str);
  for(var config_pins_key in config_pins){
    if (typeof jsonObj[config_pins_key] !== 'undefined'){
        console.log(config_pins[config_pins_key] +"="+ jsonObj[config_pins_key]); 
        new_data[config_pins[config_pins_key]] = jsonObj[config_pins_key];
        if (config_pins[config_pins_key] == "MQ2"){ process_MQ2(jsonObj[config_pins_key]); }
        if (config_pins[config_pins_key] == "MQ4"){ process_MQ4(jsonObj[config_pins_key]); }
        if (config_pins[config_pins_key] == "MQ6"){ process_MQ6(jsonObj[config_pins_key]); }
        if (config_pins[config_pins_key] == "MG811"){ process_MG811(jsonObj[config_pins_key]); }

    }
  }


});
function process_MQ2(analogRead){
  console.log("Processing MQ2 = "+analogRead);
  var rs = MQ_MQRead(MQ2_RL_VALUE,analogRead);
  console.log("RS="+rs);
  var MQ2_LPG     = MQ_MQGetPercentage(rs/MQ2_Ro,MQ2_GAS_LPG);
  var MQ2_CO      = MQ_MQGetPercentage(rs/MQ2_Ro,MQ2_GAS_CO);
  var MQ2_SMOKE   = MQ_MQGetPercentage(rs/MQ2_Ro,MQ2_GAS_SMOKE);
  var MQ2_H2      = MQ_MQGetPercentage(rs/MQ2_Ro,MQ2_GAS_H2);
  var MQ2_CH4     = MQ_MQGetPercentage(rs/MQ2_Ro,MQ2_GAS_CH4);
  var MQ2_ETH     = MQ_MQGetPercentage(rs/MQ2_Ro,MQ2_GAS_ETH);
  var MQ2_PROPANE = MQ_MQGetPercentage(rs/MQ2_Ro,MQ2_GAS_PROPANE);
  new_MQ2_data["MQ2_LPG"] = MQ2_LPG.toFixed(2);
  new_MQ2_data["MQ2_CO"] = MQ2_CO.toFixed(2);
  new_MQ2_data["MQ2_SMOKE"] = MQ2_SMOKE.toFixed(2);
  new_MQ2_data["MQ2_H2"] = MQ2_H2.toFixed(2);
  new_MQ2_data["MQ2_CH4"] = MQ2_CH4.toFixed(2);
  new_MQ2_data["MQ2_ETH"] = MQ2_ETH.toFixed(2);
  new_MQ2_data["MQ2_PROPANE"] = MQ2_PROPANE.toFixed(2);

  console.log("LPG="      + MQ2_LPG.toFixed(2) + " "
              +"CO="      + MQ2_CO.toFixed(2) + " "
              +"SMOKE="   + MQ2_SMOKE.toFixed(2) + " "
              +"H2="      + MQ2_H2.toFixed(2) + " "
              +"CH4="     + MQ2_CH4.toFixed(2) + " "
              +"ETH="     + MQ2_ETH.toFixed(2) + " "
              +"Propane=" + MQ2_PROPANE.toFixed(2) + " "
              );
}
function process_MQ4(analogRead){
  console.log("Processing MQ4 = "+analogRead);
  var rs = MQ_MQRead(MQ4_RL_VALUE,analogRead);
  //console.log("RS="+rs);
  var MQ4_LPG     = MQ_MQGetPercentage(rs/MQ4_Ro,MQ4_GAS_LPG);
  var MQ4_CO      = MQ_MQGetPercentage(rs/MQ4_Ro,MQ4_GAS_CO);
  var MQ4_SMOKE   = MQ_MQGetPercentage(rs/MQ4_Ro,MQ4_GAS_SMOKE);
  var MQ4_H2      = MQ_MQGetPercentage(rs/MQ4_Ro,MQ4_GAS_H2);
  var MQ4_CH4     = MQ_MQGetPercentage(rs/MQ4_Ro,MQ4_GAS_CH4);
  var MQ4_ETH     = MQ_MQGetPercentage(rs/MQ4_Ro,MQ4_GAS_ETH);
  new_MQ4_data["MQ4_LPG"] = MQ4_LPG.toFixed(2);
  new_MQ4_data["MQ4_CO"] = MQ4_CO.toFixed(2);
  new_MQ4_data["MQ4_SMOKE"] = MQ4_SMOKE.toFixed(2);
  new_MQ4_data["MQ4_H2"] = MQ4_H2.toFixed(2);
  new_MQ4_data["MQ4_CH4"] = MQ4_CH4.toFixed(2);
  new_MQ4_data["MQ4_ETH"] = MQ4_ETH.toFixed(2);

  console.log("LPG="      + MQ4_LPG.toFixed(2) + " "
              +"CO="      + MQ4_CO.toFixed(2) + " "
              +"SMOKE="   + MQ4_SMOKE.toFixed(2) + " "
              +"H2="      + MQ4_H2.toFixed(2) + " "
              +"CH4="     + MQ4_CH4.toFixed(2) + " "
              +"ETH="     + MQ4_ETH.toFixed(2) + " "
              );
}
function process_MQ6(analogRead){
  console.log("Processing MQ6 = "+analogRead);
  var rs = MQ_MQRead(MQ6_RL_VALUE,analogRead);
  //console.log("RS="+rs);
  var MQ6_LPG     = MQ_MQGetPercentage(rs/MQ6_Ro, MQ6_GAS_LPG);
  var MQ6_CO      = MQ_MQGetPercentage(rs/MQ6_Ro, MQ6_GAS_CO);
  var MQ6_H2      = MQ_MQGetPercentage(rs/MQ6_Ro, MQ6_GAS_H2);
  var MQ6_CH4     = MQ_MQGetPercentage(rs/MQ6_Ro, MQ6_GAS_CH4);
  var MQ6_ETH     = MQ_MQGetPercentage(rs/MQ6_Ro, MQ6_GAS_ETH);

  console.log("LPG="      + MQ6_LPG.toFixed(2) + " "
              +"CO="      + MQ6_CO.toFixed(2) + " "
              +"H2="      + MQ6_H2.toFixed(2) + " "
              +"CH4="     + MQ6_CH4.toFixed(2) + " "
              +"ETH="     + MQ6_ETH.toFixed(2) + " "
              );
}
function process_MG811(analogRead){
  var volts = analogRead * 5 / 1024 ;
  //console.log("Processing MG811 = "+analogRead + " V="+volts);
  
  //var rs = MQ_MQRead(MQ6_RL_VALUE,analogRead);
  //console.log("RS="+rs);
  var MG811_CO2     = MG811_MGGetPercentage(volts, MG811_GAS_CO2);
  new_CO2_data["MG811_CO2"] = MG811_CO2.toFixed(2);
  console.log("MG811_CO2="      + MG811_CO2.toFixed(2) + " "
              );
}

/*****************************  MQRead *********************************************
Input:   mq_pin - analog channel
Output:  Rs of the sensor
Remarks: This function use MQResistanceCalculation to caculate the sensor resistenc (Rs).
         The Rs changes as the sensor is in the different consentration of the target
         gas. The sample times and the time interval between samples could be configured
         by changing the definition of the macros.
************************************************************************************/ 
function MQ_MQRead(RL_VALUE,raw_adc){
  var i;
  var rs=0.0;
  //rs = MQ_MQResistanceCalculation(raw_adc);
  rs = RL_VALUE*(1023-raw_adc)/raw_adc;
  return rs;  
}
/****************** MQResistanceCalculation ****************************************
Input:   raw_adc - raw value read from adc, which represent3.s the voltage
Output:  the calculated sensor resistance
Remarks: The sensor and the load resistor forms a voltage divider. Given the voltage
         across the load resistor and its resistance, the resistance of the sensor
         could be derived.
************************************************************************************/ 
//function MQ_MQResistanceCalculation( raw_adc){
  //return ( (MQ2_RL_VALUE*(1023-raw_adc)/raw_adc));
//}
/*****************************  MQGetPercentage **********************************
Input:   rs_ro_ratio - Rs divided by Ro
         pcurve      - pointer to the curve of the target gas
Output:  ppm of the target gas
Remarks: By using the slope and a point of the line. The x(logarithmic value of ppm) 
         of the line could be derived if y(rs_ro_ratio) is provided. As it is a 
         logarithmic coordinate, power of 10 is used to convert the result to non-logarithmic 
         value.
************************************************************************************/ 
function  MQ_MQGetPercentage( rs_ro_ratio, curva){

  var pcurve = pcurves[curva];
  var percent =Math.pow(10,
                           (
                              (
                                  (Math.log(rs_ro_ratio)/Math.LN10)-pcurve[1]
                              )/pcurve[2]
                           ) + pcurve[0]
                        );
  //console.log("rs_ro_ratio:"+rs_ro_ratio+"log:"+(Math.log(rs_ro_ratio)/Math.LN10) );
  //console.log("rs_ro_ratio:"+rs_ro_ratio+" pcurve[0]:"+pcurve[0]+" pcurve[1]:"+pcurve[1]+" pcurve[2]:"+pcurve[2])
  //console.log("percent:"+percent);
  return percent;
}
/*****************************  MQGetPercentage **********************************
Input:   volts   - SEN-000007 output measured in volts
         pcurve  - pointer to the curve of the target gas
Output:  ppm of the target gas
Remarks: By using the slope and a point of the line. The x(logarithmic value of ppm)
         of the line could be derived if y(MG-811 output) is provided. As it is a
         logarithmic coordinate, power of 10 is used to convert the result to non-logarithmic
         value.
************************************************************************************/
function  MG811_MGGetPercentage( volts, curva){
    var pcurve = pcurves[curva];
    //console.log("p0="+ pcurve[0] +" p1="+ pcurve[1] +" p2="+ pcurve[2] );
    if ((volts / MG811_DC_GAIN ) >= MG811_ZERO_POINT_VOLTAGE) {
      return 0;
    } else {
      //return pow(10, ((volts / MG811_DC_GAIN) - pcurve[1]) / pcurve[2] + pcurve[0]);
      return Math.pow(10, ((volts / MG811_DC_GAIN) - pcurve[1]) / pcurve[2] + pcurve[0]);
    }
}


io.sockets.on('connection', function(socket){
    //send data to client
   socket.emit('serverStartTicker', { logInterval: logInterval });

   setInterval(function(){

      socket.emit('new_data', new_data);
      socket.emit('new_CO2_data', new_CO2_data);
      socket.emit('new_MQ2_data', new_MQ2_data);
      socket.emit('new_MQ4_data', new_MQ4_data);

        socket.emit('serverStartTicker', { logInterval: logInterval });
      date = new Date() ;
      //console.log(date.toISOString());
      if (dataLog){
        //console.log("save file");

        fs.appendFile(fileName, date.toISOString()+
          ','+A0+
          ','+A1+
          ','+A2+
          ','+A3+
          ','+A4+
          ','+A5+
          ','+H+
          ','+T+
          '\n'
          , function (err) {
        });
      }
    }, logInterval);
    socket.on('saveFile', function (data) {
      console.log(data);
      if (data.saveFile == 'true'){
        dataLog =true;
        //console.log("save file");
        
      }
      if (data.saveFile == 'false'){
        dataLog =false;
        //console.log("don't save file");
      }
    });
});



module.exports = app;


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
