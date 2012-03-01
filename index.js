var colors = require('colors')
  , mdns = require('mdns')
  , packageJSON = require('./package.json')
  , appVersion = 'v' + packageJSON.version.split('.').slice(0, -1).join('-')
  ;

var txtRecord = {
    name: 'dis.io manager'
  , taskId: Number
};

var ad = mdns.createAdvertisement(mdns.udp('disio-manager', 'v' + appVersion), 1337, { 'txtRecord': txtRecord });
ad.start();