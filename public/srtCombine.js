export class srtCombine {
    

    static async getCombinedSrt(srt_1, srt_2) {
        const enJSON = await srtCombine.srtToJSON(srt_1, 'en')
        const esJSON = await srtCombine.srtToJSON(srt_2, 'es')
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

    static async srtToJSON(path, lang){

        const fileString = await srtCombine.getStrText(path);
        const tagPattern = new RegExp("<[a-z]{1}>|</[a-z]{1}>", "g")
        const srtArray = fileString.split('\r\n\r\n')

        const mapped = srtArray.map((record) => {

            let block = record.split('\r\n')
            let item = {}
            item.lang = lang
            item.seq = block[0]
            let i = 2
            let rawText = '';
            let containsBreak = false;
            while (block[i]) {
                rawText += ((i > 2) ? '\n' : '') + block[i]
                if (i > 2) containsBreak = true;
                i++
            }

            item.rawText = rawText;
            item.containsBreak = containsBreak
            item.textLength = rawText.replaceAll(tagPattern, '').length; 
            item.startTime = srtCombine.parseSrtTime(block[1].split(' --> ')[0])
            item.endTime = srtCombine.parseSrtTime(block[1].split(' --> ')[1])
            item.duration = item.endTime - item.startTime
            item.matched = false;
            return item
        })

        return mapped;
    }
}





