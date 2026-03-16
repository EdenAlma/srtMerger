import { srtCombine } from "./srtCombine.js"
import { addEvents } from "./events.js"
import { renderSrt } from "./render.js";
import { srtData, thresh, cps, alignCues} from "./model.js";

const mergeBtn = document.getElementById('mergeBtn');
const saveJson = document.getElementById('save-json');
const loadJson = document.getElementById('load-json');
let cpl;


mergeBtn.addEventListener('click', async () => {
  const srt1File = document.getElementById("srt1").files[0];
  const srt2File = document.getElementById("srt2").files[0];
  let temp = await srtCombine.getCombinedSrt(srt1File, srt2File);
  thresh.value = document.getElementById("threshold").value;
  srtData.push(...temp)
  cps.value = document.getElementById("cps").value;
  cpl = document.getElementById("cpl").value;
  renderSrt(srtData);
  //const root = document.documentElement;
  //root.style.setProperty('--extend', thresh + 'px');
  let x = 0;
  //split all the cue ---> add something to not split if theres no corresponding one 
  while (x < srtData.length) {

    if (srtData[x].hasOverlap()) {
      srtData[x].split();
    }
    x++;
  }
  addEvents();
  alignCues();
  mergeBtn.parentNode.removeChild(mergeBtn);
})

saveJson.addEventListener('click', () => {
  downloadFile(JSON.stringify(srtData, null, 2), 'project.json', "application/json");
})


function downloadFile(content, filename, type = "text/plain") {
  const blob = new Blob([content], { type });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
}




const fileInput = document.getElementById("json-file-input");

loadJson.addEventListener("click", () => {
  fileInput.click(); // opens file picker
});

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    srtData.splice(0);
    srtData.push(...data)
    renderSrt(srtData);
    addEvents();
    alignCues();

  } catch (err) {
    console.error("Invalid JSON file", err);
  }

  // reset input so the same file can be selected again
  fileInput.value = "";
});

