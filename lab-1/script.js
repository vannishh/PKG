// Основные функции для работы с цветовыми моделями

// RGB в HSV
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    let s = 0;
    let v = max * 100;
    
    if (delta !== 0) {
        s = (delta / max) * 100;
        
        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }
        
        h = Math.round(h * 60);
        if (h < 0) h += 360;
    }
    
    return {
        h: Math.round(h),
        s: Math.round(s),
        v: Math.round(v)
    };
}

// HSV в RGB
function hsvToRgb(h, s, v) {
    h = h % 360;
    s /= 100;
    v /= 100;
    
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    
    let r, g, b;
    
    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }
    
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

// RGB в LAB (через XYZ)
function rgbToLab(r, g, b) {
    // Сначала преобразуем RGB в XYZ
    let rLinear = r / 255;
    let gLinear = g / 255;
    let bLinear = b / 255;
    
    rLinear = (rLinear > 0.04045) ? Math.pow((rLinear + 0.055) / 1.055, 2.4) : rLinear / 12.92;
    gLinear = (gLinear > 0.04045) ? Math.pow((gLinear + 0.055) / 1.055, 2.4) : gLinear / 12.92;
    bLinear = (bLinear > 0.04045) ? Math.pow((bLinear + 0.055) / 1.055, 2.4) : bLinear / 12.92;
    
    let x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
    let y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750;
    let z = rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041;
    
    // Нормализуем относительно D65
    x /= 0.95047;
    z /= 1.08883;
    
    // Преобразуем XYZ в LAB
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    
    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const bVal = 200 * (y - z);
    
    return {
        l: Math.round(l),
        a: Math.round(a),
        b: Math.round(bVal)
    };
}

// LAB в RGB (через XYZ)
function labToRgb(l, a, bVal) {
    // Преобразуем LAB в XYZ
    let y = (l + 16) / 116;
    let x = a / 500 + y;
    let z = y - bVal / 200;
    
    x = (Math.pow(x, 3) > 0.008856) ? Math.pow(x, 3) : (x - 16/116) / 7.787;
    y = (Math.pow(y, 3) > 0.008856) ? Math.pow(y, 3) : (y - 16/116) / 7.787;
    z = (Math.pow(z, 3) > 0.008856) ? Math.pow(z, 3) : (z - 16/116) / 7.787;
    
    // Денормализуем относительно D65
    x *= 0.95047;
    z *= 1.08883;
    
    // Преобразуем XYZ в RGB
    let rLinear = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    let gLinear = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
    let bLinear = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
    
    rLinear = (rLinear > 0.0031308) ? 1.055 * Math.pow(rLinear, 1/2.4) - 0.055 : 12.92 * rLinear;
    gLinear = (gLinear > 0.0031308) ? 1.055 * Math.pow(gLinear, 1/2.4) - 0.055 : 12.92 * gLinear;
    bLinear = (bLinear > 0.0031308) ? 1.055 * Math.pow(bLinear, 1/2.4) - 0.055 : 12.92 * bLinear;
    
    // Ограничиваем значения от 0 до 1 и преобразуем в 0-255
    rLinear = Math.max(0, Math.min(1, rLinear));
    gLinear = Math.max(0, Math.min(1, gLinear));
    bLinear = Math.max(0, Math.min(1, bLinear));
    
    return {
        r: Math.round(rLinear * 255),
        g: Math.round(gLinear * 255),
        b: Math.round(bLinear * 255)
    };
}

// RGB в HEX
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// HEX в RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Основные переменные для хранения текущего цвета
let currentRgb = { r: 127, g: 127, b: 127 };
let currentHsv = { h: 0, s: 0, v: 50 };
let currentLab = { l: 53, a: 0, b: 0 };

// Элементы DOM
const colorPreview = document.getElementById('colorPreview');
const colorValue = document.getElementById('colorValue');

// RGB элементы
const rgbR = document.getElementById('rgb-r');
const rgbRValue = document.getElementById('rgb-r-value');
const rgbG = document.getElementById('rgb-g');
const rgbGValue = document.getElementById('rgb-g-value');
const rgbB = document.getElementById('rgb-b');
const rgbBValue = document.getElementById('rgb-b-value');
const rgbColorPicker = document.getElementById('rgb-color-picker');

// HSV элементы
const hsvH = document.getElementById('hsv-h');
const hsvHValue = document.getElementById('hsv-h-value');
const hsvS = document.getElementById('hsv-s');
const hsvSValue = document.getElementById('hsv-s-value');
const hsvV = document.getElementById('hsv-v');
const hsvVValue = document.getElementById('hsv-v-value');
const hsvColorPicker = document.getElementById('hsv-color-picker');

