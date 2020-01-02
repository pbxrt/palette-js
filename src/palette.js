import ColorCutQuantizer from './color_cut_quantizer.js'
import {DARK_MUTED, DARK_VIBRANT, LIGHT_MUTED, LIGHT_VIBRANT, MUTED, VIBRANT} from './target.js'
let image = new Image();

export default class Palette {
    constructor(image, maxColors) {
        this.image = image;
        this.maxColors = maxColors || 16;

        let width = this.image.width;
        let height = this.image.height;

        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        let ctx = canvas.getContext("2d");
        ctx.drawImage(this.image, 0, 0);
        let data = ctx.getImageData(0, 0, width, height).data;

        let quantizer = new ColorCutQuantizer(data, this.maxColors);
        this.swatches = quantizer.getQuantizedColors();

        this.findDominantSwatch();

        this.targets = [LIGHT_VIBRANT, VIBRANT, DARK_VIBRANT, LIGHT_MUTED, MUTED, DARK_MUTED];
        this.usedColors = new Map();
        this.selectedSwatches = new Map();
        for (let i = 0; i < this.targets.length; i++) {
            let target = this.targets[i];
            target.normalizeWeights();
            let swatch = this.generateScoredTarget(target);
            this.selectedSwatches.set(target, swatch);
        }
        this.usedColors.clear();
    }

    findDominantSwatch() {
        let maxPop = 0;
        let maxSwatch = null;
        this.swatches.forEach(function (swatch) {
            if (swatch.population > maxPop) {
                maxSwatch = swatch;
                maxPop = swatch.population;
            }
        });
        this.dominantSwatch = maxSwatch;
    };

    generateScoredTarget(target) {
        let maxScoreSwatch = this.getMaxScoredSwatchForTarget(target);
        if (maxScoreSwatch != null) {
            this.usedColors.set(maxScoreSwatch.rgb, true);
        }
        return maxScoreSwatch;
    };

    getMaxScoredSwatchForTarget(target) {
        let maxScore = 0;
        let maxScoreSwatch = null;
        for (let i = 0; i < this.swatches.length; i++) {
            let swatch = this.swatches[i];
            if (this.shouldBeScoredForTarget(swatch, target)) {
                let score = this.generateScore(swatch, target);
                if (score > maxScore || maxScoreSwatch == null) {
                    maxScoreSwatch = swatch;
                    maxScore = score;
                }
            }
        }
        return maxScoreSwatch;
    };

    shouldBeScoredForTarget(swatch, target) {
        let hsl = swatch.getHsl();
        let s = hsl[1];
        let l = hsl[2];

        return s >= target.getMinimumSaturation() && s <= target.getMaximumSaturation()
            && l >= target.getMinimumLightness() && l <= target.getMaximumLightness()
            && !this.usedColors.get(swatch.rgb);
    };

    generateScore(swatch, target) {
        let saturationScore = 0;
        let luminanceScore = 0;
        let populationScore = 0;
        let maxPopulation = this.dominantSwatch.population;

        let hsl = swatch.getHsl();

        if (target.getSaturationWeight() > 0) {
            saturationScore = target.getSaturationWeight() * (1 - Math.abs(hsl[1] - target.getTargetSaturation()));
        }
        if (target.getLightnessWeight() > 0) {
            luminanceScore = target.getLightnessWeight() * (1 - Math.abs(hsl[2] - target.getTargetLightness()));
        }
        if (target.getPopulationWeight() > 0) {
            populationScore = target.getPopulationWeight() * (swatch.population / maxPopulation);
        }

        return saturationScore + luminanceScore + populationScore;
    };

    getDominantColor() {
        return this.dominantSwatch.getRGB();
    };

    getColorForTarget(target, defaultColor) {
        let swatch = this.selectedSwatches.get(target);
        return swatch == null ? defaultColor : swatch.getRGB();
    };

    getVibrantColor() {
        return this.getColorForTarget(VIBRANT)
    };

    getLightVibrantColor() {
        return this.getColorForTarget(LIGHT_VIBRANT)
    };

    getDarkVibrantColor() {
        return this.getColorForTarget(DARK_VIBRANT)
    };

    getMutedColor() {
        return this.getColorForTarget(MUTED)
    };

    getLightMutedColor() {
        return this.getColorForTarget(LIGHT_MUTED)
    };

    getDarkMutedColor() {
        return this.getColorForTarget(DARK_MUTED)
    };
};