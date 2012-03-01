var colors = require('colors')
  , mdns = require('mdns')
  , packageJSON = require('./package.json')
  , appVersion = packageJSON.version.replace(/\./gi, '-')
  ;

var txtRecord = {
    name: 'dis.io manager'
};

var ad = mdns.createAdvertisement(mdns.udp('disio-manager', 'v' + appVersion), 1337, { 'txtRecord': txtRecord });
ad.start();