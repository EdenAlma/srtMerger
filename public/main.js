import { srtCombine } from "./srtCombine.js"
import { addEvents } from "./events.js"
import { renderSrt } from "./render.js";
import { srtData,selectedElements,thresh } from "./model.js";

const mergeBtn = document.getElementById('mergeBtn');
const alignBtn = document.getElementById('alignBtn');
let cps;
let cpl;


mergeBtn.addEventListener('click', async () => {
  const srt1File = document.getElementById("srt1").files[0];
  const srt2File = document.getElementById("srt2").files[0];
  let temp = await srtCombine.getCombinedSrt(srt1File, srt2File);
  srtData.push(...temp)
  cps = document.getElementById("cps").value;
  cpl = document.getElementById("cpl").value;
  //const root = document.documentElement;
  //root.style.setProperty('--extend', thresh + 'px');
  renderSrt(srtData);
  addEvents();
})



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

