import { srtCombine } from "./srtCombine.js"

const mergeBtn = document.getElementById('mergeBtn');

mergeBtn.addEventListener('click', async () => {
    const srt1File = document.getElementById("srt1").files[0];
    const srt2File = document.getElementById("srt2").files[0];
    const j = await srtCombine.getCombinedSrt(srt1File,srt2File);
    renderSrt(j);
})


function renderSrt(cues) {
  const container = document.getElementById("srtContainer");
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  for (const cue of cues) {
    const div = document.createElement("div");
    div.className = "cue";
    div.innerHTML = `
      <span class="id">${cue.rawText}</span>
      <span class="time">${cue.startTime}</span>
      <pre class="text">${cue.lang}</pre>
    `;
    fragment.appendChild(div);
  }

  container.appendChild(fragment);
}
