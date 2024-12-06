// utils/colorManagement.ts

const BASE_COLORS = [
  '#FFB3BA', // Light pink
  '#BAFFC9', // Light green
  '#BAE1FF', // Light blue
  '#FFFFBA', // Light yellow
  '#E2BAFF', // Light purple
  '#FFD700', // Gold
  '#98FB98', // Pale green
  '#DDA0DD', // Plum
  '#F0E68C', // Khaki
  '#87CEEB', // Sky blue
];

// Map class names to their assigned colors
let classColorMap = new Map<string, string>();

export const initializeColorSystem = () => {
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

  // Find first unused color
  const usedColors = new Set(classColorMap.values());
  const availableColor = BASE_COLORS.find(color => !usedColors.has(color));
  
  if (availableColor) {
    classColorMap.set(className, availableColor);
    return availableColor;
  }

  // Generate variation if all base colors are used
  const baseColor = BASE_COLORS[classColorMap.size % BASE_COLORS.length];
  const newColor = generateVariation(baseColor, classColorMap.size - BASE_COLORS.length);
  classColorMap.set(className, newColor);
  return newColor;
};

export const releaseColor = (className: string) => {
  classColorMap.delete(className);
};

const generateVariation = (baseColor: string, index: number): string => {
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);

  const variation = 10 * (index + 1);
  const newR = Math.min(255, Math.max(0, r + variation));
  const newG = Math.min(255, Math.max(0, g + variation));
  const newB = Math.min(255, Math.max(0, b + variation));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

export const importColors = (boxes: Array<{className: string, color: string}>) => {
  initializeColorSystem();
  boxes.forEach(({className, color}) => {
    classColorMap.set(className, color);
  });
};