
# Package usage

```javascript
const {parse} = require('gopro-hilight-extract');

const filePath = 'GH010760.MP4';
parse(filePath)
    .then(({count, tags}) => {
        console.log(`count = ${count}`);
        console.log(`tags =`);
        tags.forEach((tag, i) => {
            console.log(`  ${i}th  ${tag} millisecond`);
        })
    })
```
