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

//Plotly
//deleted...
//Plotly

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

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
var sp = new SerialPort("/dev/ttyUSB0", {
  baudrate: 57600,
  parser: serialport.parsers.readline("\r\n")
});

var H,T, A0,A1,A2,A3,A4,A5 ;
var config_pins = require('./config_pins');
  var new_data = {};

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
var logInterval = 1000 * 2; //1000 * X segundos
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
/*
arduino.on('connect', function(){
  console.log("connect!! "+arduino.serialport_name);
  console.log("board version: "+arduino.boardVersion);
  io.sockets.on('connection', function(socket){
      //send data to client
          socket.emit('arduinoConnected', {
                         arduino_serialport_name: arduino.serialport_name 
                      ,  arduino_boardVersion   : arduino.boardVersion 
          });
  });
});
*/
sp.on("data", function (data) {
  console.log(data);
  var jsonObj = JSON.parse(data);
  for(var config_pins_key in config_pins){
    if (typeof jsonObj[config_pins_key] !== 'undefined'){
        console.log(config_pins[config_pins_key] +"="+ jsonObj[config_pins_key]); 
        new_data[config_pins[config_pins_key]] = jsonObj[config_pins_key];
    }
  }


});
io.sockets.on('connection', function(socket){
    //send data to client
   socket.emit('serverStartTicker', { logInterval: logInterval });

   setInterval(function(){

      socket.emit('new_data', new_data);

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
