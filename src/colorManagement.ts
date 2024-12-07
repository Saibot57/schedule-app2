// src/utils/colorManagement.ts

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

// Map to store class name to color assignments
const classColorMap: Map<string, string> = new Map<string, string>();

// Convert hex to HSL
function hexToHSL(hex: string): HSLColor {
  hex = hex.replace(/^#/, '');
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
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to hex
function HSLToHex({ h, s, l }: HSLColor): string {
  h /= 360;
  s /= 100;
  l /= 100;
  
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
  const r = hue2rgb(p, q, h + 1/3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1/3);

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Calculate color difference using Delta E
function getColorDifference(color1: HSLColor, color2: HSLColor): number {
  // Weighted differences for HSL
  const hDiff = Math.abs(color1.h - color2.h);
  const sDiff = Math.abs(color1.s - color2.s);
  const lDiff = Math.abs(color1.l - color2.l);
  
  // Normalize hue difference considering the circular nature of hue
  const normalizedHDiff = Math.min(hDiff, 360 - hDiff);
  
  // Weight the differences (hue differences are most important for distinction)
  return normalizedHDiff * 0.7 + sDiff * 0.2 + lDiff * 0.1;
}

// Generate a base color using the class name
function generateBaseHue(className: string): number {
  // Use string hash to generate initial hue
  let hash = 0;
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to hue (0-360)
  return Math.abs(hash % 360);
}

// Check if a color is too similar to existing colors
function isColorTooSimilar(newColor: HSLColor, existingColors: HSLColor[]): boolean {
  const minDifference = 30; // Minimum difference threshold
  return existingColors.some(existing => 
    getColorDifference(newColor, existing) < minDifference
  );
}

// Generate a new distinct color
function generateDistinctColor(className: string, existingColors: HSLColor[]): string {
  const baseHue = generateBaseHue(className);
  let hue = baseHue;
  let saturation = 70 + Math.random() * 20; // 70-90%
  let lightness = 75 + Math.random() * 10;  // 75-85%
  
  // Try different hues until we find a distinct color
  let attempts = 0;
  const maxAttempts = 36;
  const goldenAngle = 137.5;
  
  let color: HSLColor = { h: hue, s: saturation, l: lightness };
  
  while (isColorTooSimilar(color, existingColors) && attempts < maxAttempts) {
    // Rotate hue by golden angle
    hue = (baseHue + goldenAngle * attempts) % 360;
    // Alternate saturation and lightness
    saturation = 70 + (attempts % 3) * 10;
    lightness = 75 + (attempts % 2) * 10;
    
    color = { h: hue, s: saturation, l: lightness };
    attempts++;
  }
  
  return HSLToHex(color);
}

export const initializeColorSystem = (): void => {
  classColorMap.clear();
};

export const generateBoxColor = (className: string, preferredColor?: string): string => {
  // Return existing color if already assigned
  if (classColorMap.has(className)) {
    return classColorMap.get(className)!;
  }

  // Use preferred color if provided and not in use
  if (preferredColor && !Array.from(classColorMap.values()).includes(preferredColor)) {
    classColorMap.set(className, preferredColor);
    return preferredColor;
  }

  // Get all existing colors in HSL format
  const existingColors = Array.from(classColorMap.values()).map(hexToHSL);
  
  // Generate a new distinct color
  const newColor = generateDistinctColor(className, existingColors);
  classColorMap.set(className, newColor);
  
  return newColor;
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