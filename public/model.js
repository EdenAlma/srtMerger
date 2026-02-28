import { updateCueRender, renderCue } from "./render.js";
let thresh = {"value" : 0};
const srtData = [];
const selectedElements = []
const editedElements = []
const pixelMultiplier = 40;
const tagPattern = new RegExp("<[a-z]+>|</[a-z]+>", "g");

export { thresh, srtData, selectedElements }

function shiftCue(clickedElement, shiftAmount) {
    const clickedCue = clickedElement.closest('.cue')
    if (!clickedCue) return
    const clickedCueId = clickedCue.id
    const cueToUpdate = srtData.find(element => element.id === clickedCueId)
    cueToUpdate.startTime += shiftAmount * pixelMultiplier;
    cueToUpdate.endTime += shiftAmount * pixelMultiplier;
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
    updateCueRender(cueToUpdate)
}

function updateCue(cue,) {

}


function commitTextEdits() {
    for (let i = 0; i < editedElements.length; i++) {
        let editedCue = editedElements[i];
        let textSpan = document.getElementById(editedCue.id).querySelector('.cue-text');
        let updatedText = textSpan.innerHTML;
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

function editCueText(id) {
    const element = srtData.find(e => e.id === id)
    editedElements.push(element)
}

function createCue(id, start, end, text, side) {
    let item = {}
    item.side = side
    item.rawText = text;
    item.textLength = item.rawText.replaceAll(tagPattern, '').length;
    item.startTime = start;
    item.endTime = end;
    item.duration = item.endTime - item.startTime
    item.cps = item.textLength / (item.duration * 1000)
    item.matched = false;
    item.id = id;
    return item
}


function createNewCue(start, end, text, side) {
    let item = {}
    item.side = side
    item.rawText = text;
    item.textLength = item.rawText.replaceAll(tagPattern, '').length;
    item.startTime = start;
    item.endTime = end;
    item.duration = item.endTime - item.startTime
    item.cps = item.textLength / (item.duration * 1000)
    item.matched = false;
    item.id = crypto.randomUUID();
    return item
}


function validateMerge() {
}

function mergeCues() {
}

function splitCues() {
    let i = selectedElements.length - 1
    for (; i >= 0; i--) {
        splitCue(selectedElements[i]);
        selectedElements.splice(i, 1);
    }
}

function validateSplit() {
}

function splitCue(c) {
    let cues = c.rawText.split('<br>')
    if (cues.length != 2) return
    let r1 = cues[0].length / c.textLength;
    let d1 = r1 * c.duration;
    let cue1 = createCue(c.id, c.startTime, c.startTime + d1, cues[0], c.side)
    let cue2 = createNewCue(c.startTime + d1 + 1, c.endTime, cues[1], c.side)
    addCue(cue1)
    addCue(cue2)
    updateCueRender(cue1)
    renderCue(cue2)

}


function addCue(cue) {
    let index = srtData.findIndex(e => e.id === cue.id)
    if (index > -1) srtData.splice(index, 1)
    srtData.push(cue)
    srtData.sort((a, b) => { return a.startTime - b.startTime })
}


function alignCues() {
    let cueCount = srtData.length;
    for (let i = 0; i < cueCount; i++) {
        alignCue(srtData[i])
    }
}



function alignCue(cue) {

    let next = getNext(cue);
    if(!next) return;
    let startGap = Math.abs(next.startTime - cue.startTime)
    let endGap = Math.abs(next.endTime - cue.endTime)
    if (startGap < thresh.value && endGap < thresh.value) {
        let start = Math.min(cue.startTime, next.startTime)
        let end = Math.min(cue.endTime, next.endTime)
        cue = createCue(cue.id, start, end, cue.rawText, cue.side);
        next = createCue(next.id, start, end, next.rawText, next.side)
        cue.matched = true;
        next.matched = true;
        updateCueRender(cue);
        updateCueRender(next);
    }
}





function getNext(cue) {
    let current = srtData.findIndex(e => e === cue)
    let next = current + 1;
    while (srtData[next] && srtData[next].side === cue.side) {
        next++;
    }

    return srtData[next]
}

//not needed?
function getPrev(cue) {
    let current = srtData.findIndex(e => e === cue)
    let prev = current - 1;
    while (srtData[prev] && srtData[prev].side === cue.side) {
        prev--;
    }

    return srtData[prev]
}

export { shiftCue, resizeCue, isSelected, selectCue, unSelectCue, editCueText, createCue, createNewCue, commitTextEdits, pixelMultiplier, mergeCues, splitCues, alignCues, splitCue }