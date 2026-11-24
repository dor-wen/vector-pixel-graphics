import { hexToRgb } from './graphics';

/**
 * Filtert eine Eingabe auf die erlaubten Buchstaben und schneidet sie auf
 * `limit` Zeichen. Alles andere (Leerzeichen, Kleinbuchstaben, Tippfehler)
 * fällt weg – so bleibt der Code immer im vereinbarten Format.
 */
export function normalizeCode(input: string, alphabet: string, limit: number): string {
  const allowed = new Set(alphabet.toUpperCase().split(''));
  let result = '';
  for (const char of input.toUpperCase()) {
    if (!allowed.has(char)) continue;
    result += char;
    if (result.length === limit) break;
  }
  return result;
}

/**
 * Zerlegt den Code zeilenweise. Fehlende Zeichen am Ende werden mit
 * `placeholder` aufgefüllt, damit man die Zeilenstruktur sieht.
 */
export function splitRows(
  code: string,
  columns: number,
  rows: number,
  placeholder = '·',
): string[] {
  const lines: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    let line = '';
    for (let c = 0; c < columns; c += 1) {
      line += code[r * columns + c] ?? placeholder;
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Setzt das Zeichen an `index`. Liegt der Index hinter dem bisherigen Code,
 * werden die Lücken bis dorthin mit demselben Buchstaben gefüllt.
 */
export function paintCell(
  code: string,
  index: number,
  letter: string,
  limit: number,
): string {
  if (index < 0 || index >= limit) return code;
  if (index < code.length) {
    return code.slice(0, index) + letter + code.slice(index + 1);
  }
  return (code + letter.repeat(index - code.length) + letter).slice(0, limit);
}

/** Wählt Schwarz oder Weiß für gute Lesbarkeit auf der gegebenen Farbe. */
export function readableTextColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1c2530' : '#ffffff';
}
