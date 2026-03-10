import { srtCombine } from "./srtCombine.js"
import { addEvents } from "./events.js"
import { renderSrt } from "./render.js";
import { srtData, thresh, cps} from "./model.js";

const mergeBtn = document.getElementById('mergeBtn');
let cpl;


mergeBtn.addEventListener('click', async () => {
  const srt1File = document.getElementById("srt1").files[0];
  const srt2File = document.getElementById("srt2").files[0];
  let temp = await srtCombine.getCombinedSrt(srt1File, srt2File);
  thresh.value = document.getElementById("threshold").value;
  srtData.push(...temp)
  cps.value = document.getElementById("cps").value;
  cpl = document.getElementById("cpl").value;
  //const root = document.documentElement;
  //root.style.setProperty('--extend', thresh + 'px');
  renderSrt(srtData);
  addEvents();
  let x = 0;
  //split all the cue ---> add something to not split if theres no corresponding one 
  while (x < srtData.length) {


    if (srtData[x].hasNeighbor()) {
      srtData[x].split();
    }
    x++;
  }

  mergeBtn.parentNode.removeChild(mergeBtn);
})




