// Simple interface to Sony Buzz! wireless buzzers

var util   = require('util');
var events = require('events');
var HID    = require('node-hid');

// buzzer protocol info: http://www.developerfusion.com/article/84338/making-usb-c-friendly/

function BuzzerController(device, controllerId)
{				
    var controllers = HID.devices(device[0], device[1]);
    
	this.controllerId = controllerId;
 
	if (!controllers.length) {
	    throw new Error("No Buzzer controllers could be found");
	}

	events.EventEmitter.call(this);

	this.hid = new HID.HID(controllers[0].path);
    this.oldBits = 0;
    this.leds = [0, 0, 0, 0, 0, 0];

    // Initialize buzzers
    this.hid.write([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    this.hid.read(this.buzzerData.bind(this));
}

util.inherits(BuzzerController, events.EventEmitter);

BuzzerController.prototype.handleBuzzer = function (buzzerNumber, bits) {
    var mask = 1 << (buzzerNumber * 5);
    for (var buttonNumber = 0; buttonNumber < 5; buttonNumber++) {
        var now = bits & mask;
        var old = this.oldBits & mask;
        if (old ^ now) {
            this.pressButton(buzzerNumber, buttonNumber, now ? true : false);
        }
        mask <<= 1;
    }
}

BuzzerController.prototype.buzzerData = function (error, data) {
    var bits = (data[4] << 16) | (data[3] << 8) | data[2];
    for (var i = 0; i < 4; i++) {
        this.handleBuzzer(i, bits);
    }
    this.oldBits = bits;
    this.hid.read(this.buzzerData.bind(this));
}

BuzzerController.prototype.led = function(buzzer, state) {
    this.leds[buzzer + 2] = state ? 0xff : 0x00;
    this.hid.write(this.leds);
}

/**
 * Button was pressed or released
 *
 * @param {int} buzzerNumber buzzer device number
 * @param {int} buttonNumber button number
 * @param {boolean} state decides that button was pressed or released\
 *
 * @return void
 */
BuzzerController.prototype.pressButton = function (buzzerNumber, buttonNumber, state) {
    var self = this;
    var colors = ['red', 'yellow', 'green', 'orange', 'blue'];
    var buttonColor = colors[buttonNumber];
    var buzzer = {
        'controllerId' : this.controllerId,
        'buzzerId'     : buzzerNumber,
        'button'       : buttonColor
    }
	if (state) {
		// blink with led
		self.led(buzzerNumber, true);
		setTimeout(function() {
            self.led(buzzerNumber, false);
	    }, 500);
  	    this.emit('buttonPressed', buzzer);
	} else {
        this.emit('buttonReleased', buzzer);
    }
}
exports.BuzzerController = BuzzerController;
