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

var plotly = require('plotly')('Lmurta','uxj063ncmv');
var STREAM_TOKEN_0 = 'i4syfw4mxj';
var STREAM_TOKEN_1 = 'o07wtgg9lj';
var STREAM_TOKEN_2 = 'f9xh13dg2b';
var STREAM_TOKEN_3 = 'dh8y3kfiqe';
var STREAM_TOKEN_4 = 'kyvbcckjmv';
var STREAM_TOKEN_5 = 've9yeeet4k';
//colors: ["#edc240","#2B65EC", "#B2912F", "#4da74d", "#9440ed", "#cb4b4b"],

var MAX_POINTS = 1000;
var lineWidth =1.5;
var initData = [
       {x: [],y: [],name:"A0",stream:{token: STREAM_TOKEN_0,maxpoints: MAX_POINTS}
        ,line: {color: "#edc240", width: lineWidth}  , }
      ,{x: [],y: [],name:"A1",stream:{token: STREAM_TOKEN_1,maxpoints: MAX_POINTS}
        ,line: {color: "#2B65EC", width: lineWidth}  , }
      ,{x: [],y: [],name:"A2",stream:{token: STREAM_TOKEN_2,maxpoints: MAX_POINTS}
        ,line: {color: "#B2912F", width: lineWidth}  , }
      ,{x: [],y: [],name:"A3",stream:{token: STREAM_TOKEN_3,maxpoints: MAX_POINTS}
        ,line: {color: "#4da74d", width: lineWidth}  , }
      ,{x: [],y: [],name:"A4",stream:{token: STREAM_TOKEN_4,maxpoints: MAX_POINTS}
        ,line: {color: "#9440ed", width: lineWidth}  , }
      ,{x: [],y: [],name:"A5",stream:{token: STREAM_TOKEN_5,maxpoints: MAX_POINTS}
        ,line: {color: "#cb4b4b", width: lineWidth}  , }
];
var initLayout = {
    fileopt: 'overwrite',
    filename: 'CO2Sensors'
    ,"layout": {
       title: "CO2 Sensors"
      ,showlegend: true
      ,autorange: false
      ,yaxis: {range: [0, 1024]}
    }

};
plotly.plot(initData, initLayout, function (err, msg) {
    if (err) return console.log(err);
    console.log(msg);

    io.sockets.on('connection', function(socket){
      //send data to client
          socket.emit('plotlyConnected', {
                         plotlyLink: msg.url 
                      ,  plotlyX   : "plotlyX" 
          });
    });   

    var stream0 = plotly.stream(STREAM_TOKEN_0, function (err, res) {
        if (err) return console.log(err);
        console.log(res);
        clearInterval(loop); // once stream is closed, stop writing
    });
    var stream1 = plotly.stream(STREAM_TOKEN_1, function (err, res) {
        if (err) return console.log(err);
        console.log(res);
        clearInterval(loop); // once stream is closed, stop writing
    });
    var stream2 = plotly.stream(STREAM_TOKEN_2, function (err, res) {
        if (err) return console.log(err);
        clearInterval(loop); // once stream is closed, stop writing
    });
    var stream3 = plotly.stream(STREAM_TOKEN_3, function (err, res) {
        if (err) return console.log(err);
        clearInterval(loop); // once stream is closed, stop writing
    });
    var stream4 = plotly.stream(STREAM_TOKEN_4, function (err, res) {
        if (err) return console.log(err);
        clearInterval(loop); // once stream is closed, stop writing
    });
    var stream5 = plotly.stream(STREAM_TOKEN_5, function (err, res) {
        if (err) return console.log(err);
        clearInterval(loop); // once stream is closed, stop writing
    });


    var i_plotly = 0;
    var loop = setInterval(function () {
      var data0 = { x : i_plotly, y : an0 };var streamObject0 = JSON.stringify(data0);
      var data1 = { x : i_plotly, y : an1 };var streamObject1 = JSON.stringify(data1);
      var data2 = { x : i_plotly, y : an2 };var streamObject2 = JSON.stringify(data2);
      var data3 = { x : i_plotly, y : an3 };var streamObject3 = JSON.stringify(data3);
      var data4 = { x : i_plotly, y : an4 };var streamObject4 = JSON.stringify(data4);
      var data5 = { x : i_plotly, y : an5 };var streamObject5 = JSON.stringify(data5);

      stream0.write(streamObject0+'\n');
      stream1.write(streamObject1+'\n');
      stream2.write(streamObject2+'\n');
      stream3.write(streamObject3+'\n');
      stream4.write(streamObject4+'\n');
      stream5.write(streamObject5+'\n');
      i_plotly++;
    }, logInterval);
});

//Plotly

var path = require('path');
//var io = require('socket.io').listen(app.listen());

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var ArduinoFirmata = require('arduino-firmata');
var arduino = new ArduinoFirmata().connect();
var an0,an1,an2,an3,an4,an5 ;

var fs =require('fs');
var dateformat = require('date-format');
var date = new Date() ;

var fileName = "logs/"+ dateformat.asString('yyyyMMddhhmm',date) 
//= dateFormat(date,"yyyymmddhhMM")
// date.getFullYear() 
  + ".csv";
fs.appendFile(fileName, 'date,A0,A1,A2,A3,A4,A5\n', function (err) {

});
var timeStamp;
var dataLog = false;
var logInterval = 1000 * 1; //1000 * X segundos

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
io.sockets.on('connection', function(socket){
    //send data to client
    setInterval(function(){
      an0 = arduino.analogRead(0);
      an1 = arduino.analogRead(1);
      an2 = arduino.analogRead(2);
      an3 = arduino.analogRead(3);
      an4 = arduino.analogRead(4);
      an5 = arduino.analogRead(5);
        socket.emit('news', { an0: an0 
                    ,   an1: an1 
                    ,   an2: an2 
                    ,   an3: an3 
                    ,   an4: an4 
                    ,   an5: an5 
        });

      date = new Date() ;
      //console.log(date.toISOString());
      if (dataLog){
        //console.log("save file");

        fs.appendFile(fileName, date.toISOString()+
          ','+an0+
          ','+an1+
          ','+an2+
          ','+an3+
          ','+an4+
          ','+an5+
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
