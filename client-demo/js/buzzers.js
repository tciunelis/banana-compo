(function(window) {

    /**
     * One Buzzer class
     *
     * @param socket io.socket instance
     * @param data   buzzer data
     *
     * @constructor
     */
    var Buzzer = function(socket, data) {

        /**
         *
         * @type {io.socket}
         */
        this.socket = socket;
        /**
         * Buzzer usb plug No.
         *
         * @type {int}
         */
        this.controllerId = data.controllerId;

        /**
         * Buzzer id
         *
         * @type {int}
         */
        this.buzzerId = data.buzzerId;

        /**
         * Last pressed button color
         *
         * @type {string}
         */
        this.pressedButton = data.button;
    }

    /**
     * Press buzzer button for debug
     *
     * @param {string} buttonColor color of pressed button
     */
    Buzzer.prototype.pressButton = function(buttonColor) {
        this.socket.emit('pressButton', {
            controllerId : this.controllerId,
            buzzerId     : this.buzzerId,
            button       : buttonColor
        });
    }

    /**
     * Get buzzer id
     *
     * @return {String}
     */
    Buzzer.prototype.getId = function() {
        return 'controller-' + this.controllerId + '-buzzer-' + this.buzzerId;
    }

    /**
     * Get last buzzer pressed button color
     *
     * @return {String}
     */
    Buzzer.prototype.getLastPressedButton = function() {
        return this.pressedButton;
    }

    /**
     * Buzzers collection
     *
     * @param {io} socket.io instance
     *
     * @constructor
     */
    var Buzzers = function(io, host) {

        /**
         * Socket.io instance
         *
         * @type {io}
         */
        this.io = io;

        /**
         * Buzzers controllers count
         *
         * @type {int}
         */
        this.controllersCount = null;

        /**
         * Connect to sever
         */
        this.connect(host);

        /**
         * Listen to buzzers event
         */
        this.listen();

    }

    /**
     * Mixin io events emitter
     */
    io.util.mixin(Buzzers, io.EventEmitter);

    /**
     * Connect to WebSockets
     *
     * @param {string} host host with port
     *
     * @return {Boolean}
     */
    Buzzers.prototype.connect = function(host) {
        if (host == undefined) {
            host = 'http://localhost:8080';
        }
        if (io == undefined) {
            return false;
        }
        this.socket = io.connect(host);
        return true;
    }

    /**
     * Listen to buzzers server
     *
     * @emit controllersCount
     * @emit buttonPressed
     * @emit buttonReleased
     *
     * @return void
     */
    Buzzers.prototype.listen = function() {
        var self = this;
        this.socket.on('controllersCount', function (controllersCount) {
            self.controllersCount = controllersCount;
            self.emit('controllersCount', controllersCount);
        });
        this.socket.on('buttonPressed', function (data) {
            var buzzer = new Buzzer(self.socket, data);
            self.emit('buttonPressed', buzzer);
        });
        this.socket.on('buttonReleased', function (data) {
            var buzzer = new Buzzer(self.socket, data);
            self.emit('buttonReleased', buzzer);
        });
    }

    /**
     * Press buzzer button for debug
     *
     * @param {string} buttonColor
     */
    Buzzers.prototype.pressButton = function(buttonColor) {
        var buzzer = new Buzzer(this.socket, {
            'controllerId' : 1,
            'buzzerId'     : 1
        });
        buzzer.pressButton(buttonColor);
    }

    /**
     * Assign Buzzers class to window object
     *
     * @type {Buzzers}
     */
    window.Buzzers = Buzzers;

})(window);
