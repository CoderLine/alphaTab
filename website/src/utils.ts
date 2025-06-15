import * as alphaTab from "@coderline/alphatab";

export function openFile(api: alphaTab.AlphaTabApi, file: Blob) {
  const reader = new FileReader();
  reader.onload = (data) => {
    api.load(data.target?.result, [0]);
  };
  reader.readAsArrayBuffer(file);
}


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