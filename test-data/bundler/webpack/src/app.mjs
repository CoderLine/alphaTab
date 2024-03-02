import * as alphaTab from '../../../../dist/alphaTab.mjs'

const toolbar = document.createElement('div');
toolbar.style.position = 'absolute';
toolbar.style.top = "0px";
toolbar.style.left = "0px";
toolbar.style.right = "0px";
toolbar.style.height = "20px";



const element = document.querySelector('#alphaTab');
const api = new alphaTab.AlphaTabApi(element, {
  core: {
    file: "https://www.alphatab.net/files/canon.gp",
    // Resolve URL as we copied the files
    fontDirectory: new URL("/font/bravura/", document.location).href,
    logLevel: alphaTab.LogLevel.Debug
  },
  player: {
    enablePlayer: true,
    // Resolve URL as we copied the files
    soundFont: new URL("/font/sonivox/sonivox.sf2", document.location).href
  },
});

const playPause = document.querySelector('#playPause');
playPause.onclick = ()=>{
  api.playPause();
};