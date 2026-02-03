import { updateCueRender } from "./render.js";
let thresh = 0
const srtData = [];
const selectedElements = []
const editedElements = []
const pixelMultiplier = 60;

export { thresh, srtData, selectedElements }

function shiftCue(clickedElement, shiftAmount) {
    const clickedCue = clickedElement.closest('.cue')
    if (!clickedCue) return
    const clickedCueId = clickedCue.id
    const cueToUpdate = srtData.find(element => element.id === clickedCueId)
    cueToUpdate.startTime += shiftAmount * pixelMultiplier;
    cueToUpdate.endTime += shiftAmount * pixelMultiplier;
    console.log(cueToUpdate);
    updateCueRender(cueToUpdate)
}

function resizeCue(clickedElement, shiftAmount) {
    const clickedCue = clickedElement.closest('.cue')
    if (!clickedCue) return
    const clickedCueId = clickedCue.id
    const cueToUpdate = srtData.find(element => element.id === clickedCueId)
    if (clickedElement.classList.contains('bottom-handle')) {
        cueToUpdate.endTime += shiftAmount * pixelMultiplier;
        cueToUpdate.duration += shiftAmount * pixelMultiplier;
    } else {
        cueToUpdate.startTime += shiftAmount * pixelMultiplier;
        cueToUpdate.duration -= shiftAmount * pixelMultiplier;
    }
    console.log(cueToUpdate)
    updateCueRender(cueToUpdate)
}

function commitTextEdits() {
    for(let i = 0; i<editedElements.length; i++){
        let editedCue = editedElements[i];
        let textSpan = document.getElementById(editedCue.id).querySelector('.cue-text');
        let updatedText = textSpan.textContent;
        editedCue.rawText = updatedText;
        updateCueRender(editedCue);
    }
}

function isSelected(id) {
    const element = selectedElements.find(e => e.id === id)
    return element ? true : false;
}


function selectCue(id) {
    const element = srtData.find(e => e.id === id)
    selectedElements.push(element)
}

function unSelectCue(id) {
    const index = selectedElements.findIndex(e => e.id === id)
    selectedElements.splice(index)
}

function editCue(id) {
    const element = srtData.find(e => e.id === id)
    editedElements.push(element)
}

export {shiftCue, resizeCue, isSelected, selectCue, unSelectCue, editCue, commitTextEdits}