// https://github.com/sandeepmistry/bleno/tree/master/examples/echo
var ECHO_SERVICE = 'ec00';
var ECHO_CHARACTERISTIC = 'ec0e';

var app = {
    initialize: function() {
        this.bindEvents();
        this.showMainPage();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('backbutton', this.onBackButton, false);
        deviceList.addEventListener('click', this.connect, false);
        refreshButton.addEventListener('click', this.refreshDeviceList, false);
        startNotificationButton.addEventListener('click', this.addNotification, false);
        stopNotificationButton.addEventListener('click', this.removeNotification, false);
        disconnectButton.addEventListener('click', this.disconnect, false);
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empty the list
        ble.scan([ECHO_SERVICE], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li');
        listItem.innerHTML = device.name + '<br/>' +
            device.id + '<br/>' +
            'RSSI: ' + device.rssi;
        listItem.dataset.deviceId = device.id;
        deviceList.appendChild(listItem);
    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId;
        ble.connect(deviceId, app.onConnect, app.onError);
    },
    onConnect: function(peripheral) {
        var pre = document.querySelector('pre');
        pre.innerHTML = JSON.stringify(peripheral, null, 2);
        app.peripheral = peripheral;
        app.showDetailPage();
    },
    onData: function(buffer) {
        // just log. We're not worried about this data. 
        console.log(new Uint8Array(buffer));
    },
    disconnect: function(e) {
        if (app.peripheral && app.peripheral.id) {
            ble.disconnect(app.peripheral.id, app.showMainPage, app.onError);
        }
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onBackButton: function() {
        if (mainPage.hidden) {
            app.disconnect();
        } else {
            navigator.app.exitApp();
        }
    },
    addNotification: function() {
        ble.startNotification(
            app.peripheral.id, 
            ECHO_SERVICE, 
            ECHO_CHARACTERISTIC, 
            app.onData, 
            app.onError);
    },
    removeNotification: function() {
        ble.stopNotification(
            app.peripheral.id, 
            ECHO_SERVICE, 
            ECHO_CHARACTERISTIC, 
            function(result) {
                navigator.notification.alert(JSON.stringify(result))
            }, 
            app.onError);    
    },
    onError: function(reason) {
        if (typeof reason === 'object') {
            var device = reason;
            navigator.notification.alert('Device ' + device.id + ' disconnected', app.showMainPage, 'Disconnected');
        } else {
            navigator.notification.alert(reason, app.showMainPage, 'Error');            
        }
    }
};

app.initialize();
