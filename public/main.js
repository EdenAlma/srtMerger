import { addEvents } from "./events.js"
import { renderSrt } from "./render.js";
import { srtData, thresh, cps, alignCues, updateProgress } from "./model.js";
import { srtToCueJSON, downloadFile, jsonToCue, createSrt } from "./srtio.js";

const saveJson = document.getElementById('save-json');
const loadJson = document.getElementById('load-json');
const saveSrt = document.getElementById('save-srt');
const loadSrt = document.getElementById('load-srt');
const srtFiles = document.getElementById('srt-file-input');
const jsonFileInput = document.getElementById('json-file-input');

loadSrt.addEventListener('click', async () => {
  //get left file -> json
  srtFiles.click();
  let files = await waitForFiles(srtFiles);
  if(files.length != 2) console.error('Two files must be selected!');
  let leftOffset = parseInt(prompt("Offset (ms) for " + files[0].name, 0));
  let rightOffset = parseInt(prompt("Offset (ms) for " + files[1].name, 0));
  let file1 = await srtToCueJSON(files[0], 'left', leftOffset)
  let file2 = await srtToCueJSON(files[1], 'right', rightOffset)
  //combine into a single array and push into srtData
  let comboArray = file1.concat(file2);
  comboArray.sort((a, b) => { return a.startTime - b.startTime })
  srtData.push(...comboArray)
  renderSrt(srtData);
  splitAndAlign();
  addEvents();
})

async function waitForFiles(fileElement) {
  return new Promise(resolve => {
    const handler = () => {
      fileElement.removeEventListener('change', handler);
      resolve(fileElement.files);
    };
    fileElement.addEventListener('change', handler);
  });
}

function splitAndAlign() {
  let x = 0;
  //split all the cue ---> add something to not split if theres no corresponding one 
  while (x < srtData.length) {

    if (srtData[x].hasOverlap()) {
      srtData[x].split();
    }
    x++;
  }
  alignCues();
}

saveJson.addEventListener('click', () => {
  let fileName = prompt("Enter file name (without extension):", "data");
  if (!fileName) fileName = "data"; // fallback if user cancels or enters nothing
  downloadFile(JSON.stringify(srtData, null, 2), fileName, "application/json")
})

loadJson.addEventListener('click', async () => {
  jsonFileInput.click();
  try {
    // Wait for the user to select a file
    const jsonFile = await waitForFiles(jsonFileInput);
    // Read the file as text
    const text = await jsonFile.text(); // modern File API supports .text()
    // Parse JSON
    const jsonObj = JSON.parse(text);
    jsonToCue(jsonObj);
    renderSrt(srtData);
    updateProgress();
    addEvents();
  } catch (err) {
    console.error('Error loading JSON:', err);
  }
})

saveSrt.addEventListener('click', async () => {
  let fileName = prompt("Enter file name (without extension):", "data");
  if (!fileName) fileName = "data"; // fallback if user cancels or enters nothing
  downloadFile(createSrt(), fileName + '.srt', "text/srt")
})