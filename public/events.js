import {
  isSelected, unSelectCue, selectCue, commitTextEdits, editCueText,
  mergeCues, splitCues, getCue, unselectAll,
  deleteCues,
  srtData,
  isLegalMultiShift,
  selectedElements,
  thresh,
  pixelMultiplier
} from "./model.js"

let mouseUpHandler;
let mouseMoveHandler;

//key down events
function onKeyDown(event) {
  if (event.key === 's') {
    splitCues();
  } else if (event.key === 'm') {
    mergeCues();
  } else if (event.key === 'Delete') {
    deleteCues();
  } else if (event.key === 'ArrowRight') {
    seekUnmatched();
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {

    if (multiShift(event.key)) {
      event.preventDefault();
    }
  } else if (event.key === 'Control') {

    removeEvents();
    window.addEventListener('mousedown', onMouseDownCtrl)
    window.addEventListener('keyup', onKeyUp)
  } else {
    return;
  }
}


function onKeyUp(event){
  if (event.key === 'Control') {
    window.removeEventListener('mousedown', onMouseDownCtrl)
    window.removeEventListener('keyup', onKeyUp)
    addEvents();
  }
  else return
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
    commitTextEdits(); //commit text edits (if any)
    unselectAll(); //unselect cues
    window.addEventListener('keydown', onKeyDown) //will this add multiple event listeners? -> no
    return;
  }

  window.addEventListener('mousemove', mouseMoveHandler) //add event listeners to the window
  window.addEventListener('mouseup', mouseUpHandler)    // it is ok to call this in dunplicate...kinda?
}

//multi select
function onMouseDownCtrl(event) {

  const clickedCue = event.target.closest('.cue'); //cue element that was click

  if (clickedCue) { //must be element within a cue
    if (selectedElements.length != 1) return
    let lastSelect = getCue(clickedCue.id);
    let firstSelect = selectedElements[0];
    if (lastSelect.side != firstSelect.side) return

    if (lastSelect.startTime > firstSelect.startTime) {
      let begin = firstSelect;
      while (begin != lastSelect) {
        begin = begin.getNext(true);
        selectCue(begin.id);
        document.getElementById(begin.id).classList.add('selected');
      }
    } else {
     let begin = firstSelect;
      while (begin != lastSelect) {
        begin = begin.getPrev(true);
        selectCue(begin.id);
        document.getElementById(begin.id).classList.add('selected');
      }
    }
  } else {
    return;
  }
}


//commits changes done by dragging or resizing
//single click -> select
function onMouseUp(event, initialClicked, initialYPosition) {
  let clickedCueElement = initialClicked.closest('.cue');

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
    } else {
      cueToUpdate.resizeBottom(shiftAmount);
    }
  } else {
    cueToUpdate.shiftCue(shiftAmount);
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

  setTimeout(() => { //300 ms doubleclick window
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

function removeEvents() {
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('keydown', onKeyDown);
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

let blockerFunction = (e) => { e.stopPropagation() }
function handleDoubleClick(event, clickedCue) {
  window.removeEventListener('keydown', onKeyDown);
  editCueText(clickedCue.id);
  const textE = clickedCue.querySelector('.cue-text');
  clickedCue.classList.add('edited')
  textE.classList.add('editing');
  textE.contentEditable = true;
  clickedCue.removeEventListener('mousedown', dblClick);
  clickedCue.addEventListener('mousedown', blockerFunction)
}

function seekUnmatched() {
  let unmatched = srtData.filter(e => e.matched === false);
  if (unmatched.length === 0) return
  let scrollTo = unmatched[0].id;
  document.getElementById(scrollTo).scrollIntoView({
    behavior: "smooth",
    block: "center", inline: "center"
  });
}

let shiftCount = 0;
function multiShift(key) {
  let direction = key === 'ArrowDown' ? 1 : -1
  if (!isLegalMultiShift()) return false;
  for (let i = 0; i < selectedElements.length; i++) {
    selectedElements[i].shiftCue(direction * (thresh.value + 1) / pixelMultiplier, true, false);
  }
  return true;
}