import { srtCombine } from "./srtCombine.js"
import { addEvents } from "./events.js"
import { renderSrt } from "./render.js";

const mergeBtn = document.getElementById('mergeBtn');
const alignBtn = document.getElementById('alignBtn');
const srtData = [];
const selectedElements  = []
let thresh = 0;
const state = {srtData, thresh, selectedElements}

mergeBtn.addEventListener('click', async () => {
  const srt1File = document.getElementById("srt1").files[0];
  const srt2File = document.getElementById("srt2").files[0];
  let temp = await srtCombine.getCombinedSrt(srt1File, srt2File);
  srtData.push(...temp)
  //const root = document.documentElement;
  //root.style.setProperty('--extend', thresh + 'px');
  renderSrt(srtData);
  addEvents();
})

/*alignBtn.addEventListener('click', () => {
  thresh = parseInt(document.getElementById('threshold').value);
  alignAllCues(srtData)
})




function alignAllCues(cues){
  for (let i=0; i<cues.length; i++) {
    let j = i
    let nextPossibleMatch = cues[j]
    let current = cues[i]
    while(nextPossibleMatch && current.lang == nextPossibleMatch.lang){
      j++;
      nextPossibleMatch = cues[j]
    }
    
    if(nextPossibleMatch){
      if(isMatch(current,nextPossibleMatch, thresh)){
        alignCues(current,nextPossibleMatch)
      }else{
        continue;
      }
    }else{
      break;
    }
  }

  clearDom();
  renderSrtInit(cues);
}*/

function alignCues(a,b){
  let start = Math.min(a.startTime,b.startTime)
  let end = Math.max(a.endTime, b.endTime)
  let duration = end - start;
  a.startTime = start;
  b.startTime = start;
  a.endTime = end;
  b.endTime = end;
  a.duration = duration;
  b.duration = duration;
  a.matched = true;
  b.matched = true;
}


function isMatch(a,b){
  let startDiff = Math.abs(a.startTime - b.startTime);
  let endDiff = Math.abs(a.endTime - b.endTime);
  return (startDiff < thresh && endDiff < thresh);
}

function clearDom(){
  const left = document.getElementById("left");
  const right = document.getElementById("right");
  left.innerHTML = '';
  right.innerHTML = '';
}

function addPostRenderEvents() {
  document.getElementById("srtContainer").addEventListener("mousedown", onMouseDown);
}


