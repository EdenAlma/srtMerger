import { pixelMultiplier, cps, srtData } from "./model.js";

function renderSrt(cues) {

    for (let i = 0; i < cues.length; i++) {
        renderCue(cues[i]);
    }

    //addPostRenderEvents();
}


function renderCue(cue) {

    const left = document.getElementById("left");
    const right = document.getElementById("right");

    const div = document.createElement("div");
    div.className = "cue";
    div.id = `${cue.id}`
    div.style.top = cue.startTime / pixelMultiplier + 'px';
    div.style.height = cue.duration / pixelMultiplier + 'px';
    div.innerHTML = `
      <div class="resize-handle top-handle"></div>
      <span class="cue-text">${cue.text}</span>
      <div class="resize-handle bottom-handle"></div>
      <div class="action-button hidden"></div>
    `;

    if (cue.matched) {
        div.classList.add('matched')
    } else {
        div.classList.remove('matched')
    }

    if (cue.cps > cps.value) {
        div.classList.add('cps-flag')
    } else {
        div.classList.remove('cps-flag')
    }

    if (cue.side === 'left') {
        left.appendChild(div);
    } else {
        right.appendChild(div);
    }
}



function updateCueRender(cue) {
    cue.refreshStats();
    const div = document.getElementById(cue.id)
    div.parentNode.removeChild(div);
    renderCue(cue);
}


function deleteCueRender(id) {
    const div = document.getElementById(id)
    div.parentNode.removeChild(div);
}

function updateProgressRender(pct) {
    let progBar = document.getElementById("progress-bar");
    let width = 80 * pct;
    progBar.style.width = width + "%";
    progBar.innerHTML = (pct * 100).toFixed(2) + "%";
}

function unselectAllRender() {
    let selectedElements = document.getElementsByClassName('selected');
    while (selectedElements.length > 0)
        selectedElements[0].classList.remove('selected');
}




export { renderSrt, updateCueRender, renderCue, deleteCueRender, updateProgressRender
, unselectAllRender };