import {rgbToHsl} from './color_utils.js'

export default class Swatch {
    constructor(red, green, blue, population) {
        this.red = red << 3;
        this.green = green << 3;
        this.blue = blue << 3;
        this.rgb = this.red << 16 | this.green << 8 | this.blue;
        this.population = population;
    }

    getHsl() {
        if (this.hsl == null) {
            this.hsl = rgbToHsl(this.red, this.green, this.blue)
        }
        return this.hsl
    };

    getRGB() {
        return 'rgb(' + this.red + ',' + this.green + ',' + this.blue + ')'
    };
}