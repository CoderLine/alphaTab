import * as alphaTab from "@coderline/alphatab";

export function openFile(api: alphaTab.AlphaTabApi, file: Blob) {
  const reader = new FileReader();
  reader.onload = (data) => {
    api.load(data.target?.result, [0]);
  };
  reader.readAsArrayBuffer(file);
}
