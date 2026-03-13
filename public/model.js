import { updateCueRender, renderCue, deleteCueRender, updateProgress, unselectAllRender } from "./render.js";
let thresh = { "value": 0 };
let cps = { "value": 0 };
const srtData = [];
const selectedElements = []
const editedElements = []
const pixelMultiplier = 40;
const tagPattern = new RegExp("<[a-z]+>|</[a-z]+>", "g");
export { thresh, srtData, selectedElements, cps };


/**
 * model method
 */
function commitTextEdits() {
    let i = editedElements.length - 1
    for (; i >= 0; i--) {
        let editedCue = editedElements[i];
        let textSpan = document.getElementById(editedCue.id).querySelector('.cue-text');
        let updatedText = textSpan.innerHTML;
        editedCue.text = updatedText;
        updateCueRender(editedCue);
        editedElements.splice(i, 1);
    }
}

/**
 * model method
 * @param {string} id 
 * @returns 
 */
function isSelected(id) {
    const element = selectedElements.find(e => e.id === id)
    return element ? true : false;
}

/**
 * model method
 * @param {*} id 
 */
function selectCue(id) {
    const element = srtData.find(e => e.id === id)
    selectedElements.push(element)
}

/**
 * model method
 * @param {string} id 
 */
function unSelectCue(id) {
    const index = selectedElements.findIndex(e => e.id === id)
    selectedElements.splice(index, 1)
}

/**
 * model method
 * @param {string} id 
 */
function editCueText(id) {
    const element = srtData.find(e => e.id === id)
    editedElements.push(element)
}



/**
 * model method
 */
function splitCues() {
    let i = selectedElements.length - 1
    for (; i >= 0; i--) {
        selectedElements[i].split();
        selectedElements.splice(i, 1);
    }
}

/**
 * model method
 * @returns nothing
 */
function mergeCues() {
    if (selectedElements.length != 2) return;
    selectedElements.sort((a, b) => { return a.startTime - b.startTime })
    let firstElement = selectedElements[0];
    let next = firstElement.getNext(true);
    if (next != selectedElements[1]) return;
    let newCue = selectedElements[0];
    let newText = selectedElements[0].text + ' ' + selectedElements[1].text;
    newCue.text = newText;
    newCue.endTime = selectedElements[1].endTime;
    newCue.duration = newCue.endTime - newCue.startTime;
    deleteCueRender(selectedElements[1].id);
    srtData.splice(srtData.findIndex(e => e.id === selectedElements[1].id), 1)
    selectedElements.splice(0);
    newCue.alignCue();
    updateCueRender(newCue);
}


/**
 * model method
 */
function alignCues() {
    let cueCount = srtData.length;
    for (let i = 0; i < cueCount; i++) {
        srtData[i].alignCue();
    }
}

function getCue(id) {
    return srtData.find(e => e.id === id)
}

function unselectAll() {
    selectedElements.splice(0);
    unselectAllRender();
}


/**
 * Class representing SRT cue
 */
class Cue {

    constructor(start, end, text, side, id) {
        this.side = side
        this.text = text;
        this.textLength = this.text.replaceAll(tagPattern, '').length;
        this.startTime = start;
        this.endTime = end;
        this.duration = end - start;
        this.cps = this.textLength / (this.duration / 1000)
        this.matched = false;
        if (id) {
            this.id = id;
        } else {
            this.id = crypto.randomUUID();
        }
    }

    resizeTop(shiftAmount) {
        let { min, max } = this.getLimits();
        let shift = shiftAmount * pixelMultiplier;
        let newDuration, newStart;
        newStart = Math.max((this.startTime + shift), min);
        newDuration = this.endTime - newStart;
        if (newDuration > 100) {
            this.duration = newDuration;
            this.startTime = newStart;
        }
        this.alignCue();
        updateCueRender(this)
    }

    resizeBottom(shiftAmount) {
        let { min, max } = this.getLimits();
        let shift = shiftAmount * pixelMultiplier;
        let newEnd, newDuration;
        newEnd = Math.min((this.endTime + shift), max);
        newDuration = newEnd - this.startTime;
        if (newDuration > 100) {
            this.duration = newDuration;
            this.endTime = newEnd;
        }
        this.alignCue();
        updateCueRender(this)
    }

    shiftCue(shiftAmount) {

        let { min, max } = this.getLimits();

        let shiftStart = Math.min((this.startTime + (shiftAmount * pixelMultiplier)), max);
        let shiftEnd = this.endTime + (shiftAmount * pixelMultiplier);
        let newStart = Math.max(shiftStart, min)
        let newEnd = Math.min(shiftEnd, max);
        let newDuration = newEnd - newStart;
        if (newDuration > 100) {
            this.startTime = newStart;
            this.endTime = newEnd;
            this.duration = newDuration;
        }
        this.alignCue();
        updateCueRender(this)
    }

