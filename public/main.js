import { srtCombine } from "./srtCombine.js"

const mergeBtn = document.getElementById('mergeBtn');
const alignBtn = document.getElementById('alignBtn');
window.srtData = [];
window.thresh = 0;
var selectedElements = [];

mergeBtn.addEventListener('click', async () => {
  const srt1File = document.getElementById("srt1").files[0];
  const srt2File = document.getElementById("srt2").files[0];
  
  srtData = await srtCombine.getCombinedSrt(srt1File, srt2File);
  //const root = document.documentElement;
  //root.style.setProperty('--extend', thresh + 'px');
  renderSrtInit(srtData);

})

alignBtn.addEventListener('click', () => {
  thresh = parseInt(document.getElementById('threshold').value);
  alignAllCues(srtData)
})


function renderSrtInit(cues) {
  const left = document.getElementById("left");
  const right = document.getElementById("right");

  for (const cue of cues) {
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

    if(cue.matched){
      div.classList.add('matched')
    }else{
      div.classList.remove('matched')
    }
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
}

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


function updateCuePosition(evt, elm, dOff) {

  const y = evt.clientY + dOff;
  elm.style.top = `${y}px`;
  const cueToUpdate = srtData.find(element => element.id === elm.id)
  cueToUpdate.startTime = y * 60;
  cueToUpdate.endTime = cueToUpdate.startTime + cueToUpdate.duration;

}

function updateCueSize(evt, elm) {
  const clickedElement = elm.closest('.cue')
  const container = clickedElement.offsetParent; // nearest positioned ancestor
  const rect = container.getBoundingClientRect();
  const y = evt.clientY
  clickedElement.style.height = (y - (parseInt(clickedElement.style.top) + rect.top)) + 'px'
  const cueToUpdate = srtData.find(element => element.id === clickedElement.id)
  cueToUpdate.endTime = (y-rect.top) * 60 ;
  cueToUpdate.duration = cueToUpdate.endTime - cueToUpdate.startTime;
}

let mouseUpHandler;
let mouseMoveHandler;

function onMouseDown(event) {
  // Check if the clicked element (event.target) has the class 'box'
  const clickedElement = event.target;
  const clickedCue = event.target.closest('.cue');
  const clickYPosition = event.clientY

  if (clickedElement) {
    let divOffset = parseInt(clickedCue.style.top) - clickYPosition;
    mouseUpHandler = (event) => onMouseUp(event, clickedElement, clickYPosition)
    mouseMoveHandler = (event) => onMouseMove(event, clickedElement, divOffset)
  }
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler)
}

function onMouseUp(event, initialClickedElm, initialClickedPos) {
  let unclickedElement = event.target.closest('.cue');
  if (!unclickedElement) unclickedElement = initialClickedElm
  if (event.clientY === initialClickedPos) { 
    handleSingleClick(unclickedElement) 
    window.removeEventListener('mousemove', mouseMoveHandler)
    window.removeEventListener('mouseup', mouseUpHandler)
    return
  }

  window.removeEventListener('mousemove', mouseMoveHandler)
  window.removeEventListener('mouseup', mouseUpHandler)
  alignAllCues(srtData);
}

function onMouseMove(event, initialClicked, divOffset) {
  const clickedCue = initialClicked.closest('.cue');
  if (initialClicked.className == 'resize-handle') {
    updateCueSize(event, initialClicked)
  } else {
    updateCuePosition(event, clickedCue, divOffset)
  }
}

function handleSingleClick(element) {
  const findElementIndex = selectedElements.findIndex(e => element.id === e.id)
  if(findElementIndex >= 0){
    selectedElements.splice(findElementIndex)
    element.classList.remove('selected')
  }else{
    selectedElements.push(element)
    element.classList.add('selected')
  }

}