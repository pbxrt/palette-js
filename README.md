# palette-js
Javascript implementation of the android palette library
![example](https://github.com/wangyiwy/palette-js/blob/master/images/example.jpg)
## Usage
Download [palette.min.js](https://github.com/wangyiwy/palette-js/blob/master/dist/palette.min.js) from this directory, include the scripts in your HTML:
```html
<script src="palette.min.js"></script>
```
Then use it like this:
```javascript
let image = new Image();
image.src = './images/flowers.bmp';
image.onload = function () {
    let palette = new Palette(image);
    console.log('DominantColor', palette.getDominantColor());
    console.log('VIBRANT', palette.getVibrantColor());// Nullable
    console.log('LIGHT_VIBRANT', palette.getLightVibrantColor());// Nullable
    console.log('DARK_VIBRANT', palette.getDarkVibrantColor());// Nullable
    console.log('MUTED', palette.getMutedColor());// Nullable
    console.log('LIGHT_MUTED', palette.getLightMutedColor());// Nullable
    console.log('DARK_MUTED', palette.getDarkMutedColor());// Nullable
}
```
## Thanks
[Anroid Palette Library](https://developer.android.com/training/material/palette-colors)

[TinyQueue](https://github.com/mourner/tinyqueue)