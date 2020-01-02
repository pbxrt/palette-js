const WEIGHT_SATURATION = .24, WEIGHT_LUMA = .52, WEIGHT_POPULATION = .24;

const INDEX_MIN = 0, INDEX_TARGET = 1, INDEX_MAX = 2;
const INDEX_WEIGHT_SAT = 0, INDEX_WEIGHT_LUMA = 1, INDEX_WEIGHT_POP = 2;

const TARGET_DARK_LUMA = .26, MAX_DARK_LUMA = .45;
const MIN_LIGHT_LUMA = .55, TARGET_LIGHT_LUMA = .74;
const MIN_NORMAL_LUMA = .3, TARGET_NORMAL_LUMA = .5, MAX_NORMAL_LUMA = .7;
const TARGET_MUTED_SATURATION = .3, MAX_MUTED_SATURATION = .4;
const TARGET_VIBRANT_SATURATION = 1, MIN_VIBRANT_SATURATION = .35;

function setDefaultDarkLightnessValues(target) {
    target.lightnessTargets[INDEX_TARGET] = TARGET_DARK_LUMA;
    target.lightnessTargets[INDEX_MAX] = MAX_DARK_LUMA;
}

function setDefaultNormalLightnessValues(target) {
    target.lightnessTargets[INDEX_MIN] = MIN_NORMAL_LUMA;
    target.lightnessTargets[INDEX_TARGET] = TARGET_NORMAL_LUMA;
    target.lightnessTargets[INDEX_MAX] = MAX_NORMAL_LUMA;
}

function setDefaultLightLightnessValues(target) {
    target.lightnessTargets[INDEX_MIN] = MIN_LIGHT_LUMA;
    target.lightnessTargets[INDEX_TARGET] = TARGET_LIGHT_LUMA;
}

function setDefaultVibrantSaturationValues(target) {
    target.saturationTargets[INDEX_MIN] = MIN_VIBRANT_SATURATION;
    target.saturationTargets[INDEX_TARGET] = TARGET_VIBRANT_SATURATION;
}

function setDefaultMutedSaturationValues(target) {
    target.saturationTargets[INDEX_TARGET] = TARGET_MUTED_SATURATION;
    target.saturationTargets[INDEX_MAX] = MAX_MUTED_SATURATION;
}

class Target {
    constructor() {
        this.saturationTargets = [0, 0.5, 1];
        this.lightnessTargets = [0, 0.5, 1];
        this.weights = new Float32Array(3);
        this.weights[INDEX_WEIGHT_SAT] = WEIGHT_SATURATION;
        this.weights[INDEX_WEIGHT_LUMA] = WEIGHT_LUMA;
        this.weights[INDEX_WEIGHT_POP] = WEIGHT_POPULATION;
    }

    normalizeWeights() {
        let sum = 0;
        for (let i = 0, z = this.weights.length; i < z; i++) {
            let weight = this.weights[i];
            if (weight > 0) {
                sum += weight;
            }
        }
        if (sum !== 0) {
            for (let i = 0, z = this.weights.length; i < z; i++) {
                if (this.weights[i] > 0) {
                    this.weights[i] /= sum;
                }
            }
        }
    };

    getMinimumSaturation() {
        return this.saturationTargets[INDEX_MIN];
    }

    getTargetSaturation() {
        return this.saturationTargets[INDEX_TARGET];
    };

    getMaximumSaturation() {
        return this.saturationTargets[INDEX_MAX];
    };

    getMinimumLightness() {
        return this.lightnessTargets[INDEX_MIN];
    };

    getTargetLightness() {
        return this.lightnessTargets[INDEX_TARGET];
    };

    getMaximumLightness() {
        return this.lightnessTargets[INDEX_MAX];
    };

    getSaturationWeight() {
        return this.weights[INDEX_WEIGHT_SAT];
    };

    getLightnessWeight() {
        return this.weights[INDEX_WEIGHT_LUMA];
    };

    getPopulationWeight() {
        return this.weights[INDEX_WEIGHT_POP];
    };
}

export let LIGHT_VIBRANT = new Target();
setDefaultLightLightnessValues(LIGHT_VIBRANT);
setDefaultVibrantSaturationValues(LIGHT_VIBRANT);

export let VIBRANT = new Target();
setDefaultNormalLightnessValues(VIBRANT);
setDefaultVibrantSaturationValues(VIBRANT);

export let DARK_VIBRANT = new Target();
setDefaultDarkLightnessValues(DARK_VIBRANT);
setDefaultVibrantSaturationValues(DARK_VIBRANT);

export let LIGHT_MUTED = new Target();
setDefaultLightLightnessValues(LIGHT_MUTED);
setDefaultMutedSaturationValues(LIGHT_MUTED);

export let MUTED = new Target();
setDefaultNormalLightnessValues(MUTED);
setDefaultMutedSaturationValues(MUTED);

export let DARK_MUTED = new Target();
setDefaultDarkLightnessValues(DARK_MUTED);
setDefaultMutedSaturationValues(DARK_MUTED);


