// src/utils/colorManagement.ts

// Expanded base colors with more variety
const BASE_COLORS: readonly string[] = [
  // Pastels
  '#FFB3BA', // Light pink
  '#BAFFC9', // Light green
  '#BAE1FF', // Light blue
  '#FFFFBA', // Light yellow
  '#E2BAFF', // Light purple
  '#FFE4B5', // Moccasin
  '#98FB98', // Pale green
  '#DDA0DD', // Plum
  '#87CEEB', // Sky blue
  '#F0E68C', // Khaki
  // Soft colors
  '#E6B3B3', // Soft red
  '#B3E6B3', // Soft green
  '#B3B3E6', // Soft blue
  '#E6E6B3', // Soft yellow
  '#E6B3E6', // Soft purple
  // Medium intensity
  '#FF9999', // Medium red
  '#99FF99', // Medium green
  '#9999FF', // Medium blue
  '#FFFF99', // Medium yellow
  '#FF99FF', // Medium purple
] as const;

// Map class names to their assigned colors
const classColorMap: Map<string, string> = new Map<string, string>();

// HSL color type for better color manipulation
interface HSLColor {
  h: number;
  s: number;
  l: number;
}

// Convert hex to HSL for better color manipulation
function hexToHSL(hex: string): HSLColor {
  // Remove the # if present
  hex = hex.replace(/^#/, '');

  // Parse the RGB values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL back to hex
function HSLToHex({ h, s, l }: HSLColor): string {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Generate a variation of a color that's visually distinct
function generateVariation(baseColor: string, index: number): string {
  const hsl = hexToHSL(baseColor);
  
  // Rotate hue by golden angle multiples for maximum distinction
  const goldenAngle = 137.5;
  hsl.h = (hsl.h + goldenAngle * (index + 1)) % 360;
  
  // Alternate between lighter and darker versions
  if (index % 2 === 0) {
    hsl.l = Math.min(90, hsl.l + 10);
  } else {
    hsl.l = Math.max(40, hsl.l - 10);
  }
  
  // Alternate saturation as well for more variety
  if (index % 3 === 0) {
    hsl.s = Math.min(90, hsl.s + 15);
  } else if (index % 3 === 1) {
    hsl.s = Math.max(30, hsl.s - 15);
  }

  return HSLToHex(hsl);
}

export const initializeColorSystem = (): void => {
  classColorMap.clear();
};

export const generateBoxColor = (className: string, preferredColor?: string): string => {
  // If this class already has a color, use it
  if (classColorMap.has(className)) {
    return classColorMap.get(className)!;
  }

  // If preferred color is provided and not in use, use it
  if (preferredColor && !Array.from(classColorMap.values()).includes(preferredColor)) {
    classColorMap.set(className, preferredColor);
    return preferredColor;
  }

  // Find first unused base color
  const usedColors = new Set<string>(classColorMap.values());
  const availableBaseColor = BASE_COLORS.find(color => !usedColors.has(color));
  
  if (availableBaseColor) {
    classColorMap.set(className, availableBaseColor);
    return availableBaseColor;
  }

  // Generate a new variation based on the class name to ensure consistency
  const baseColor = BASE_COLORS[className.length % BASE_COLORS.length];
  const variationIndex = Math.floor(classColorMap.size / BASE_COLORS.length);
  const newColor = generateVariation(baseColor, variationIndex);
  
  // Ensure the new color is not too similar to existing colors
  let attempts = 0;
  let finalColor = newColor;
  while (Array.from(classColorMap.values()).includes(finalColor) && attempts < 10) {
    finalColor = generateVariation(baseColor, variationIndex + attempts);
    attempts++;
  }

  classColorMap.set(className, finalColor);
  return finalColor;
};

export const releaseColor = (className: string): void => {
  classColorMap.delete(className);
};

export const importColors = (boxes: Array<{ className: string; color: string }>): void => {
  initializeColorSystem();
  boxes.forEach(({ className, color }) => {
    classColorMap.set(className, color);
  });
};