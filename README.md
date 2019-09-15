# gopro-hilight-extract

Extract HiLight tags from GoPro video files

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
* [xmp](https://github.com/adobe/xmp-docs/blob/master/XMPNamespaces/XMPDataTypes/Marker.md) file for working with `Adobe Prelude`. See [Work with `Adobe Prelude`](#Work-with-adobe-prelude)
    ```bash
    npx gopro-hilight-extract -t xmp GH010760.MP4
    ```
* See more
    ```bash
    npx gopro-hilight-extract --help
    ```


# Work with `Adobe Prelude`
1. Extract xmp file by `npx gopro-hilight-extract -t xmp <file>`
2. Open an `Adobe Prelude` project and then import a xmp file by the penal which is open on `Window -> Unassociated Metadata`).
3. Apply markers to some clips

Note: In `GoPro Quik`, HiLight tags metadata may not save in mp4 file, so this package can not extract the HiLight tags which is created in `GoPro Quik`.