    getLimits() {
        let previousCue = this.getPrev(true);
        let nextCue = this.getNext(true);
        let min;
        let max;

        if (!previousCue) {
            min = 0
        } else {
            min = previousCue.endTime + 1;
        }

        if (!nextCue) {
            max = Infinity;
        } else {
            max = nextCue.startTime - 1;
        }

        return { min, max }
    }

    getPrev(same) {
        let current = srtData.findIndex(e => e === this)
        let prev = current - 1;
        if (same) {
            while (srtData[prev] && srtData[prev].side != this.side) {
                prev--;
            }
        } else {
            while (srtData[prev] && srtData[prev].side === this.side) {
                prev--;
            }
        }


        return srtData[prev]
    }

    getNext(same) {
        let current = srtData.findIndex(e => e === this)
        let next = current + 1;
        if (same) {
            while (srtData[next] && srtData[next].side != this.side) {
                next++;
            }
        } else {
            while (srtData[next] && srtData[next].side === this.side) {
                next++;
            }
        }

        return srtData[next]
    }

    alignCue() {

        let neighbor = this.getNeighbor();
        if (!neighbor) {
            this.matched = false;
            updateCueRender(this);
            let overlaps = this.getOverlap();
            for(let i = 0; i < overlaps.length; i++){
                overlaps[i].matched = false;
                updateCueRender(overlaps[i]);
            }
        } else {
            let start = Math.min(this.startTime, neighbor.startTime)
            start = Math.max(start, neighbor.getLimits().min, this.getLimits().min)
            let end = Math.max(this.endTime, neighbor.endTime)
            end = Math.min(end, neighbor.getLimits().max, this.getLimits().max)
            this.updateCue(start, end, this.text, this.side)
            neighbor.updateCue(start, end, neighbor.text, neighbor.side)
            this.matched = true;
            neighbor.matched = true;
            updateCueRender(this);
            updateCueRender(neighbor);
            let matched = srtData.filter(e => e.matched === true)
            let percentMatched = (matched.length / srtData.length).toFixed(2);
            updateProgress(percentMatched);
        }

    }

    updateCue(start, end, text, side) {
        this.side = side
        this.text = text;
        this.textLength = this.text.replaceAll(tagPattern, '').length;
        this.startTime = start;
        this.endTime = end;
        this.duration = end - start;
        this.cps = this.textLength / (this.duration * 1000) //ms to second
        this.matched = false;
    }

    refreshStats() {
        this.textLength = this.text.replaceAll(tagPattern, '').length;
        this.cps = this.textLength / (this.duration / 1000)
    }

    add() {
        let index = srtData.findIndex(e => e.id === this.id)

        if (index > -1) srtData[index] = this; //if it exists already, replace it
        else srtData.push(this)

        srtData.sort((a, b) => { return a.startTime - b.startTime })
    }


    split() {
        let cues = this.text.split('<br>')
        if (cues.length != 2) return
        let r1 = cues[0].length / this.textLength;
        let d1 = r1 * this.duration;
        let cue1 = new Cue(this.startTime, this.startTime + d1, cues[0], this.side, this.id)
        let cue2 = new Cue(this.startTime + d1 + 1, this.endTime, cues[1], this.side)
        cue1.add();
        cue2.add();
        updateCueRender(cue1);
        renderCue(cue2);
        cue1.alignCue();
        cue2.alignCue();
    }

    getOverlap() {
        return srtData.filter(c => {
            return c.side != this.side
                && (c.startTime >= this.startTime && c.startTime <= this.endTime
                    || this.startTime >= c.startTime && this.startTime <= c.endTime)
        })
    }


    hasOverlap() {
        return this.getOverlap().length > 0 ? true : false;
    }

    getNeighbor() {
        let prev = this.getPrev(false);
        let next = this.getNext(false);
        if (!prev && !next) return null;
        if (this.alignWith(prev)) return prev;;
        if (this.alignWith(next)) return next;
    }

    hasNeighbor() {
        return this.getNeighbor() ? true : false;
    }

    alignWith(otherCue) {
        if(!otherCue) return false;
        let startGap = Math.abs(otherCue.startTime - this.startTime)
        let endGap = Math.abs(otherCue.endTime - this.endTime)
        if (startGap < thresh.value && endGap < thresh.value) {
            return true;
        } else {
            return false;
        }
    }
}


export { isSelected, selectCue, unSelectCue, editCueText, commitTextEdits, pixelMultiplier, mergeCues, splitCues, alignCues, Cue, getCue, unselectAll }