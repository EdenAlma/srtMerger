import { srtCombine } from "./srtCombine.js"

const mergeBtn = document.getElementById('mergeBtn');
window.srtData = [];

mergeBtn.addEventListener('click', async () => {
  const srt1File = document.getElementById("srt1").files[0];
  const srt2File = document.getElementById("srt2").files[0];
  const thresh = document.getElementById('threshold').value;
  srtData = await srtCombine.getCombinedSrt(srt1File, srt2File);
  //const root = document.documentElement;
  //root.style.setProperty('--extend', thresh + 'px');
  renderSrt(srtData, thresh);
  

})


function renderSrt(cues) {
  const left = document.getElementById("left");
  const right = document.getElementById("right");

  for (const cue of cues) {
    const div = document.createElement("div");
    div.className = "cue";
    div.id = `${cue.seq}-${cue.lang}`
    div.style.top = (cue.startTime) / 100 + 'px';
    div.style.height = cue.duration / 100 + 'px';
    div.draggable = true;
    //div.contentEditable = true;
    div.innerHTML = `
      <span class="id">${cue.rawText}</span>
    `;

    if (cue.lang === 'en') {
      //div.classList.add('left-cue');
      left.appendChild(div);
    } else {
      //div.classList.add('right-cue');
      right.appendChild(div);
    }

  }

  addPostRenderEvents();
}

function addPostRenderEvents() {
  /*document.getElementById("srtContainer").addEventListener("click", function (event) {
    // Check if the clicked element (event.target) has the class 'box'
    if (event.target) {
      alert("You clicked on " + event.target.id);
    }
  });*/

    document.getElementById("srtContainer").addEventListener("dragend", function (event) {
    // Check if the clicked element (event.target) has the class 'box'
    updateCuePosition(event)
  });

  const cues = document.querySelectorAll('.cue');
  cues.forEach(cue => observer.observe(cue));

}


function updateCuePosition(e) {
  const cue = e.target;
  const container = cue.offsetParent; // nearest positioned ancestor
  const rect = container.getBoundingClientRect();
  const y = e.clientY - rect.top;
  cue.style.top = `${y}px`;
  const cueToUpdate = srtData.find(element => element.seq + '-' + element.lang === e.target.id)
  cueToUpdate.startTime = y*100;
  cueToUpdate.endTime = cueToUpdate.startTime + cueToUpdate.duration;

}


// Create a single ResizeObserver instance
const observer = new ResizeObserver(entries => {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`Resized ${entry.target.id}: ${width}px × ${height}px`);
  }
});

