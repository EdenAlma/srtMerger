import { srtCombine } from "./srtCombine.js"

const mergeBtn = document.getElementById('mergeBtn');
window.srtData = [];
var selectedElements = [];

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
    div.style.top = (cue.startTime) / 60 + 'px';
    div.style.height = cue.duration / 60 + 'px';
    //div.draggable = true;
    //div.contentEditable = true;
    div.innerHTML = `
      <span class="cue-text">${cue.rawText}</span>
      <div class="resize-handle"></div>
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

  /*document.getElementById("srtContainer").addEventListener("mousedown", function (event) {
    
    
    //updateCuePosition(event)
  });*/


  document.getElementById("srtContainer").addEventListener("mousedown", onMouseDown);


}


function updateCuePosition(evt, elm, dOff) {

  const y = evt.clientY + dOff;
  elm.style.top = `${y}px`;
  const cueToUpdate = srtData.find(element => element.seq + '-' + element.lang === elm.id)
  cueToUpdate.startTime = y * 60;
  cueToUpdate.endTime = cueToUpdate.startTime + cueToUpdate.duration;

}

function updateCueSize(evt,elm){
  const clickedElement = elm.closest('.cue')
  const container = clickedElement.offsetParent; // nearest positioned ancestor
  const rect = container.getBoundingClientRect();
  const y = evt.clientY
  clickedElement.style.height = (y - (parseInt(clickedElement.style.top) + rect.top)) + 'px'
  console.log(clickedElement.style.height)
  const cueToUpdate = srtData.find(element => element.seq + '-' + element.lang === clickedElement.id)
  cueToUpdate.endTime = y * 60;
  cueToUpdate.duration = cueToUpdate.endTime - cueToUpdate.startTime;
}

let mouseUpHandler;
let mouseMoveHandler;

function onMouseDown(event) {
  // Check if the clicked element (event.target) has the class 'box'
  console.log('down')
  const clickedElement = event.target;
  const clickedCue = event.target.closest('.cue');
  const clickYPosition = event.clientY

  if (!clickedElement) return
  let divOffset = parseInt(clickedCue.style.top) - clickYPosition;
  selectedElements.push(clickedCue); //add to some sort of array incase its not a drag or resize (select)
  mouseUpHandler = (event) => onMouseUp(event, clickedElement, clickYPosition)
  mouseMoveHandler = (event) => onMouseMove(event, clickedElement, divOffset)
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler)
}

function onMouseUp(event, initialClickedElm, initialClickedPos) {
  console.log('up')
  let unclickedElement = event.target.closest('.cue');
  if (!unclickedElement) unclickedElement = initialClickedElm
  if (event.clientY === initialClickedPos) { console.log('real click') }

  window.removeEventListener('mousemove', mouseMoveHandler)
  window.removeEventListener('mouseup', mouseUpHandler)
}

function onMouseMove(event, initialClicked, divOffset) {
  const clickedCue = initialClicked.closest('.cue');
  if(initialClicked.className == 'resize-handle'){
    console.log('size update')
    updateCueSize(event, initialClicked)
  }else{
    updateCuePosition(event, clickedCue, divOffset)
  }
}