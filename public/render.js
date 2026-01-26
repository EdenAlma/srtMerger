function renderSrt(cues) {
    
    for (const cue of cues) {
        renderCue(cue);
    }

    //addPostRenderEvents();
}


function renderCue(cue) {

    const left = document.getElementById("left");
    const right = document.getElementById("right");

    const div = document.createElement("div");
    div.className = "cue";
    div.id = `${cue.id}`
    div.style.top = (cue.startTime) / 60 + 'px';
    div.style.height = cue.duration / 60 + 'px';
    div.innerHTML = `
      <span class="cue-text">${cue.rawText}</span>
      <div class="resize-handle"></div>
      <div class="action-button hidden"></div>
    `;

    if (cue.matched) {
        div.classList.add('matched')
    } else {
        div.classList.remove('matched')
    }
    if (cue.side === 'left') {
        //div.classList.add('left-cue');
        left.appendChild(div);
    } else {
        //div.classList.add('right-cue');
        right.appendChild(div);
    }
}


export {renderSrt};