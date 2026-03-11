import { isSelected, unSelectCue, selectCue, commitTextEdits, editCueText, 
  mergeCues, splitCues, alignCues, getCue, unselectAll} from "./model.js"

let mouseUpHandler;
let mouseMoveHandler;


function onKeyDown(event) {
  if (event.key === 's') {
    splitCues();
  } else if (event.key === 'm') {
    mergeCues();
  } else if (event.key === 'a') {
    alignCues();
  } else {
    return;
  }
}
function onMouseDown(event) {

  // Check if the clicked element (event.target) has the class 'box'
  const clickedElement = event.target; //html element that was clicked
  const clickedCue = event.target.closest('.cue'); //cue element that was click
  const clickYPosition = event.clientY; //initial y position clicked


  if (clickedCue) { //must be element within a cue
    const cueTop = parseInt(clickedCue.style.top); //top position of the clicked cue
    const cueHeight = parseInt(clickedCue.style.height);
    mouseUpHandler = (event) => onMouseUp(event, clickedElement, clickYPosition)
    mouseMoveHandler = (event) => onMouseMove(event, clickedElement, clickYPosition, cueTop, cueHeight)
  } else {
    commitTextEdits();
    unselectAll();
    window.addEventListener('keydown', onKeyDown)
    return;
  }

  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler)
}

function onMouseUp(event, initialClicked, initialYPosition) {
  let clickedCueElement = event.target.closest('.cue');

  if (event.clientY === initialYPosition) {
    handleSingleClick(initialClicked)
    window.removeEventListener('mousemove', mouseMoveHandler)
    window.removeEventListener('mouseup', mouseUpHandler)
    return;
  }

  window.removeEventListener('mousemove', mouseMoveHandler)
  window.removeEventListener('mouseup', mouseUpHandler)
  const shiftAmount = event.clientY - initialYPosition;
  const cueToUpdate = getCue(clickedCueElement.id);
  if (initialClicked.classList.contains('resize-handle')) {
    if (initialClicked.classList.contains('top-handle')) {
      cueToUpdate.resizeTop(shiftAmount);
      cueToUpdate.alignCue();
    } else {
      cueToUpdate.resizeBottom(shiftAmount);
      cueToUpdate.alignCue();
    }
  } else {
    cueToUpdate.shiftCue(shiftAmount);
    cueToUpdate.alignCue();
  }
}


/* This function takes mouse move events and updates the html elements to reflect
the use actions, it does not perform any data updates as these will only be
done once the mouseup event fires*/
function onMouseMove(event, initialClicked, initialYPosition, startTop, startHeight) {
  const shiftAmount = event.clientY - initialYPosition;
  if (initialClicked.classList.contains('resize-handle')) {
    updateCueElementSize(initialClicked, startTop, startHeight, shiftAmount);
  } else {
    updateCueElementPosition(initialClicked, startTop, shiftAmount);
  }
}


let dblClick = null;
function handleSingleClick(initialClicked) {

  const clickedCue = initialClicked.closest('.cue');
  dblClick = (event) => handleDoubleClick(event, clickedCue)
  clickedCue.addEventListener('mousedown', dblClick);

  setTimeout(() => {
    clickedCue.removeEventListener('mousedown', dblClick);
  }, 300)


  const id = clickedCue.id;
  if (isSelected(id)) {
    unSelectCue(id);
    clickedCue.classList.remove('selected')
  } else {
    selectCue(id);
    clickedCue.classList.add('selected')
  }
}




function addEvents() {
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('keydown', onKeyDown);
}
export { addEvents };
/*
  mousedown
  → snapshot model values

mousemove
  → update DOM ONLY (transform / top)
  → no model writes
  → no rerender

mouseup
  → compute final value
  → update model ONCE
  → rerender from model

*/

function updateCueElementPosition(clickedElement, startTop, shift) {
  const cue = clickedElement.closest('.cue');
  const end = startTop + shift;
  cue.style.top = end + 'px';
}

function updateCueElementSize(clickedElement, startTop, startHeight, shift) {
  const cue = clickedElement.closest('.cue')
  if (clickedElement.classList.contains('bottom-handle')) {
    cue.style.height = startHeight + shift + 'px'
  } else {
    cue.style.height = startHeight - shift + 'px'
    cue.style.top = startTop + shift + 'px'
  }
}


function handleDoubleClick(event, clickedCue) {
  window.removeEventListener('keydown', onKeyDown);
  editCueText(clickedCue.id);
  const textE = clickedCue.querySelector('.cue-text');
  clickedCue.classList.add('edited')
  textE.classList.add('editing');
  textE.contentEditable = true;
  clickedCue.removeEventListener('mousedown', dblClick);
  clickedCue.addEventListener('mousedown', (e) => { e.stopPropagation() })
}