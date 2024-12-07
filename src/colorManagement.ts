// src/utils/colorManagement.ts

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

const classColorMap: Map<string, string> = new Map<string, string>();

// Helper function to find similar class names
function findSimilarClasses(className: string, existingClasses: string[]): string[] {
  // Remove whitespace and convert to lowercase for comparison
  const normalizedName = className.toLowerCase().replace(/\s+/g, '');
  
  return existingClasses.filter(existing => {
    const normalizedExisting = existing.toLowerCase().replace(/\s+/g, '');
    
    // Check if they share the same base name (e.g., "Matte 1" in "Matte 1 A")
    const baseNameMatch = normalizedName.slice(0, -1) === normalizedExisting.slice(0, -1);
    
    // Check if they only differ by last character (e.g., A vs B)
    const diffByLastChar = normalizedName.slice(0, -1) === normalizedExisting.slice(0, -1) &&
                          normalizedName !== normalizedExisting;
    
    return baseNameMatch || diffByLastChar;
  });
}

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

function getColorDifference(color1: HSLColor, color2: HSLColor): number {
  const hDiff = Math.abs(color1.h - color2.h);
  const sDiff = Math.abs(color1.s - color2.s);
  const lDiff = Math.abs(color1.l - color2.l);
  
  const normalizedHDiff = Math.min(hDiff, 360 - hDiff);
  
  return normalizedHDiff * 0.7 + sDiff * 0.2 + lDiff * 0.1;
}

function generateBaseHue(className: string, similarClasses: string[]): number {
  // If there are similar classes, use their position in the sequence to determine base hue
  if (similarClasses.length > 0) {
    const position = similarClasses.length + 1;
    // Use complementary colors for similar classes (180 degrees apart on color wheel)
    return (position * 180) % 360;
  }

  // Otherwise, generate based on class name
  let hash = 0;
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}

function isColorTooSimilar(newColor: HSLColor, existingColors: HSLColor[], isSimilarName: boolean): boolean {
  // Require more difference for similar names
  const minDifference = isSimilarName ? 90 : 30;
  return existingColors.some(existing => 
    getColorDifference(newColor, existing) < minDifference
  );
}

function generateDistinctColor(className: string, existingColors: HSLColor[], similarClasses: string[]): string {
  const baseHue = generateBaseHue(className, similarClasses);
  let hue = baseHue;
  
  // Adjust saturation and lightness based on whether there are similar classes
  const isSimilarName = similarClasses.length > 0;
  const baseSaturation = isSimilarName ? 85 : 70;
  const baseLightness = isSimilarName ? 80 : 75;
  
  let saturation = baseSaturation + Math.random() * 10;
  let lightness = baseLightness + Math.random() * 10;
  
  let attempts = 0;
  const maxAttempts = 72; // More attempts for better distribution
  const goldenAngle = 137.5;
  
  let color: HSLColor = { h: hue, s: saturation, l: lightness };
  
  while (isColorTooSimilar(color, existingColors, isSimilarName) && attempts < maxAttempts) {
    // For similar names, use larger hue jumps
    const hueStep = isSimilarName ? goldenAngle * 2 : goldenAngle;
    hue = (baseHue + hueStep * attempts) % 360;
    
    // Alternate saturation and lightness more dramatically for similar names
    if (isSimilarName) {
      saturation = baseSaturation + (attempts % 3) * 15;
      lightness = baseLightness + (attempts % 2) * 15;
    } else {
      saturation = baseSaturation + (attempts % 3) * 10;
      lightness = baseLightness + (attempts % 2) * 10;
    }
    
    color = { h: hue, s: saturation, l: lightness };
    attempts++;
  }
  
  return HSLToHex(color);
}

export const initializeColorSystem = (): void => {
  classColorMap.clear();
};

export const generateBoxColor = (className: string, preferredColor?: string): string => {
  if (classColorMap.has(className)) {
    return classColorMap.get(className)!;
  }

  if (preferredColor && !Array.from(classColorMap.values()).includes(preferredColor)) {
    classColorMap.set(className, preferredColor);
    return preferredColor;
  }

  const existingClasses = Array.from(classColorMap.keys());
  const similarClasses = findSimilarClasses(className, existingClasses);
  const existingColors = Array.from(classColorMap.values()).map(hexToHSL);
  
  const newColor = generateDistinctColor(className, existingColors, similarClasses);
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