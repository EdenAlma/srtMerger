import { pixelMultiplier, cps, cpl } from "./model.js";

function renderSrt(cues, update=false) {

    for (let i = 0; i < cues.length; i++) {
        if(!update)
            renderCue(cues[i]);
        else{
            updateCueRender(cues[i]);
        }
    }

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

    if (cue.textLength > cpl.value) {
        div.classList.add('cpl-flag')
    } else {
        div.classList.remove('cpl-flag')
    }

    if (cue.side === 'left') {
        left.appendChild(div);
    } else {
        right.appendChild(div);
    }
}





function updateCueRender(cue) {
    cue.refreshStats();
    let div = document.getElementById(cue.id);
    if (!div) return;
    div.style.top = cue.startTime / pixelMultiplier + 'px';
    div.style.height = cue.duration / pixelMultiplier + 'px';
    let textElement = div.querySelector('.cue-text');
    textElement.innerHTML = cue.text;
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

    if (cue.textLength > cpl.value) {
        div.classList.add('cpl-flag')
    } else {
        div.classList.remove('cpl-flag')
    }

    div.classList.remove('selected');
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




export {
    renderSrt, updateCueRender, renderCue, deleteCueRender, updateProgressRender
    , unselectAllRender
};