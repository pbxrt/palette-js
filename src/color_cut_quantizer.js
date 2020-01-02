import TinyQueue from '../lib/tinyqueue.js'
import Vbox from './vbox.js'
import Swatch from './swatch.js'
import {quantizedBlue, quantizedGreen, quantizedRed, rgbToHsl} from "./color_utils.js";

class ColorFilter {
    constructor() {
        this.BLACK_MAX_LIGHTNESS = 0.05;
        this.WHITE_MIN_LIGHTNESS = 0.95;
    }

    isAllowed(hsl) {
        let isWhite = hsl[2] >= this.WHITE_MIN_LIGHTNESS;
        let isBlack = hsl[2] <= this.BLACK_MAX_LIGHTNESS;
        let isNearRedILine = hsl[0] >= 10 && hsl[0] <= 37 && hsl[1] <= 0.82;
        return !isWhite && !isBlack && !isNearRedILine;
    }
}

const DEFAULT_FILTER = new ColorFilter();

export default class ColorCutQuantizer {
    constructor(data, maxColors) {
        let colorCount = 1 << 15;
        let histogram = new Int16Array(colorCount);

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i] >> 3;
            let g = data[i + 1] >> 3;
            let b = data[i + 2] >> 3;
            histogram[r << (10) | g << 5 | b]++;
        }

        let distinctColorCount = 0;
        for (let color = 0; color < colorCount; color++) {
            if (histogram[color] > 0 && ColorCutQuantizer.shouldIgnoreColor(color)) {
                histogram[color] = 0;
            }

            if (histogram[color] > 0) {
                distinctColorCount++
            }
        }

        let colors = new Int16Array(distinctColorCount);
        let index = 0;
        for (let color = 0; color < colorCount; color++) {
            if (histogram[color] > 0) {
                colors[index++] = color;
            }
        }

        if (distinctColorCount <= maxColors) {
            this.quantizedColors = new Array(distinctColorCount);
            for (let i = 0; i < distinctColorCount; i++) {
                let color = colors[i];
                let r = (color >> 10) & 0x1f;
                let g = (color >> 10) & 0x1f;
                let b = color & 0x1f;
                this.quantizedColors[i] = new Swatch(r, g, b, histogram[color])
            }
        } else {
            this.quantizedColors = ColorCutQuantizer.quantizePixels(histogram, colors, maxColors)
        }
    }

    getQuantizedColors() {
        return this.quantizedColors;
    }

    static quantizePixels(histogram, colors, maxColors) {
        let box = new Vbox(histogram, colors, 0, colors.length - 1);
        let queue = new TinyQueue([box], (a, b) => b.getVolume() - a.getVolume());

        ColorCutQuantizer.splitBoxes(queue, maxColors);

        return ColorCutQuantizer.generateAverageColors(queue);
    };

    static splitBoxes(queue, maxSize) {
        while (queue.length < maxSize) {
            let vbox = queue.pop();
            if (vbox != null && vbox.canSplit()) {
                queue.push(vbox.splitBox());
                queue.push(vbox);
            } else {
                break
            }
        }
    }

    static generateAverageColors(queue) {
        let swatches = [];
        while (queue.length) {
            let swatch = queue.pop().getAverageColor();
            if (!ColorCutQuantizer.shouldIgnoreHSL(swatch.getHsl())) {
                swatches.push(swatch)
            }
        }
        return swatches
    }

    static shouldIgnoreColor(rgb555) {
        let r = quantizedRed(rgb555) << 3;
        let g = quantizedGreen(rgb555) << 3;
        let b = quantizedBlue(rgb555) << 3;
        let hsl = rgbToHsl(r, g, b);
        return !DEFAULT_FILTER.isAllowed(hsl)
    }

    static shouldIgnoreHSL(hsl) {
        return !DEFAULT_FILTER.isAllowed(hsl)
    }
}