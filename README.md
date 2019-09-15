
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

# CLI usage

* basic usage
    ```bash
    npx gopro-hilight-extract GH010760.MP4
    ```
* [xmp](https://github.com/adobe/xmp-docs/blob/master/XMPNamespaces/XMPDataTypes/Marker.md) file for working with `Adobe Prelude` See [Work with `GoPro Quik` and `Adobe Prelude`](#Work-with-GoPro-Quik-and-adobe-prelude)
    ```bash
    npx gopro-hilight-extract -t xmp GH010760.MP4
    ```
* See more
    ```bash
    npx gopro-hilight-extract --help
    ```

# Work with `GoPro Quik` and `Adobe Prelude`
1. Edit HiLight tags in `GoPro Quik`
2. Extract xmp file by `npx gopro-hilight-extract -t xmp <file>`
3. Open a `Adobe Prelude` project and then import a xmp file by the penal which is open on `Window -> Unassociated Metadata`).
4. Apply to some clips
