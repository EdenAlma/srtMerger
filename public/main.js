import { srtCombine } from "./srtCombine.js"
import { addEvents } from "./events.js"
import { renderSrt } from "./render.js";
import { srtData, thresh, splitCue } from "./model.js";

const mergeBtn = document.getElementById('mergeBtn');
let cps;
let cpl;


mergeBtn.addEventListener('click', async () => {
  const srt1File = document.getElementById("srt1").files[0];
  const srt2File = document.getElementById("srt2").files[0];
  let temp = await srtCombine.getCombinedSrt(srt1File, srt2File);
  thresh.value = document.getElementById("threshold").value;
  srtData.push(...temp)
  cps = document.getElementById("cps").value;
  cpl = document.getElementById("cpl").value;
  //const root = document.documentElement;
  //root.style.setProperty('--extend', thresh + 'px');
  renderSrt(srtData);
  addEvents();
  let x = 0;
  //split all the cue ---> add something to not split if theres no corresponding one 
  while (x < srtData.length) {

    let check = srtData.find(c => {
      return c.side != srtData[x].side
        && (c.startTime > srtData[x].startTime && c.startTime < srtData[x].endTime
          || srtData[x].startTime > c.startTime && srtData[x].startTime < c.endTime)
    })
    if (check) {
      splitCue(srtData[x])
    }
    x++;
  }
})




