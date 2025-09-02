import * as alphaTab from "@coderline/alphatab";

export function openFile(api: alphaTab.AlphaTabApi, file: Blob) {
  const reader = new FileReader();
  reader.onload = (data) => {
    api.load(data.target?.result, [0]);
  };
  reader.readAsArrayBuffer(file);
}

export function openInputFile(api: alphaTab.AlphaTabApi) {
  const input = document.createElement('input');
  input.type = 'file';
  if (!isIOS()) {
    input.accept = '.gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.mxml,.xml,.capx';
  }
  input.onchange = () => {
    if (input.files?.length === 1) {
      openFile(api, input.files[0]);
    }
  };
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};


export function downloadFile(api: alphaTab.AlphaTabApi) {
  const exporter = new alphaTab.exporter.Gp7Exporter();
  const score = api.score!;
  const data = exporter.export(score, api.settings);
  const a = document.createElement('a');
  a.download = score.title.length > 0 ? `${score.title.trim()}.gp` : 'Untitled.gp';
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/gp' }));
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


const iOSPlatforms = new Set(['iPhone', 'iPad', 'iPod']);
function isIOS() {
  // Tested: 
  // - iPad Pro 12.9 - iOS 12 (navigator.platform = "iPad")
  // - iPad Pro 11 2020 - iOS 13 (navigator.platform = "iPad")
  // - iPad Air 4 - iOS 14 (navigator.platform = "iPad")
  // - iPad Mini 2021 - iOS 15 (navigator.platform = "iPad")
  // - iPad Pro 12.9 2022 - iOS 16 (navigator.platform = "iPad")
  // - iPad Pro 12.9 2021 - iOS 17 (navigator.platform = "MacIntel" && navigator.maxTouchPoints > 1)
  // - iPad 9th - iOS 18 (navigator.platform = "iPad")
  // - iPhone XS - iOS 12 (navigator.platform = "iPhone")
  // - iPhone 11 - iOS 13 (navigator.platform = "iPhone")
  // - iPhone 12 - iOS 14 (navigator.platform = "iPhone")
  // - iPhone 13 - iOS 15 (navigator.platform = "iPhone")
  // - iPhone 14 - iOS 16 (navigator.platform = "iPhone")
  // - iPhone 15 - iOS 17 (navigator.platform = "iPhone")
  // - iPhone 16 - iOS 18 (navigator.platform = "iPhone")
  // - iPhone 16 - iOS 18.6 (navigator.platform = "iPhone")
  return iOSPlatforms.has(navigator.platform) ||
    navigator.platform == "MacIntel" && navigator.maxTouchPoints > 1;
}
