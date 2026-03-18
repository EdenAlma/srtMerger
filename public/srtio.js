import { addEvents } from "./events.js"
import { renderSrt } from "./render.js";
import { srtData, alignCues, Cue } from "./model.js";

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

    const fileString = await getStrText(path);
    const srtArray = fileString.split('\r\n\r\n')

    const mapped = srtArray.map((record) => {

        let block = record.split('\r\n')
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
    for(let i=0; i<cueJson.length; i++){
        let {side, text, textLength, startTime, endTime, duration, cps, matched, id} = cueJson[i];
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


export {srtToCueJSON, downloadFile, jsonToCue}; 