/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const EventEmitter = require('events');


// For now we use these dummy data :-)
const dummyDesc = {
    'SHSEN-1#4B3F9E#1': {
        'ip': '192.168.0.108',
        'description': {
            "blk": [{
                "I": 1,
                "D": "sensors"
            }],
            "sen": [{
                "I": 11,
                "D": "motion",
                "T": "S",
                "R": "0/1",
                "L": 1
            }, {
                "I": 22,
                "D": "charger",
                "T": "S",
                "R": "0/1",
                "L": 1
            }, {
                "I": 33,
                "D": "temperature",
                "T": "T",
                "R": "-40/125",
                "L": 1
            }, {
                "I": 44,
                "D": "humidity",
                "T": "H",
                "R": "0/100",
                "L": 1
            }, {
                "I": 66,
                "D": "lux",
                "T": "L",
                "R": "0/1",
                "L": 1
            }, {
                "I": 77,
                "D": "battery",
                "T": "H",
                "R": "0/100",
                "L": 1
            }]
        }
    },
    'SHSW-44#06231A#1': {
        'ip': '192.168.0.102',
        'description': {
            "blk": [{
                "I": 0,
                "D": "Relay0"
            }, {
                "I": 1,
                "D": "Relay1"
            }, {
                "I": 2,
                "D": "Relay2"
            }, {
                "I": 3,
                "D": "Relay3"
            }],
            "sen": [{
                "I": 111,
                "T": "W",
                "R": "0/2650",
                "L": 0
            }, {
                "I": 112,
                "T": "Switch",
                "R": "0/1",
                "L": 0
            }, {
                "I": 121,
                "T": "W",
                "R": "0/2650",
                "L": 1
            }, {
                "I": 122,
                "T": "Switch",
                "R": "0/1",
                "L": 1
            }, {
                "I": 131,
                "T": "W",
                "R": "0/2650",
                "L": 2
            }, {
                "I": 132,
                "T": "Switch",
                "R": "0/1",
                "L": 2
            }, {
                "I": 141,
                "T": "W",
                "R": "0/2650",
                "L": 3
            }, {
                "I": 142,
                "T": "Switch",
                "R": "0/1",
                "L": 3
            }],
            "act": [{
                "I": 211,
                "D": "Switch",
                "L": 0,
                "P": [{
                    "I": 2011,
                    "D": "ToState",
                    "R": "0/1"
                }]
            }, {
                "I": 221,
                "D": "Switch",
                "L": 1,
                "P": [{
                    "I": 2021,
                    "D": "ToState",
                    "R": "0/1"
                }]
            }, {
                "I": 231,
                "D": "Switch",
                "L": 2,
                "P": [{
                    "I": 2031,
                    "D": "ToState",
                    "R": "0/1"
                }]
            }, {
                "I": 241,
                "D": "Switch",
                "L": 3,
                "P": [{
                    "I": 2041,
                    "D": "ToState",
                    "R": "0/1"
                }]
            }]
        }
    }
};

const dummyData = {
    'SHSEN-1#4B3F9E#1': {
        "G": [
            [0, 11, 0],
            [0, 22, 0],
            [0, 33, 24.585573],
            [0, 44, 59.905988],
            [0, 66, 11.688312],
            [0, 77, 100]
        ]
    },
    'SHSW-44#06231A#1': {
        "G": [
            [0, 111, 0.000000],
            [0, 112, 1],
            [0, 121, 0.000000],
            [0, 122, 1],
            [0, 131, 0.000000],
            [0, 132, 0],
            [0, 141, 0.000000],
            [0, 142, 0]
        ]
    }
};


class ShellyIot extends EventEmitter {
    // Constructor, call with options object, content tbd :)
    constructor(options) {
        super();

        this.options = options;

        this.testEmitter = setInterval(() => {
            this.requestDeviceStatusUpdates(['SHSEN-1#4B3F9E#1']);
        }, 60000);
    }


    // Call this method to discover all devices in the network and get their descriptions
    discoverDevices(callback) {
        callback && callback(null, dummyDesc);
    }

    // call this at the end to end listening for updates
    stopListening(callback) {
        if (this.testEmitter) {
            clearInterval(this.testEmitter);
            this.testEmitter = null;
        }
        callback && process.nextTick(() => callback(null));
    }

    // call this with a device ID to get the description
    getDeviceDescription(device, callback) {
        if (dummyDesc[device] && dummyDesc[device].description) {
            callback && process.nextTick(() => callback(null, dummyDesc[device].description));
        }
        callback && callback(new Error('device unknown'));
    }

    // call this with a device ID to get the data for one device
    getDeviceStatus(device, callback) {
        if (dummyData[device]) {
            callback && process.nextTick(() => callback(null, dummyData[device]));
        }
        callback && callback(new Error('no data'));
    }

    // call this with a list of device IDs to request device updates as events
    requestDeviceStatusUpdates(devices) {
        if (!Array.isArray(devices)) {
            return false;
        }
        devices.forEach((device) => {
            this.emit('update-device-status', device, dummyData[device]);
        });
    }

}

module.exports = ShellyIot;
