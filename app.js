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



var ArduinoFirmata = require('arduino-firmata');
var arduino = new ArduinoFirmata().connect();
var an0,an1,an2,an3,an4,an5 ;


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


  setInterval(function(){
    an0 = arduino.analogRead(0);
    an1 = arduino.analogRead(1);
    an2 = arduino.analogRead(2);
    an3 = arduino.analogRead(3);
    an4 = arduino.analogRead(4);
    an5 = arduino.analogRead(5);
    //console.log(an0, an1, an2, an3, an4, an5);
  }, 300);
});

io.sockets.on('connection', function(socket){
    //send data to client
    setInterval(function(){
        socket.emit('news', { an0: an0 
                    ,   an1: an1 
                    ,   an2: an2 
                    ,   an3: an3 
                    ,   an4: an4 
                    ,   an5: an5 
        });
    }, 300);
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
