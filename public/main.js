import { addEvents } from "./events.js"
import { renderSrt } from "./render.js";
import { srtData, thresh, cps, alignCues} from "./model.js";
import { srtToCueJSON } from "./srtio.js";

const saveJson = document.getElementById('save-json');
const loadJson = document.getElementById('load-json');
const saveSrt = document.getElementById('save-srt');
const loadSrt = document.getElementById('load-srt');
const srtFileLeft = document.getElementById('srt-file-input-left');
const srtFileRight = document.getElementById('srt-file-input-right');


loadSrt.addEventListener('click', async () => {
  //get left file -> json
  srtFileLeft.click();
  let leftFile = await waitForFile(srtFileLeft);
  let leftCues = await srtToCueJSON(leftFile, 'left')
  //get right file -> json
  srtFileRight.click();
  let rightFile = await waitForFile(srtFileRight);
  let rightCues = await srtToCueJSON(rightFile, 'right')
  //combine into a single array and push into srtData
  let comboArray = leftCues.concat(rightCues); 
  comboArray.sort((a, b) => { return a.startTime - b.startTime })
  srtData.push(...comboArray)
  renderSrt(srtData);
  splitAndAlign();
  addEvents();
})

async function waitForFile(fileElement){
  return new Promise(resolve => {
    const handler = () => {
      fileElement.removeEventListener('change', handler);
      resolve(fileElement.files[0]);
    };
    fileElement.addEventListener('change', handler);
  });
}

function splitAndAlign(){
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