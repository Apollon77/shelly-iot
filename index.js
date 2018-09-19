/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const EventEmitter = require('events');
const RestClient = require('node-rest-client').Client;
const coap = require('coap');
const Agent = coap.Agent;

Agent.prototype._nextToken = function nextToken() { // Needed Override in coap.Agent because of Shelly bug
    return new Buffer(0);
};

class ShellyIot extends EventEmitter {
    // Constructor, call with options object, content tbd :)
    constructor(options) {
        super();

        this.options = options || {};
        this.logger = this.options.logger;

        this.restClient = new RestClient();


        coap.registerOption('Uri-Path', (str) => Buffer.from(str, 'ascii'), (buf) => buf.toString());
        coap.registerOption(3332, (str) => Buffer.from(str, 'ascii'), (buf) => buf.toString());
        coap.registerOption(3412, (str) => Buffer.alloc(2).writeUInt16BE(parseInt(str, 10), 0), (buf) => buf.readUInt16BE(0));
        coap.registerOption(3420, (str) => Buffer.alloc(2).writeUInt16BE(parseInt(str, 10), 0), (buf) => buf.readUInt16BE(0));

        this.knownDevices = {};

        this.coapServer = null;
    }

    initDevice(options, rsinfo) {
        const deviceId = options['3332'];
        if (!deviceId) return null;

        if (!this.knownDevices[deviceId]) {
            this.knownDevices[deviceId] = {
                'validity': 0,
                'lastSerial': 0,
                'offlineTimer': null,
                'online': false,
                'ip': '',
                'port': 0,
                'description': null
            };
        }
        if (options['3412']) this.knownDevices[deviceId].validity = options['3412'];
        if (options['3420']) this.knownDevices[deviceId].lastSerial = options['3420'];

        if (rsinfo) {
            this.knownDevices[deviceId].ip = rsinfo.address;
            this.knownDevices[deviceId].port = rsinfo.port;
        }
        return deviceId;
    }

    handleDeviceStatus(req, emit, callback) {
        if (typeof emit === 'function') {
            callback = emit;
            emit = false;
        }
        const options = {};
        req.options.forEach((opt) => {
            if (!options[opt.name]) {
                options[opt.name] = opt.value;
            }
            else {
                options[opt.name] += '/' + opt.value;
            }
        });
        const deviceId = this.initDevice(options, req.rsinfo);
        if (!deviceId) {
            this.logger && this.logger('CoAP data invalid: ' + JSON.stringify(options));
            return;
        }

        if (this.knownDevices[deviceId].description && options['3420'] && options['3420'] === this.knownDevices[deviceId].lastSerial) {
            this.logger && this.logger('CoAP data ignored: ' + JSON.stringify(options));
            return;
        }

        let payload = req.payload.toString();
        if (!payload.length) {
            this.logger && this.logger('CoAP payload empty: ' + JSON.stringify(options));
            return;
        }
        try {
            payload = JSON.parse(payload);
        }
        catch (err) {
            this.emit('error', err);
            return;
        }

        if (this.knownDevices[deviceId].offlineTimer) {
            clearTimeout(this.knownDevices[deviceId].offlineTimer);
            this.knownDevices[deviceId].offlineTimer = null;
        }

        this.knownDevices[deviceId].online = true;

        this.knownDevices[deviceId].offlineTimer = setTimeout(() => {
            this.knownDevices[deviceId].online = false;
            this.emit('device-connection-status', deviceId, false);
        }, this.knownDevices[deviceId].validity * 1000);

        this.logger && this.logger('CoAP status package received: ' + JSON.stringify(options) + ' / ' + JSON.stringify(payload));
        if (emit) this.emit('update-device-status', deviceId, payload);
        if (!this.knownDevices[deviceId].online) this.emit('device-connection-status', deviceId, true);
        callback && callback(deviceId, payload);
    }

    listen(callback) {
        this.coapServer = coap.createServer({
        	multicastAddress: '224.0.1.187'
        });

        this.coapServer.on('request', (req, res) => {
            //this.logger && this.logger(JSON.stringify(req));
            if (req.url && req.url === '/cit/s' && req.code && req.code === '0.30') {
                res.end();
                this.handleDeviceStatus(req, true);
            }
        });

        // the default CoAP port is 5683
        this.coapServer.listen(5683, () => {
            callback && callback();
        });
    }

    // Call this method to discover all devices in the network and get their descriptions
    discoverDevices(callback) {
        this.logger && this.logger('Send CoAP multicast request for discovery');
        const req = coap.request({
            host: '224.0.1.187',
            //port: 5683,
            method: 'GET',
            pathname: '/cit/s',
            multicast: true,
            multicastTimeout: 500
        });
/*        req.on('response', (res) => {
            this.logger && this.logger('multicast response');
            res.pipe(process.stdout);
            res.on('end', () => {
                console.log(res.options);
                console.log(res.payload);
            });
        });*/
        req.end();
        callback && callback();
    }

    // call this at the end to end listening for updates
    stopListening(callback) {
        if (this.coapServer) {
            this.coapServer.close();
            this.coapServer = null;
            this.emit('disconnect');
        }
        callback && callback(null);
    }

