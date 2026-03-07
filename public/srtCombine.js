import { Cue } from "./model.js";

export class srtCombine {
    

    static async getCombinedSrt(srt_1, srt_2) {
        const enJSON = await srtCombine.srtToJSON(srt_1, 'left')
        const esJSON = await srtCombine.srtToJSON(srt_2, 'right')
        let comboArray = enJSON.concat(esJSON);
        comboArray.sort((a, b) => { return a.startTime - b.startTime })
        return comboArray

    }

    static async getStrText (file){
        const data = await file.text();
        return data.toString();
    }


    static parseSrtTime(time) {
        const [hms, ms] = time.split(",");
        const [hh, mm, ss] = hms.split(":").map((i) => Number(i));

        return (
            hh * 60 * 60 * 1000 +
            mm * 60 * 1000 +
            ss * 1000 +
            Number(ms)
        );
    }

    static async srtToJSON(path, side){

        const fileString = await srtCombine.getStrText(path);
        const srtArray = fileString.split('\r\n\r\n')

        const mapped = srtArray.map((record) => {

            let block = record.split('\r\n')
            let i = 2
            let rawText = '';
            while (block[i]) {
                rawText += ((i > 2) ? '<br>' : '') + block[i]
                i++
            }

            let text  = rawText;
            let start = srtCombine.parseSrtTime(block[1].split(' --> ')[0])
            let end = srtCombine.parseSrtTime(block[1].split(' --> ')[1])
            return new Cue(start, end, text, side);
        })

        return mapped;
    }
}





