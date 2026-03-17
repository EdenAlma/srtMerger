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


async function loadJson(file) {
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        srtData.splice(0);
        srtData.push(...data)
        renderSrt(srtData);
        addEvents();
        alignCues();

    } catch (err) {
        console.error("Invalid JSON file", err);
    }

    // reset input so the same file can be selected again
    fileInput.value = "";
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


export {srtToCueJSON}; 