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
        'ip': '192.168.0.1',
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
        'ip': '192.168.0.2',
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
    },
    'SHSW-21#C36A17#1': {
        'ip': '192.168.0.3',
        'description': {
            "blk": [{
                "I": 0,
                "D": "Relay0"
            }, {
                "I": 1,
                "D": "Relay1"
            }],
            "sen": [{
                "I": 112,
                "T": "Switch",
                "R": "0/1",
                "L": 0
            }, {
                "I": 122,
                "T": "Switch",
                "R": "0/1",
                "L": 1
            }, {
                "I": 111,
                "T": "W",
                "R": "",
                "L": 0
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
            }]
        }
    },
    'SHPLG-1#99CE40#1': {
        'ip': '192.168.0.4',
        'description': {
            "blk": [{
                "I": 0,
                "D": "Relay0"
            }],
            "sen": [{
                "I": 111,
                "T": "W",
                "R": "",
                "L": 0
            }, {
                "I": 112,
                "T": "Switch",
                "R": "0/1",
                "L": 0
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
            }]
        }
    },
    'SHBLB-1#A64707#1': {
        'ip': '192.168.0.5',
        'description': {
            "blk": [{
                "I": 0,
                "D": "RGBW"
            }],
            "sen": [{
                "I": 111,
                "T": "Red",
                "R": "0/65535",
                "L": 0
            }, {
                "I": 121,
                "T": "Green",
                "R": "0/65535",
                "L": 0
            }, {
                "I": 131,
                "T": "Blue",
                "R": "0/65535",
                "L": 0
            }, {
                "I": 141,
                "T": "White",
                "R": "0/65535",
                "L": 0
            }, {
                "I": 151,
                "T": "VSwitch",
                "R": "0/1",
                "L": 0
            }],
            "act": [{
                "I": 211,
                "D": "RGBW",
                "L": 0,
                "P": [{
                    "I": 2011,
                    "T": "Red",
                    "R": "0/65535"
                }, {
                    "I": 2021,
                    "T": "Green",
                    "R": "0/65535"
                }, {
                    "I": 2031,
                    "T": "Blue",
                    "R": "0/65535"
                }, {
                    "I": 2041,
                    "T": "White",
                    "R": "0/65535"
                }, {
                    "I": 2051,
                    "T": "VSwitch",
                    "R": "VSwitch",
                    "P": 0
                }]
            }]
        }
    },
    'SHSW-22#A08186#1': {
        'ip': '192.168.0.6',
        'description': {
            "blk": [{
                "I": 0,
                "D": "Relay0"
            }, {
                "I": 1,
                "D": "Relay1"
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
            }]
        }
    },
    'SHSW-1#5B89AE#1': {
        'ip': '192.168.0.7',
        'description': {
            "blk": [{
                "I": 0,
                "D": "Relay0"
            }],
            "sen": [{
                "I": 112,
                "T": "Switch",
                "R": "0/1",
                "L": 0
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
            }]
        }
    },
    'SH2LED-1#313E09#1': {
        'ip': '192.168.0.8',
        'description': {
            "blk": [{
                "I": 0,
                "D": "Channel0"
            }, {
                "I": 1,
                "D": "Channel1"
            }],
            "sen": [{
                "I": 111,
                "T": "Brightness",
                "R": "0/100",
                "L": 0
            }, {
                "I": 112,
                "T": "Switch",
                "R": "0/1",
                "L": 0
            }, {
                "I": 121,
                "T": "Brightness",
                "R": "0/100",
                "L": 1
            }, {
                "I": 122,
                "T": "Switch",
                "R": "0/1",
                "L": 1
            }],
            "act": [{
                "I": 211,
                "D": "Brightness",
                "L": 0,
                "P": [{
                    "I": 2011,
                    "D": "Set",
                    "R": "0/100"
                }]
            }, {
                "I": 212,
                "D": "Switch",
                "L": 0,
                "P": [{
                    "I": 2012,
                    "D": "ToState",
                    "R": "0/1"
                }]
            }, {
                "I": 221,
                "D": "Brightness",
                "L": 1,
                "P": [{
                    "I": 2021,
                    "D": "Set",
                    "R": "0/100"
                }]
            }, {
                "I": 222,
                "D": "Switch",
                "L": 1,
                "P": [{
                    "I": 2022,
                    "D": "ToState",
                    "R": "0/1"
                }]
            }]
        }
    },
    'SHRGBWW-01#CCA8AE#1': {
        'ip': '192.168.0.9',
        'description': {
            "blk": [{
                "I": 0,
                "D": "RGBW"
            }],
            "sen": [{
                "I": 111,
                "T": "Red",
                "R": "0/65535",
                "L": 0
            }, {
                "I": 121,
                "T": "Green",
                "R": "0/65535",
                "L": 0
            }, {
                "I": 131,
                "T": "Blue",
                "R": "0/65535",
                "L": 0
            }, {
                "I": 141,
                "T": "White",
                "R": "0/65535",
                "L": 0
            }, {
                "I": 151,
                "T": "VSwitch",
                "R": "0/1",
                "L": 0
            }],
            "act": [{
                "I": 211,
                "D": "RGBW",
                "L": 0,
                "P": [{
                    "I": 2011,
                    "T": "Red",
                    "R": "0/65535"
                }, {
                    "I": 2021,
                    "T": "Green",
                    "R": "0/65535"
                }, {
                    "I": 2031,
                    "T": "Blue",
                    "R": "0/65535"
                }, {
                    "I": 2041,
                    "T": "White",
                    "R": "0/65535"
                }, {
                    "I": 2051,
                    "T": "VSwitch",
                    "R": "VSwitch",
                    "P": 0
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
    },
    'SHSW-21#C36A17#1': {
        "G": [
            [0, 112, 1],
            [0, 122, 0],
            [0, 111, 0.000000]
        ]
    },
    'SHPLG-1#99CE40#1': {
        "G": [
            [0, 111, 0.000000],
            [0, 112, 0]
        ]
    },
    'SHBLB-1#A64707#1': {
        "G": [
            [0, 111, 227],
            [0, 121, 1],
            [0, 131, 255],
            [0, 141, 0],
            [0, 151, 1]
        ]
    },
    'SHSW-22#A08186#1': {
        "G": [
            [0, 111, 0.000000],
            [0, 112, 0],
            [0, 121, 0.000000],
            [0, 122, 0]
        ]
    },
    'SHSW-1#5B89AE#1': {
        "G": [
            [0, 112, 0]
        ]
    },
    'SH2LED-1#313E09#1': {
        "G": [
            [0, 111, 89],
            [0, 112, 0],
            [0, 121, 65],
            [0, 122, 0]
        ]
    },
    'SHRGBWW-01#CCA8AE#1': {
        "G": [
            [0, 111, 255],
            [0, 121, 22],
            [0, 131, 60],
            [0, 141, 0],
            [0, 151, 1]
        ]
    }
};


class ShellyIot extends EventEmitter {
    // Constructor, call with options object, content tbd :)
    constructor(options) {
        super();

        this.options = options;
    }

    listen(callback) {
        this.testEmitter = setInterval(() => {
            const keys = Object.keys(dummyData);
            const num = Math.floor(Math.random() * keys.length);
            this.requestDeviceStatusUpdates([keys[num]]);
            if (num > 0 && Math.floor(Math.random() * 50) < 20) this.emit('device-connection-status', keys[num-1], false);
        }, 10000);

        callback && callback();
    }

    // Call this method to discover all devices in the network and get their descriptions
    discoverDevices(callback) {
        callback && callback();
    }

    // call this at the end to end listening for updates
    stopListening(callback) {
        if (this.testEmitter) {
            clearInterval(this.testEmitter);
            this.testEmitter = null;
        }
        this.emit('disconnect');
        callback && process.nextTick(() => callback(null));
    }

    // call this with a device ID to get the description
    getDeviceDescription(device, callback) {
        if (dummyDesc[device] && dummyDesc[device].description) {
            callback && process.nextTick(() => callback(null, device, dummyDesc[device].description, dummyDesc[device].ip));
            return;
        }
        for (let key in dummyDesc) {
            if (dummyDesc[key].ip === device) {
                callback && process.nextTick(() => callback(null, key, dummyDesc[key].description, dummyDesc[key].ip));
                return;
            }
        }
        callback && callback(new Error('device unknown'));
    }

    // call this with a device ID to get the data for one device
    getDeviceStatus(device, callback) {
        if (dummyData[device]) {
            callback && process.nextTick(() => callback(null, device, dummyData[device], dummyDesc[device].ip));
            return;
        }
        for (let key in dummyDesc) {
            if (dummyDesc[key].ip === device && dummyData[key]) {
                callback && process.nextTick(() => callback(null, key, dummyData[key], dummyDesc[key].ip));
                return;
            }
        }
        callback && callback(new Error('device unknown'));
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

    callDevice(deviceId, path, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = {};
        }
        callback && process.nextTick(() => callback(null, {'success': true}));
    }
}

module.exports = ShellyIot;
