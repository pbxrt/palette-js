export function quantizedRed(rgb555) {
    return (rgb555 >> 10) & 0x1f;
}

export function quantizedGreen(rgb555) {
    return (rgb555 >> 5) & 0x1f;
}

export function quantizedBlue(rgb555) {
    return rgb555 & 0x1f;
}

export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let d = max - min;
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        switch (max) {
            case r:
                h = ((g - b) / d) % 6;
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        s = d / (1 - Math.abs(2 * l - 1));
    }

    h = (h * 60) % 360;
    if (h < 0) {
        h += 360;
    }

    return [h, s, l];
}
