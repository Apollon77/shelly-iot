# shelly-iot
[![NPM version](http://img.shields.io/npm/v/shelly-iot.svg)](https://www.npmjs.com/package/shelly-iot)
[![Downloads](https://img.shields.io/npm/dm/shelly-iot.svg)](https://www.npmjs.com/package/shelly-iot)
[![Dependency Status](https://gemnasium.com/badges/github.com/Apollon77/shelly-iot.svg)](https://gemnasium.com/github.com/Apollon77/shelly-iot)
[![Code Climate](https://codeclimate.com/github/Apollon77/shelly-iot/badges/gpa.svg)](https://codeclimate.com/github/Apollon77/shelly-iot)

**Tests:**
[![Test Coverage](https://codeclimate.com/github/Apollon77/shelly-iot/badges/coverage.svg)](https://codeclimate.com/github/Apollon77/shelly-iot/coverage)
Linux/Mac:
[![Travis-CI](http://img.shields.io/travis/Apollon77/shelly-iot/master.svg)](https://travis-ci.org/Apollon77/shelly-iot)
Windows: [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/Apollon77/shelly-iot?branch=master&svg=true)](https://ci.appveyor.com/project/Apollon77/shelly-iot/)

[![NPM](https://nodei.co/npm/shelly-iot.png?downloads=true)](https://nodei.co/npm/shelly-iot/)

This library supports reading and controlling [Shelly](https://shelly.cloud/) devices.

The library communicates with Shelly devices by REST api (for controlling) and the CoAP protocol with the default Shelly firmware (no flashing of firmware needed!).
Because CoAP use multicast UDP packages, the Shelly devices has to be in the same subnet like the host you use the library on. If you use them in a docker container, the container has to run in host or macvlan modus.

The library provides an event driven interface to inform you about status updates that are received using COAP packages.

## Usage example


tbd



## Method description

### ShellyIot(options)
Constructor to init the object. In options you can provide:
* "logger" to be used for debug logging.
* "user" and "password" for Shelly devices with authentication activated. It is assumed that all devices use same credentials

### listen(callback)
Starts listening for CoAP packages in the network. Callback is called without parameters after listening started.

### stopListening(callback)  
Stops listening for CoAP package. Callback is provided for convenience and called synchron without parameters.

### discoverDevices(callback)
Sends a multicast package so that all devices should answer with a status package. Callback is provided for convenience and called synchron without parameters.

### getDeviceDescription(deviceIdOrIP, callback)
Contacts a known device by Device-ID or by IP to request the device description.
Callback is called with the following parameters: error, deviceId, payload, deviceIp

### getDeviceStatus(deviceId, callback)
Contacts a known device by Device-ID or by IP to request the device status update.
Callback is called with the following parameters: error, deviceId, payload, deviceIp

### requestDeviceStatusUpdates(devices)
You can provide an array of Device-IDs or IP to request status updates. They will be emitted as events once received.

### callDevice(deviceIdorIp, path, params, callback)
Sends a REST call to a known device by Device-ID or by IP to a certain path with parameters. The result is returned as callback.
Callback is called with the following parameters: error, response data

### Emitted events
#### errors
If an error happens while parsing the received data an error event is emitted. Listening will continue, so it is no "fatal error"!

#### device-connection-status
Emits connection status information for a device. A device is considered "offline" when no status update is received longer then the defined timeframe.
Parameters are: deviceId and connection-status true/false

#### update-device-status
Emits device status update information for a device.
Parameters are: deviceId and status payload

#### disconnect
Emitted when listener disconnects, normally when you call stopListening()


## Testing your code
The library also offers a index-dummy.js which offers the same interface then the real library and emits and provides example data.

## Supported/Tested devices
* Shelly1 (SHSW-1, Verified)
* Shelly2 (SHSW-21/SHSW-22, Verified)
* ShellyPlug (SHPLG-1, Verified)
* Shelly4Pro (SHSW-44, Reading works, Controlling not verified)
* Shelly Sense (SHSEN-1, Reading not verified)

## More details needed to fully implement (Debug log)
* ShellyBulb (SHBLB-1, reading some data may work, no control)
* Shelly2LED (SH2LED-1, reading some data may work, no control)
* ShellyRGBW (SHRGBWW-01, reading some data may work, no control)

## Todo
* add example code
* add proper deep testing (maybe using mock-dgram?)
* more detailed docs?

## Changelog
### 1.1.2 (2021-11-05)
* (Apollon77) Update node-coap dep

### 1.1.1 (2020-11-14)
* (Apollon77) fix errors

### 1.1.0 (2020-07-09)
IMPORTANT: This version is tested only in the current Node.js LTS versions (10.x, 12.x, 14.x). It should still work in Node.js 8.x but no guarantees!

* (Apollon77) update node-coap library to fix crashes

### v1.0.6 (2020.04.13)
* subscribe to error and timeout event and forward as error to the library caller
* Add option to set a specific multicast interface for COAP-server (thanks tol @SamLowrie)

### v1.0.5 (2020.01.25)
* bugfixing a npm publish error

### v1.0.4 (2019.07.29)
* add error handling for CoAP requests

### v1.0.3 (2019.07.14)
* also emit device status update when IP has changed

### v1.0.2 (2018.12.30)
* check if payload is identical. Work around for Shelly H&T with equal serial numbers in messages with new payload

### v1.0.1 (2018.11.11)
* fix online flag, finally

### v1.0.0 (2018.11.10)
* fix online flag

### v0.2.0 (2018.09.29)
* add option to also handle password protected shelly devices on REST calls

### v0.1.1 (2018.09.22)
* small fix for better online status handling

### v0.1.0 (2018.09.20)
* initial version
