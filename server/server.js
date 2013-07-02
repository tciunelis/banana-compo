/*!
 * Buzzers Server
 * Copyright(c) 2013 banana-compo-server
 * MIT Licensed
 */
var config = require('./config');

var util   = require('util');
var events = require('events');

/*
 * Buzzers part
 */
var buzzers = require('./buzzers');

var buzzersControllers = [];

for (var i = 0; i < config.devices.length; i++) {
    try {
        console.log('Init buzzer: ', config.devices[i]);
        buzzersControllers[i] = new buzzers.BuzzerController(config.devices[i], i);
  	    buzzersControllers[i].on('buttonPressed', function (buzzer) {
  	        console.log('buzzer pressed: ', buzzer);
        });
    } catch (e) {
        console.log('No buzzers at ', config.devices[i]);
    } 
        
}

if (buzzersControllers.length == 0) {
    throw new Error("No Buzzer controllers could be found");
}
  
/*
 * Server part
 */
var io = require('socket.io').listen(config.port);

io.sockets.on('connection', function (socket) {

    socket.emit('controllersCount', buzzersControllers.length);

    /**
     * For debug only
     */
    socket.on('pressButton', function (data) {
        console.log('press button', data);
        socket.emit('buttonPressed', data);
    });
    
	for (var i = 0; i < config.devices.length; i++) {
	    buzzersControllers[i].on('buttonPressed', function (buzzer) {
            socket.emit('buttonPressed', buzzer);
        });
		buzzersControllers[i].on('buttonReleased', function (buzzer) {
            socket.emit('buttonReleased', buzzer);
        });
    }
});