// LAB элементы
const labL = document.getElementById('lab-l');
const labLValue = document.getElementById('lab-l-value');
const labA = document.getElementById('lab-a');
const labAValue = document.getElementById('lab-a-value');
const labB = document.getElementById('lab-b');
const labBValue = document.getElementById('lab-b-value');
const labColorPicker = document.getElementById('lab-color-picker');

// Обновление интерфейса на основе текущего RGB цвета
function updateFromRgb() {
    // Обновляем HSV
    currentHsv = rgbToHsv(currentRgb.r, currentRgb.g, currentRgb.b);
    
    // Обновляем LAB
    currentLab = rgbToLab(currentRgb.r, currentRgb.g, currentRgb.b);
    
    // Обновляем HEX
    const hex = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);
    
    // Обновляем предпросмотр цвета
    colorPreview.style.backgroundColor = hex;
    colorValue.textContent = `RGB: (${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}) | HEX: ${hex}`;
    
    // Обновляем RGB элементы
    rgbR.value = currentRgb.r;
    rgbRValue.value = currentRgb.r;
    rgbG.value = currentRgb.g;
    rgbGValue.value = currentRgb.g;
    rgbB.value = currentRgb.b;
    rgbBValue.value = currentRgb.b;
    rgbColorPicker.value = hex;
    
    // Обновляем HSV элементы
    hsvH.value = currentHsv.h;
    hsvHValue.value = currentHsv.h;
    hsvS.value = currentHsv.s;
    hsvSValue.value = currentHsv.s;
    hsvV.value = currentHsv.v;
    hsvVValue.value = currentHsv.v;
    hsvColorPicker.value = hex;
    
    // Обновляем LAB элементы
    labL.value = currentLab.l;
    labLValue.value = currentLab.l;
    labA.value = currentLab.a;
    labAValue.value = currentLab.a;
    labB.value = currentLab.b;
    labBValue.value = currentLab.b;
    labColorPicker.value = hex;
    
    // Скрываем все предупреждения
    hideAllWarnings();
}

// Обновление интерфейса на основе текущего HSV цвета
function updateFromHsv() {
    // Обновляем RGB
    currentRgb = hsvToRgb(currentHsv.h, currentHsv.s, currentHsv.v);
    
    // Обновляем LAB
    currentLab = rgbToLab(currentRgb.r, currentRgb.g, currentRgb.b);
    
    // Обновляем HEX
    const hex = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);
    
    // Обновляем предпросмотр цвета
    colorPreview.style.backgroundColor = hex;
    colorValue.textContent = `RGB: (${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}) | HEX: ${hex}`;
    
    // Обновляем RGB элементы
    rgbR.value = currentRgb.r;
    rgbRValue.value = currentRgb.r;
    rgbG.value = currentRgb.g;
    rgbGValue.value = currentRgb.g;
    rgbB.value = currentRgb.b;
    rgbBValue.value = currentRgb.b;
    rgbColorPicker.value = hex;
    
    // Обновляем HSV элементы
    hsvH.value = currentHsv.h;
    hsvHValue.value = currentHsv.h;
    hsvS.value = currentHsv.s;
    hsvSValue.value = currentHsv.s;
    hsvV.value = currentHsv.v;
    hsvVValue.value = currentHsv.v;
    hsvColorPicker.value = hex;
    
    // Обновляем LAB элементы
    labL.value = currentLab.l;
    labLValue.value = currentLab.l;
    labA.value = currentLab.a;
    labAValue.value = currentLab.a;
    labB.value = currentLab.b;
    labBValue.value = currentLab.b;
    labColorPicker.value = hex;
    
    // Скрываем все предупреждения
    hideAllWarnings();
}

// Обновление интерфейса на основе текущего LAB цвета
function updateFromLab() {
    // Обновляем RGB
    currentRgb = labToRgb(currentLab.l, currentLab.a, currentLab.b);
    
    // Проверяем корректность RGB значений
    let warningShown = false;
    
    if (currentRgb.r < 0 || currentRgb.r > 255 || 
        currentRgb.g < 0 || currentRgb.g > 255 || 
        currentRgb.b < 0 || currentRgb.b > 255) {
        showWarning('lab-l-warning');
        showWarning('lab-a-warning');
        showWarning('lab-b-warning');
        warningShown = true;
        
        // Ограничиваем значения RGB
        currentRgb.r = Math.max(0, Math.min(255, currentRgb.r));
        currentRgb.g = Math.max(0, Math.min(255, currentRgb.g));
        currentRgb.b = Math.max(0, Math.min(255, currentRgb.b));
    }
    
    // Обновляем HSV
    currentHsv = rgbToHsv(currentRgb.r, currentRgb.g, currentRgb.b);
    
    // Обновляем LAB (с учетом ограничений)
    if (warningShown) {
        currentLab = rgbToLab(currentRgb.r, currentRgb.g, currentRgb.b);
    }
    
    // Обновляем HEX
    const hex = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);
    
    // Обновляем предпросмотр цвета
    colorPreview.style.backgroundColor = hex;
    colorValue.textContent = `RGB: (${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}) | HEX: ${hex}`;
    
    // Обновляем RGB элементы
    rgbR.value = currentRgb.r;
    rgbRValue.value = currentRgb.r;
    rgbG.value = currentRgb.g;
    rgbGValue.value = currentRgb.g;
    rgbB.value = currentRgb.b;
    rgbBValue.value = currentRgb.b;
    rgbColorPicker.value = hex;
    
    // Обновляем HSV элементы
    hsvH.value = currentHsv.h;
    hsvHValue.value = currentHsv.h;
    hsvS.value = currentHsv.s;
    hsvSValue.value = currentHsv.s;
    hsvV.value = currentHsv.v;
    hsvVValue.value = currentHsv.v;
    hsvColorPicker.value = hex;
    
    // Обновляем LAB элементы
    labL.value = currentLab.l;
    labLValue.value = currentLab.l;
    labA.value = currentLab.a;
    labAValue.value = currentLab.a;
    labB.value = currentLab.b;
    labBValue.value = currentLab.b;
    labColorPicker.value = hex;
    
    // Если предупреждение не показано, скрываем все предупреждения
    if (!warningShown) {
        hideAllWarnings();
    }
}

