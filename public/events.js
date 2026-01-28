import { clickCue, shiftCue } from "./model.js"

let mouseUpHandler;
let mouseMoveHandler;

function onMouseDown(event) {
  // Check if the clicked element (event.target) has the class 'box'
  const clickedElement = event.target;
  const clickedCue = event.target.closest('.cue');
  const clickYPosition = event.clientY

  if (clickedCue) {
    mouseUpHandler = (event) => onMouseUp(event, clickedElement, clickYPosition)
    mouseMoveHandler = (event) => onMouseMove(event, clickedElement)
  }else{
    return
  }
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler)
}

function onMouseUp(event, initialClickedElm, initialClickedPos) {
  let unclickedElement = event.target.closest('.cue');
  if (!unclickedElement) unclickedElement = initialClickedElm

  if (event.clientY === initialClickedPos) { 
    clickCue(event)
    window.removeEventListener('mousemove', mouseMoveHandler)
    window.removeEventListener('mouseup', mouseUpHandler)
    return;
  }

  window.removeEventListener('mousemove', mouseMoveHandler)
  window.removeEventListener('mouseup', mouseUpHandler)
  //alignAllCues(srtData);
}

function onMouseMove(event, initialClicked) {
  const clickedCue = initialClicked.closest('.cue');
  if (initialClicked.classList.contains('resize-handle')) {
    resizeCue(event) //convert from dom manip to data manip
  } else {
    shiftCue(event)
  }
}

function handleSingleClick(element, selectedElements) {
  const findElementIndex = selectedElements.findIndex(e => element.id === e.id)
  if(findElementIndex >= 0){
    selectedElements.splice(findElementIndex)
    element.classList.remove('selected')
  }else{
    selectedElements.push(element)
    element.classList.add('selected')
  }

}


function updateCuePosition(evt, elm, dOff) {

  //const y = evt.clientY + dOff;
  //elm.style.top = `${y}px`;
  //const cueToUpdate = srtData.find(element => element.id === elm.id)
  //cueToUpdate.startTime = y * 60;
  //cueToUpdate.endTime = cueToUpdate.startTime + cueToUpdate.duration;

}

function updateCueSize(evt, elm) {
  const clickedElement = elm.closest('.cue')
  
}

function addEvents() {
  window.addEventListener('mousedown', onMouseDown)
}
export {addEvents};