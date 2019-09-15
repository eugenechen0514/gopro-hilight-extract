#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const os = require('os');
const moment = require('moment');
const path = require('path');

const {parse} = require('../lib');

const validTypes = ['json', 'csv', 'xmp', 'pprocsv'];

program
    .version('0.1.0')
    .usage('[options] <input>')
    .option('-t, --type <type>', 'json/csv/xmp/pprocsv(Premiere Pro CSV) Default: csv', 'csv')
    .option('-o, --output <output>', 'custom output name')
    .option('--no-header', 'not header(only for csv type)')
    .parse(process.argv);

if(program.args.length <= 0) {
    console.log('Error: input is empty');
    process.exit(1);
}

const input = program.args[0];
const type = program.type;
const header = program.header;
const output = ((output, type) => {
    if(output) {
        return output;
    }
    const filenameNoExt = path.basename(input, path.extname(input));
    if(type === 'json') {
        return path.join(path.dirname(input), filenameNoExt + '.json');
    }
    if(type === 'csv') {
        return path.join(path.dirname(input), filenameNoExt + '.csv');
    }
    if(type === 'pprocsv') {
        return path.join(path.dirname(input), filenameNoExt + '.csv');
    }

    if(type === 'xmp') {
        return path.join(path.dirname(input), filenameNoExt + '.xmp');
    }
})(program.output, type);

if(!validTypes.includes(type)) {
    console.log('Error: type is not support');
    process.exit(1);
}

console.log(`Input: ${input}`);
console.log(`Output: ${output}`);

const xmpDoc = (tags) => {
    const frameRate = 30000;
    const rateBasis = 1001;
    const fps = frameRate/rateBasis;
    const duration = 0 * fps;

    const head = `
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c148 79.163765, 2019/01/24-18:11:46">
   <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about=""
             xmlns:xmpDM="http://ns.adobe.com/xmp/1.0/DynamicMedia/">
         <xmpDM:Tracks>
            <rdf:Bag>
               <rdf:li rdf:parseType="Resource">
                  <xmpDM:trackType>Comment</xmpDM:trackType>
                  <xmpDM:frameRate>f${frameRate}s${rateBasis}</xmpDM:frameRate>
                  <xmpDM:markers>
`;

    const tail = `
                  </xmpDM:markers>
               </rdf:li>
            </rdf:Bag>
         </xmpDM:Tracks>
      </rdf:Description>
   </rdf:RDF>
</x:xmpmeta>
`;

    const markerBody = tags.map(tag => {
        return `
        <rdf:Seq>
            <rdf:li rdf:parseType="Resource">
                <xmpDM:startTime>${parseInt((tag / 1000) * fps)}</xmpDM:startTime>
                <xmpDM:duration>${parseInt(duration)}</xmpDM:duration>
            </rdf:li>
        </rdf:Seq>
        `;
    })
    return `
    ${head}
    ${markerBody}
    ${tail}
    `
};

// Main process
(async () => {
    const {count, tags} = await parse(input);

    // Output
    if(count > 0) {
        if(type === 'json') {
            fs.writeFileSync(output, JSON.stringify({count, tags}));
        }
        if(type === 'csv') {
            const fd = fs.openSync(output, 'w');
            if(header) {
                fs.writeSync(fd, `tag${os.EOL}`);
            }
            tags.forEach(tag => {
                fs.writeSync(fd, `${tag}${os.EOL}`);
            });
            fs.closeSync(fd);
        }
        if(type === 'xmp') {
            fs.writeFileSync(output, xmpDoc(tags));
        }
        if(type === 'pprocsv') {
            const fd = fs.openSync(output, 'w');
            fs.writeSync(fd, `Marker Name\tDescription\tIn\tOut\tDuration\tMarker Type${os.EOL}`);
            tags.forEach((tag, i) => {
                const tagHMS = moment(tag).format('HH:mm:ss:SS');
                fs.writeSync(fd, `\t\t${tagHMS}\t${tagHMS}\t00:00:00:00\tComment${os.EOL}`);
            });
            fs.closeSync(fd);
        }
    }

    return {count, tags};
})()
    .then(({count, tags}) => {
        console.log(`Total: ${count} tags`);
    }, console.error);

