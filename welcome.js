const ffmpeg = require('fluent-ffmpeg');
const path = require('path')
const getDuration = require('./getduration');

function ffmpegStartFunc(commandLine) {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
}
function ffmpegProgressFunc(progress) {
        console.log('Processing: ' + (progress.percent || 0).toFixed(2) + '% done');
}
function ffmpegEndFunc() {
        console.log('Files have been merged succesfully');
}
function ffmpegErrorFunc(err) {
        console.log('An error happened: ' + err.message);
}

function addWelcome (text, backgroundFilename, outputFilename) {

    emptyFilename = "empty.png"

    complexFilter = [];

    // Add Text
    input = '[0:v]';
    output = '';
    for (var i = 0; i < text.length; i++) {
        if (i != 0)
            input = output
        output = 'out'+i
        
        textLineFilter = {
            filter: 'drawtext', 
            options: {
                fontfile:'opensansbold.ttf',
                text: text[i],
                fontsize: '400',
                fontcolor: 'white',
                x: '(w - tw)/2',
                y: '(h + (' + (2 * i - text.length)*1.5 + ')*th)/2'
            },
            inputs: input,
            outputs: output
        }
        complexFilter.push(textLineFilter)
    }

    input = output
    output = 'out'+i++
    complexFilter.push({
        filter: 'zoompan', 
        options: {
            z:'min(zoom+0.0015,1.25)',
            d: '80',
            x: 'trunc(iw/2-(iw/zoom/2))',
            y: 'trunc(ih/2-(ih/zoom/2))'
        },
        inputs: input,
        outputs: output
    })

    input = output
    output = 'out'+i++
    complexFilter.push({
        filter: 'fade', 
        options: {
            t:'in',
            st: '0.25',
            d: '0.5',
            alpha: 1
        },
        inputs: input,
        outputs: output
    })
    input = output
    output = 'out'+i++
    complexFilter.push({
        filter: 'fade', 
        options: {
            t:'out',
            st: '2.3',
            d: '0.5',
            alpha: 1
        },
        inputs: input,
        outputs: output
    })

    input = output
    output = 'out'+i++
    complexFilter.push({
        filter: 'overlay', 
        options: {x: "(W-w)/2", y: "(H-h)/2", shortest: 1},
        inputs: ['[1]', input],
        outputs: output
    })

    let command = ffmpeg()
    .on('start', ffmpegStartFunc)
    .on('progress', ffmpegProgressFunc)
    .on('error', ffmpegErrorFunc)
    .input(emptyFilename).loop(3)
    .input(backgroundFilename)
    .videoCodec('png')
    .complexFilter(complexFilter, output)

    return new Promise((resolve, reject) => {
        command.on('end', () => {resolve()})
        command.save(outputFilename);
    })
}
const text = ['Welcome','Baker Family','to our school'];
const backgroundFilename = "smallClipWOWelcome.mp4"
const outputFilename = "smalloutput.mov"

addWelcome(text, backgroundFilename, outputFilename);
