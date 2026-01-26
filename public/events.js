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
    return;
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

function addEvents() {
  window.addEventListener('mousedown', onMouseDown)
}
export {addEvents};