    // call this with a device ID to get the description
    getDeviceDescription(deviceId, callback, retryCounter) {
        let ip;
        if (!retryCounter) retryCounter = 0;
        if (retryCounter > 2) {
            return callback && callback(new Error('timeout on response'));
        }
        if (deviceId.includes('#')) {
            if (!this.knownDevices[deviceId] || !this.knownDevices[deviceId].ip) {
                return callback && callback('device unknown');
            }
            ip = this.knownDevices[deviceId].ip;
        }
        else ip = deviceId;
        this.logger && this.logger('CoAP device description request for ' + deviceId + ' to ' + ip + '(' + retryCounter + ')');
        let retryTimeout = null;
        try {
            const req = coap.request({
                host: ip,
                //port: 5683,
                method: 'GET',
                pathname: '/cit/d'
            });

            retryTimeout = setTimeout(() => {
                this.getDeviceDescription(deviceId, callback, ++retryCounter);
                callback = null;
            }, 2000);
            req.on('response', (res) => {
                clearTimeout(retryTimeout);
                const options = {};
                res.options.forEach((opt) => {
                    if (!options[opt.name]) {
                        options[opt.name] = opt.value;
                    }
                    else {
                        options[opt.name] += '/' + opt.value;
                    }
                });
                this.logger && this.logger('CoAP response: ' + JSON.stringify(options));

                const deviceId = this.initDevice(options, res.rsinfo);
                if (!deviceId) return;

                let payload = res.payload.toString();
                if (!payload.length) {
                    this.logger && this.logger('CoAP payload empty: ' + JSON.stringify(options));
                    return;
                }
                try {
                    payload = JSON.parse(payload);
                }
                catch (err) {
                    this.emit('error', err);
                    return;
                }
                this.logger && this.logger('Device description received: ' + JSON.stringify(options) + ' / ' + JSON.stringify(payload));
                if (req.rsinfo) {
                    this.knownDevices[deviceId].ip = req.rsinfo.address;
                    this.knownDevices[deviceId].port = req.rsinfo.port;
                }
                this.knownDevices[deviceId].description = payload;
                callback && callback(null, deviceId, payload, this.knownDevices[deviceId].ip);
                callback = null;
                return;
            });

            req.end();
        }
        catch (e) {
            if (retryTimeout) clearTimeout(retryTimeout);
            callback && callback(e);
            callback = null;
        }
    }

    // call this with a device ID to get the data for one device
    getDeviceStatus(deviceId, callback, retryCounter) {
        let ip;
        if (!retryCounter) retryCounter = 0;
        if (retryCounter > 2) {
            return callback && callback(new Error('timeout on response'));
        }
        if (deviceId.includes('#')) {
            if (!this.knownDevices[deviceId] || !this.knownDevices[deviceId].ip) {
                return callback && callback('device unknown');
            }
            ip = this.knownDevices[deviceId].ip;
        }
        else ip = deviceId;
        this.logger && this.logger('CoAP device status request for ' + deviceId + ' to ' + ip + '(' + retryCounter + ')');

        let retryTimeout = null;
        try {
            const req = coap.request({
                host: ip,
                method: 'GET',
                pathname: '/cit/s',
            });

            retryTimeout = setTimeout(() => {
                this.getDeviceStatus(deviceId, callback, ++retryCounter);
                callback = null;
            }, 2000);
            req.on('response', (res) => {
                clearTimeout(retryTimeout);
                this.handleDeviceStatus(res, (deviceId, payload) => {
                    return callback && callback(null, deviceId, payload, this.knownDevices[deviceId].ip);
                });
            });

            req.end();
        }
        catch (e) {
            if (retryTimeout) clearTimeout(retryTimeout);
            callback && callback(e);
            callback = null;
        }
    }

    // call this with a list of device IDs to request device updates as events
    requestDeviceStatusUpdates(devices) {
        if (!Array.isArray(devices)) {
            return false;
        }
        devices.forEach((deviceId) => {
            this.getDeviceStatus(deviceId, (err, deviceId, data, ip) => {
                if (err) return;
                this.emit('update-device-status', deviceId, data);
            });
        });
    }


    controlDevice(deviceId, path, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = {};
        }
        if (!this.knownDevices[deviceId] || !this.knownDevices[deviceId].ip) {
            return callback && callback('device unknown');
        }
        this.doGet('http://' + this.knownDevices[deviceId].ip + path, params, (data, response) => {
            if (data && response.statusCOde === 200) {
                this.logger && this.logger('REST Response ' + JSON.stringify(data));
                return callback && callback(null, data);
            }
            callback && callback(data);
        });
    }


    doGet(url, parameters, callback) {
        if (typeof parameters === 'function') {
            callback = parameters;
            parameters = undefined;
        }
        var data = {
            'parameters':    parameters,
            'requestConfig': {
                'timeout':   1000, //request timeout in milliseconds
                'noDelay':   true, //Enable/disable the Nagle algorithm
                'keepAlive': false //Enable/disable keep-alive functionalityidle socket.
                //keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
            },
            'responseConfig': {
                'timeout': 1000 //response timeout
            }
        };
        this.logger && this.logger('Call REST GET ' + url + ' with ' + JSON.stringify(parameters));
        var req = this.restClient.get(url, data, callback);
        req.on('error', function (err) {
            if (err.code) {
                err = err.code;
            }
            else if (err.message) {
                err = err.message;
            }
            else {
                err = err.toString();
            }

            callback(new Error('Error while communicating with Shelly device: ' + err));
        });
    }
}

module.exports = ShellyIot;
