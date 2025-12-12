export function addAlphaToHex(color: string, alpha: number): string {
  // #RRGGBB 형식만 지원
  if (!color.startsWith("#") || (color.length !== 7 && color.length !== 4)) {
    return color;
  }

  let r: number, g: number, b: number;

  if (color.length === 7) {
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  } else {
    // #RGB
    r = parseInt(color[1] + color[1], 16);
    g = parseInt(color[2] + color[2], 16);
    b = parseInt(color[3] + color[3], 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
