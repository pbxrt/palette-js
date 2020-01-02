import Swatch from './swatch.js'
import {quantizedBlue, quantizedGreen, quantizedRed} from "./color_utils.js";

const COMPONENT_RED = -3, COMPONENT_GREEN = -2, COMPONENT_BLUE = -1;

export default class Vbox {
    constructor(histogram, colors, lowerIndex, upperIndex) {
        this.histogram = histogram;
        this.colors = colors;
        this.lowerIndex = lowerIndex;
        this.upperIndex = upperIndex;
        this.fitBox()
    }

    getVolume() {
        return (this.maxRed - this.minRed + 1) * (this.maxGreen - this.minGreen + 1) * (this.maxBlue - this.minBlue + 1);
    };

    canSplit() {
        return this.upperIndex > this.lowerIndex;
    };

    fitBox() {
        this.minRed = this.minGreen = this.minBlue = Number.MAX_VALUE;
        this.maxRed = this.maxGreen = this.maxBlue = 0;
        this.population = 0;

        for (let i = this.lowerIndex; i <= this.upperIndex; i++) {
            let color = this.colors[i];
            this.population += this.histogram[color];

            let r = quantizedRed(color);
            let g = quantizedGreen(color);
            let b = quantizedBlue(color);

            if (r > this.maxRed) {
                this.maxRed = r
            }
            if (r < this.minRed) {
                this.minRed = r
            }
            if (g > this.maxGreen) {
                this.maxGreen = g
            }
            if (g < this.minGreen) {
                this.minGreen = g
            }
            if (b > this.maxBlue) {
                this.maxBlue = b
            }
            if (b < this.minBlue) {
                this.minBlue = b
            }
        }
    };

    splitBox() {
        if (!this.canSplit()) {
            throw 'Can not split a box with only 1 color'
        }

        let splitPoint = this.findSplitPoint();
        let newBox = new Vbox(this.histogram, this.colors, splitPoint + 1, this.upperIndex);

        this.upperIndex = splitPoint;
        this.fitBox();

        return newBox
    };

    getLongestColorDimension() {
        let redLen = this.maxRed - this.minRed;
        let greenLen = this.maxGreen - this.minGreen;
        let blueLen = this.maxBlue - this.minBlue;

        if (redLen >= greenLen && redLen >= blueLen) {
            return COMPONENT_RED
        } else if (greenLen >= redLen && greenLen >= blueLen) {
            return COMPONENT_GREEN
        } else {
            return COMPONENT_BLUE
        }
    };

    findSplitPoint() {
        let longestDimension = this.getLongestColorDimension();

        Vbox.modifySignificantOctet(this.colors, longestDimension, this.lowerIndex, this.upperIndex);

        Vbox.sortRange(this.colors, this.lowerIndex, this.upperIndex);

        Vbox.modifySignificantOctet(this.colors, longestDimension, this.lowerIndex, this.upperIndex);

        let midPoint = this.population / 2;
        let count = 0;
        for (let i = this.lowerIndex; i <= this.upperIndex; i++) {
            count += this.histogram[this.colors[i]];
            if (count >= midPoint) {
                return Math.min(this.upperIndex - 1, i)
            }
        }
        return this.lowerIndex
    };

    static modifySignificantOctet(colors, dimension, lower, upper) {
        switch (dimension) {
            case COMPONENT_RED:
                break;
            case COMPONENT_GREEN:
                for (let i = lower; i <= upper; i++) {
                    let color = colors[i];
                    colors[i] = quantizedGreen(color) << 10 | quantizedRed(color) << 5 | quantizedBlue(color)
                }
                break;
            case COMPONENT_BLUE:
                for (let i = lower; i <= upper; i++) {
                    let color = colors[i];
                    colors[i] = quantizedBlue(color) << 10 | quantizedGreen(color) << 5 | quantizedRed(color)
                }
                break
        }
    }

    static sortRange(arr, from, to) {
        let temp = new Int16Array(to - from + 1);
        let j = 0;
        for (let i = from; i <= to; i++) {
            temp[j] = arr[i];
            j++
        }

        temp.sort();

        j = 0;
        for (let i = from; i <= to; i++) {
            arr[i] = temp[j];
            j++
        }
    }

    getAverageColor() {
        let redSum = 0, greenSum = 0, blueSum = 0, totalPopulation = 0;
        for (let i = this.lowerIndex; i <= this.upperIndex; i++) {
            let color = this.colors[i];
            let colorPopulation = this.histogram[color];

            totalPopulation += colorPopulation;
            redSum += colorPopulation * quantizedRed(color);
            greenSum += colorPopulation * quantizedGreen(color);
            blueSum += colorPopulation * quantizedBlue(color);
        }

        let redMean = Math.round(redSum / totalPopulation);
        let greenMean = Math.round(greenSum / totalPopulation);
        let blueMean = Math.round(blueSum / totalPopulation);

        return new Swatch(redMean, greenMean, blueMean, totalPopulation);
    };
}