/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const youtube = require('./youtube');


const url = "https://www.youtube.com/watch?v=Z76TFE2HGfg";
const yt = new youtube(url);


const ytid = yt.getYTId(url);
const savePath = '../youtube-videos/'+ytid+'.mp4';



yt.on('formats',formats=> {});
  
yt.on('data',data=> {
	return console.log('data',data);
});
yt.on('done',() => {
  return console.log('download complete');
});
yt.on('ready',() => {
	return yt.download({filename:savePath,itag:134,start:'10s'});
}); 

yt.getVideoInfo();