import { srtCombine } from "./srtCombine.js";
const comboArray = await srtCombine.getCombinedSrt('./srt-files/en.srt','./srt-files/es.srt');
console.log(comboArray)