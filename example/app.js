const moment = require('moment');

const {parse} = require('../lib');

(async () => {
    const filePath = 'GH010760.MP4';
    const {count, tags} = await parse(filePath);

    console.log(`count = ${count}`);
    console.log(`tags =`);
    tags.forEach((tag, i) => {
        console.log(`  ${i}th  ${moment(tag).format('HH:mm:ss:SS')}`);
    })
})()
    .then(() => console.log('done'), console.error);