// Показать предупреждение
function showWarning(id) {
    document.getElementById(id).style.display = 'block';
}

// Скрыть все предупреждения
function hideAllWarnings() {
    const warnings = document.querySelectorAll('.warning');
    warnings.forEach(warning => {
        warning.style.display = 'none';
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateFromRgb();
    
    // Обработчики для RGB
    rgbR.addEventListener('input', function() {
        currentRgb.r = parseInt(this.value);
        updateFromRgb();
    });
    
    rgbRValue.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 255) value = 255;
        this.value = value;
        currentRgb.r = value;
        updateFromRgb();
    });
    
    rgbG.addEventListener('input', function() {
        currentRgb.g = parseInt(this.value);
        updateFromRgb();
    });
    
    rgbGValue.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 255) value = 255;
        this.value = value;
        currentRgb.g = value;
        updateFromRgb();
    });
    
    rgbB.addEventListener('input', function() {
        currentRgb.b = parseInt(this.value);
        updateFromRgb();
    });
    
    rgbBValue.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 255) value = 255;
        this.value = value;
        currentRgb.b = value;
        updateFromRgb();
    });
    
    rgbColorPicker.addEventListener('input', function() {
        const rgb = hexToRgb(this.value);
        currentRgb.r = rgb.r;
        currentRgb.g = rgb.g;
        currentRgb.b = rgb.b;
        updateFromRgb();
    });
    
    // Обработчики для HSV
    hsvH.addEventListener('input', function() {
        currentHsv.h = parseInt(this.value);
        updateFromHsv();
    });
    
    hsvHValue.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 360) value = 360;
        this.value = value;
        currentHsv.h = value;
        updateFromHsv();
    });
    
    hsvS.addEventListener('input', function() {
        currentHsv.s = parseInt(this.value);
        updateFromHsv();
    });
    
    hsvSValue.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 100) value = 100;
        this.value = value;
        currentHsv.s = value;
        updateFromHsv();
    });
    
    hsvV.addEventListener('input', function() {
        currentHsv.v = parseInt(this.value);
        updateFromHsv();
    });
    
    hsvVValue.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 100) value = 100;
        this.value = value;
        currentHsv.v = value;
        updateFromHsv();
    });
    
    hsvColorPicker.addEventListener('input', function() {
        const rgb = hexToRgb(this.value);
        currentRgb.r = rgb.r;
        currentRgb.g = rgb.g;
        currentRgb.b = rgb.b;
        updateFromRgb();
    });
    
    // Обработчики для LAB
    labL.addEventListener('input', function() {
        currentLab.l = parseInt(this.value);
        updateFromLab();
    });
    
    labLValue.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 100) value = 100;
        this.value = value;
        currentLab.l = value;
        updateFromLab();
    });
    
    labA.addEventListener('input', function() {
        currentLab.a = parseInt(this.value);
        updateFromLab();
    });
    
    labAValue.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < -128) value = -128;
        if (value > 127) value = 127;
        this.value = value;
        currentLab.a = value;
        updateFromLab();
    });
    
    labB.addEventListener('input', function() {
        currentLab.b = parseInt(this.value);
        updateFromLab();
    });
    
    labBValue.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < -128) value = -128;
        if (value > 127) value = 127;
        this.value = value;
        currentLab.b = value;
        updateFromLab();
    });
    
    labColorPicker.addEventListener('input', function() {
        const rgb = hexToRgb(this.value);
        currentRgb.r = rgb.r;
        currentRgb.g = rgb.g;
        currentRgb.b = rgb.b;
        updateFromRgb();
    });
});