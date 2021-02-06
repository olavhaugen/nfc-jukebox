const fs = require('fs');
const { NFC } = require('nfc-pcsc');
var ndef = require('@taptrack/ndef');
const { Sonos, SpotifyRegion } = require('sonos');
const nfc = new NFC();

let settingsData = fs.readFileSync('settings.json');
let settings = JSON.parse(settingsData);

console.log('Sonos NFC Jukebox!');
console.log('Please touch NFC to start playing...');

const sonos = new Sonos(settings.sonosHost);
sonos.setSpotifyRegion(SpotifyRegion.EU);

nfc.on('reader', (reader) => {
  reader.on('card', () => {
    reader
      .read(4, 128)
      .then((data) => {
        const message = ndef.Message.fromBytes(data);
        const records = message.getRecords();
        const recordContents = ndef.Utils.resolveTextRecord(records[0]);
        const spotifyUri = recordContents.content;
        console.log(`Playing ${spotifyUri}`);
        sonos.play(spotifyUri);
      })
      .catch((e) => {
        console.error('Failed to read', e);
      });
  });
});
