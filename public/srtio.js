import { addEvents } from "./events.js"
import { renderSrt } from "./render.js";
import { srtData, alignCues, Cue } from "./model.js";
const brPattern = new RegExp("(<br\\s*\\/?>)+|(<br\\s*\\/?>)+", "g");


//get file text from file element
async function getStrText(file) {
    const data = await file.text();
    return data.toString();
}

function parseSrtTime(time) {
    const [hms, ms] = time.split(",");
    const [hh, mm, ss] = hms.split(":").map((i) => Number(i));

    return (
        hh * 60 * 60 * 1000 +
        mm * 60 * 1000 +
        ss * 1000 +
        Number(ms)
    );
}


async function srtToCueJSON(path, side) {

    let fileString = await getStrText(path);
    fileString = fileString.trim().replaceAll('\r\n', '\n');
    const srtArray = fileString.split('\n\n')

    const mapped = srtArray.map((record) => {

        let block = record.split('\n')
        let i = 2
        let rawText = '';
        while (block[i]) {
            rawText += ((i > 2) ? '<br>' : '') + block[i]
            i++
        }

        let text = rawText;
        let start = parseSrtTime(block[1].split(' --> ')[0])
        let end = parseSrtTime(block[1].split(' --> ')[1])
        return new Cue(start, end, text, side);
    })

    return mapped;
}


async function jsonToCue(cueJson) {
    srtData.splice(0);
    for (let i = 0; i < cueJson.length; i++) {
        let { side, text, textLength, startTime, endTime, duration, cps, matched, id } = cueJson[i];
        let cue = new Cue(startTime, endTime, text, side, id);
        cue.matched = matched;
        cue.refreshStats();
        srtData.push(cue)
    }
}


function downloadFile(content, filename, type = "text/plain") {
    const blob = new Blob([content], { type });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    a.remove();
    URL.revokeObjectURL(url);
}


function createSrt() {
    let unmatched = srtData.filter(e => e.matched === false);
    if (unmatched.length > 0) return false;
    let combined = combineCues();
    combined = combined.sort((a, b) => { return a.startTime - b.startTime });
    return srtString(combined)
}

function srtString(merged){
    let outputString = '';
    let cueNum = 1;
    for (let i = 0; i < merged.length; i++){
        outputString += cueNum;
        outputString += '\r\n';
        outputString += merged[i].toString();
        outputString += '\r\n\r\n';
        cueNum++;
    }
    return outputString;
}

function wrapItalics(text){
    return '<i>' + text + '</i>'
}

function combineCues(offset = 0) {
    let output = []
    let leftArr = srtData.filter(e => e.side === 'left');
    let rightArr = srtData.filter(e => e.side === 'right');
    for (let i = 0; i < rightArr.length; i++) {
        let current = rightArr[i];
        let newText;
        if (current.hasNeighbor()) {
            newText = current.text + '<br>' + wrapItalics(current.getNeighbor().text);
        } else {
            newText = current.text;
        }
        output.push(new Cue(current.startTime + offset, current.endTime + offset, newText, 'merged'))
    }

    for (let i = 0; i < leftArr.length; i++) {
        let current = leftArr[i];
        if (!current.hasNeighbor()) {
            output.push(new Cue(current.startTime + offset, current.endTime + offset, wrapItalics(current.text), 'merged'))
        }
    }
    return output;
}

export { srtToCueJSON, downloadFile, jsonToCue, createSrt }; 