import { srtCombine } from "./srtCombine.js"

const mergeBtn = document.getElementById('mergeBtn');
var srtData = [];

mergeBtn.addEventListener('click', async () => {
  const srt1File = document.getElementById("srt1").files[0];
  const srt2File = document.getElementById("srt2").files[0];
  srtData = await srtCombine.getCombinedSrt(srt1File, srt2File);
  renderSrt(srtData);
  document.getElementById("srtContainer").addEventListener("click", function(event) {
    // Check if the clicked element (event.target) has the class 'box'
    if (event.target) {
        alert("You clicked on " + event.target.id);
    }
});
})


function renderSrt(cues) {
  const left = document.getElementById("left");
  const right = document.getElementById("right");

  const relativeStart = cues[0].startTime;
  const realtiveStartLang = cues[0].lang;
  let realtiveStart2;
  let index = 0
  while (true) {
    let element = cues[index]
    if (element.lang != realtiveStartLang) {
      realtiveStart2 = element.startTime;
      break;
    }else{
      index++;
    }
  }



  for (const cue of cues) {
    const div = document.createElement("div");
    div.className = "cue";
    div.id = `${cue.seq}-${cue.lang}`
    div.style.top = (cue.startTime - relativeStart) / 100 + 'px';
    div.style.height = cue.duration / 100 + 'px';
    div.draggable = true;
    div.contentEditable = true;
    div.innerHTML = `
      <span class="id">${cue.rawText}</span>
    `;

    if (cue.lang === 'en') {
      left.appendChild(div);
    } else {
      right.appendChild(div);
    }

  }

}