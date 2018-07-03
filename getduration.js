const util = require('util');
const ffmpeg = require('fluent-ffmpeg');

const ffprobe = util.promisify(ffmpeg.ffprobe);

module.exports = {
    getDuration: async function (filePath) {
        try {
            let metadata = await ffprobe(filePath);
            let duration = metadata.format.duration;
            return duration;
        } catch (err) {
            console.error(err);
        }
    }
}