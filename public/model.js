import { updateCueRender, renderCue, deleteCueRender, updateProgressRender, unselectAllRender } from "./render.js";
let thresh = { "value": 400 };
let cps = { "value": 14 };
let cpl = { "value": 40 };
const srtData = [];
const selectedElements = []
const editedElements = []
const pixelMultiplier = 40;
const tagPattern = new RegExp("<(?!(\\/?br\\b))[^>]*>", "g");
const brPatternTrail = new RegExp("^(<br\\s*\\/?>)+|(<br\\s*\\/?>$)+", "g");
const brPattern = new RegExp("(<br\\s*\\/?>)+|(<br\\s*\\/?>)+", "g");
const nbspPattern = new RegExp("&nbsp;", "gi");
export { thresh, srtData, selectedElements, cps, cpl, pixelMultiplier };



function scaleCues(side, factor) {
    let cuesToScale = srtData.filter(e => e.side === side);
    if (factor > 1) {
        let i = cuesToScale.length - 1;
        for (; i >= 0; i--) {
            cuesToScale[i].scaleCue(factor);
        }
    } else {
        for (let i = 0; i < cuesToScale.length; i++) {
            cuesToScale[i].scaleCue(factor);
        }
    }


}


function shiftCues(side, shift) {
    let cuesToShift = srtData.filter(e => e.side === side);

    if (shift > 0) {
        let i = cuesToShift.length - 1;
        for (; i >= 0; i--) {
            cuesToShift[i].shiftCue(shift, false);
        }
    } else {
        for (let i = 0; i < cuesToShift.length; i++) {
            cuesToShift[i].shiftCue(shift, false);
        }
    }

}

/**
 * model method
 */
function commitTextEdits() {
    let i = editedElements.length - 1
    for (; i >= 0; i--) {
        let editedCue = editedElements[i];
        let textSpan = document.getElementById(editedCue.id).querySelector('.cue-text');
        let updatedText = textSpan.innerHTML.replaceAll(brPatternTrail, '');
        updatedText = updatedText.replaceAll(nbspPattern, ' ');
        editedCue.text = updatedText.trim();
        deleteCueRender(editedCue.id)
        renderCue(editedCue);
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
    newCue.textLength = newCue.text.length;
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

function updateProgress() {
    let matched = srtData.filter(e => e.matched === true)
    let percentMatched = (matched.length / srtData.length).toFixed(8);
    updateProgressRender(percentMatched);
}

function deleteCues() {
    let i = selectedElements.length - 1
    for (; i >= 0; i--) {
        selectedElements[i].deleteCue();
        selectedElements.splice(i, 1);
    }
}

function msToSrtTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;

    const pad = (num, size) => String(num).padStart(size, '0');

    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(Math.round(milliseconds), 3)}`;
}


/**
 * Class representing SRT cue
 */
class Cue {

    constructor(start, end, text, side, id) {
        this.side = side
        if (side === 'merged') {
            this.text = text;
        } else {
            this.text = text.replaceAll(tagPattern, '');
        }
        this.textLength = this.text.length;
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

    shiftCue(shiftAmount, render = true) {

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
        if (render) {
            this.alignCue();
            updateCueRender(this)
        }
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

        let min = Infinity;
        let prev;
        if (same) {
            for (let i = 0; i < srtData.length; i++) {
                let test = this.startTime - srtData[i].startTime;
                if (test <= 0 || srtData[i].side != this.side || test > min) continue;
                else if (test < min) {
                    min = test;
                    prev = srtData[i];
                }
            }
        } else {
            for (let i = 0; i < srtData.length; i++) {
                let test = this.startTime - srtData[i].startTime;
                if (test <= 0 || srtData[i].side === this.side || test > min) continue;
                else if (test < min) {
                    min = test;
                    prev = srtData[i];
                }
            }
        }

        return prev
    }

    getNext(same) {
        let min = Infinity;
        let next;
        if (same) {
            for (let i = 0; i < srtData.length; i++) {
                let test = srtData[i].startTime - this.startTime;
                if (test <= 0 || srtData[i].side != this.side || test > min) continue;
                else if (test < min) {
                    min = test;
                    next = srtData[i];
                }
            }
        } else {
            for (let i = 0; i < srtData.length; i++) {
                let test = srtData[i].startTime - this.startTime;
                if (test <= 0 || srtData[i].side === this.side || test > min) continue;
                else if (test < min) {
                    min = test;
                    next = srtData[i];
                }
            }
        }

        return next
    }

    alignCue() {

        let neighbor = this.getNeighbor();
        if (!neighbor) {
            let overlaps = this.getOverlap();
            if (overlaps.length > 0) {
                this.matched = false;
                for (let i = 0; i < overlaps.length; i++) {
                    overlaps[i].matched = false;
                    updateCueRender(overlaps[i]);
                }
            } else {
                this.matched = true;
            }
            updateCueRender(this);

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
            updateProgress();
        }

    }

    updateCue(start, end, text, side) {
        this.side = side
        this.text = text.replaceAll(tagPattern, '');
        this.textLength = this.text.length;
        this.startTime = start;
        this.endTime = end;
        this.duration = end - start;
        this.cps = this.textLength / (this.duration * 1000) //ms to second
        this.matched = false;
    }

    refreshStats() {
        this.textLength = this.text.length;
        this.cps = this.textLength / (this.duration / 1000)
    }

    add() {
        let index = srtData.findIndex(e => e.id === this.id)

        if (index > -1) srtData[index] = this; //if it exists already, replace it
        else srtData.push(this)
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
        if (!otherCue) return false;
        let startGap = Math.abs(otherCue.startTime - this.startTime)
        let endGap = Math.abs(otherCue.endTime - this.endTime)
        if (startGap < thresh.value && endGap < thresh.value) {
            return true;
        } else {
            return false;
        }
    }

    deleteCue() {
        deleteCueRender(this.id);
        srtData.splice(srtData.findIndex(e => e.id === this.id), 1)
        updateProgress();
    }

    toString() {
        let output = '';
        output += (msToSrtTime(this.startTime) + ' --> ' + msToSrtTime(this.endTime));
        output += '\r\n';
        output += this.text.replaceAll(brPattern, '\r\n');
        return output;
    }

    scaleCue(factor) {
        this.startTime = this.startTime * factor;
        this.endTime = this.endTime * factor;
        this.refreshStats();
    }

}


export {
    isSelected, selectCue, unSelectCue, editCueText, commitTextEdits,
    mergeCues, splitCues, alignCues, Cue, getCue, unselectAll, updateProgress,
    deleteCues, scaleCues, shiftCues
}