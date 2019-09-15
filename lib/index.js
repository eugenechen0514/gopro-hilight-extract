const fs = require('fs');
const bento4 = require('bento4-installer');
const { spawn } = require('child_process');
const path = require('path');
const tmpDir = './';

function extract(inputPath, outPath) {
    const atomPath = 'moov/udta/HMMT';
    const process = spawn(bento4.mp4extract, ['--payload-only', atomPath, inputPath, outPath]);

    return new Promise((resolve, reject) => {
        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        process.on('close', (code) => {
            if(code === 0) {
                resolve();
                return;
            }
            reject({code});
            console.log(`child process exited with code ${code}`);
        });
    });

}

/**
 *
 * In particular, the tags are stored in a box with type HMMT in the User Data Box (udta) of the Movie Box (moov) of the MPEG-4 container.
 * See ISO/IEC 14496-12 for details on these “boxes”.
 * The HMMT box seems to be a non-standard (GoPro-specific) ISO/IEC 14496-12 box.
 * Its data consists of one or more 32-bit integers. The first integer contains the number of available HiLight tags.
 * All subsequent integers resemble an ordered list of HiLight tags. Each HiLight tag is represented as a millisecond value.
 *
 * Ref: https://superuser.com/questions/881661/how-where-does-a-gopro-camera-store-hilight-tags
 * @param inputPath
 * @return {Promise<{count: number, tags: number[]}>} tags is an array of millisecond
 */
async function parseHiLightTag(inputPath) {
    const sizeOfInteger = 4;
    const buf = Buffer.alloc(sizeOfInteger);

    const fd = fs.openSync(inputPath, 'r');

    // Data-frame: <4 byte of 'tag size'> | <4 byte array for tags>

    // tag size
    fs.readSync(fd, buf, 0, sizeOfInteger, null);
    const count = buf.readUInt32BE(0);

    // tag array
    let number = 0;
    const tags = [];
    do {
        buf.fill(0);
        fs.readSync(fd, buf, 0, sizeOfInteger, null);
        const number = buf.readUInt32BE(0);
        if(number) {
            tags.push(number);
        }
    } while (number !== 0);

    // Check
    if(tags.length !== count) {
        console.log('Warning: tag siz is not coincide with meta data')
    }

    fs.closeSync(fd);
    return {count, tags}
}

function clearTmp(outPath) {
    if(fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
    }
}

/**
 *
 * @param {string} filePath
 * @return {Promise<{count: number, tags: number[]}>} tags is an array of millisecond
 */
async function parse(filePath) {
    const outPath = path.join(tmpDir, path.basename(filePath) + '_' + new Date().getTime() + '.bin');

    const result = {
        count: 0,
        tags: [],
    };

    try {
        await extract(filePath, outPath);
        const {count, tags} = await parseHiLightTag(outPath);
        result.count = count;
        result.tags = tags;
    } catch (e) {
        clearTmp(outPath);
        return Promise.reject(e);
    }

    clearTmp(outPath);
    return result;
}

module.exports = {
    parse,
};
