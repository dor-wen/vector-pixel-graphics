// ---------------------------------------------------------------------------
// Zentrale Konfiguration. Hier anpassen, ohne Komponenten anzufassen.
// ---------------------------------------------------------------------------

export type Shape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; fill: string }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill: string }
  | { kind: 'polygon'; points: [number, number][]; fill: string };

export type QuizItem = {
  id: string;
  title: string;
  shapes: Shape[];
  resolution: number; // Rasterauflösung der Pixelversion (z. B. 24 = 24x24)
  vectorIsFirst: boolean; // liegt die Vektorgrafik links (A)?
  explanation: string;
};

export const siteConfig = {
  title: 'Vektor oder Pixel?',
  subtitle: 'Wie der Computer Bilder speichert',
};

export const pixelTaskConfig = {
  // Bild in public/bilder/ ablegen. Fehlt es, wird ein Ersatzmuster verwendet.
  imageSrc: `bilder/vorlage.png`,
  columns: 16,
  rows: 12,
  palette: ['#1b2a41', '#324a5f', '#ccc9dc', '#f2e9dc', '#7d1d1d', '#c9974b'],
  // Ersatz-Lösung (6 Farbbänder), solange kein Foto hinterlegt ist.
  // Jede Ziffer = Index in palette.
  fallbackTarget: [
    '0000000000000000',
    '0000000000000000',
    '1111111111111111',
    '1111111111111111',
    '2222222222222222',
    '2222222222222222',
    '3333333333333333',
    '3333333333333333',
    '4444444444444444',
    '4444444444444444',
    '5555555555555555',
    '5555555555555555',
  ],
};

export type EncodingColor = {
  letter: string;
  name: string;
  value: string;
};

export type EncodingTask = {
  id: string;
  title: string;
  hint: string;
  // Zeilen des gesuchten Bildes. Jeder Buchstabe = ein Pixel.
  rows: string[];
};

export const encodingConfig = {
  columns: 8,
  rows: 8,
  palette: [
    { letter: 'R', name: 'rot', value: '#c0453b' },
    { letter: 'W', name: 'weiß', value: '#ffffff' },
    { letter: 'B', name: 'blau', value: '#2f5aa8' },
    { letter: 'G', name: 'grün', value: '#3f8f5b' },
    { letter: 'Y', name: 'gelb', value: '#e8c33f' },
    { letter: 'P', name: 'pink', value: '#e07aa8' },
  ] as EncodingColor[],
  // Startbild: rotes Herz auf weißem Grund.
  starterRows: [
    'WRRWWRRW',
    'RRRRRRRR',
    'RRRRRRRR',
    'RRRRRRRR',
    'WRRRRRRW',
    'WWRRRRWW',
    'WWWRRWWW',
    'WWWWWWWW',
  ],
};

export const encodingTasks: EncodingTask[] = [
  {
    id: 'kreuz',
    title: 'Das Kreuz',
    hint: 'Alle Arme sind genau ein Pixel breit. Die Mitte gehört zur waagerechten Reihe.',
    rows: ['WWBWW', 'WWBWW', 'BBBBB', 'WWBWW', 'WWBWW'],
  },
  {
    id: 'pfeil',
    title: 'Der Pfeil',
    hint: 'Die Spitze zeigt nach rechts. In der Mitte ist die breiteste Stelle.',
    rows: ['WWGWW', 'WWWGW', 'GGGGG', 'WWWGW', 'WWGWW'],
  },
  {
    id: 'schachbrett',
    title: 'Das Schachbrett',
    hint: 'Achte auf die Reihenfolge: Der Code läuft erst die ganze Zeile entlang, dann in die nächste.',
    rows: ['YWYWY', 'WYWYW', 'YWYWY', 'WYWYW', 'YWYWY'],
  },
];

export const quizItems: QuizItem[] = [
  {
    id: 'haus',
    title: 'Das Haus',
    resolution: 500,
    vectorIsFirst: true,
    shapes: [
      { kind: 'rect', x: 62, y: 16, w: 8, h: 24, fill: '#444' },
      { kind: 'rect', x: 22, y: 46, w: 56, h: 42, fill: '#e8c9a0' },
      { kind: 'polygon', points: [[16, 46], [84, 46], [50, 16]], fill: '#8c3b2f' },
      { kind: 'rect', x: 45, y: 66, w: 12, h: 22, fill: '#5b2c1a' },
      { kind: 'rect', x: 28, y: 52, w: 10, h: 10, fill: '#ffff00' },
    ],
    explanation:
      'Beim Pixelbild sind die schrägen Dachkanten in kleine Stufen zerlegt. Je stärker du vergrößerst, desto deutlicher werden die einzelnen Quadrate. Die Vektorgrafik beschreibt nur „Dreieck“ und „Rechteck“ – deshalb bleiben ihre Kanten immer glatt.',
  },
  {
    id: 'ziel',
    title: 'Die Zielscheibe',
    resolution: 560,
    vectorIsFirst: false,
    shapes: [
      { kind: 'circle', cx: 50, cy: 50, r: 46, fill: '#1b2a41' },
      { kind: 'circle', cx: 50, cy: 50, r: 35, fill: '#f2e9dc' },
      { kind: 'circle', cx: 50, cy: 50, r: 26, fill: '#7d1d1d' },
      { kind: 'circle', cx: 50, cy: 50, r: 16, fill: '#f2e9dc' },
      { kind: 'circle', cx: 50, cy: 50, r: 7, fill: '#c9974b' },
    ],
    explanation:
      'Runde Formen sind der härteste Fall für ein Pixelbild: Aus dem Kreis wird eine Treppe aus Quadraten. Beim Vergrößern verschwindet keine Information – die Quadrate werden nur größer.',
  },
  {
    id: 'pfeil',
    title: 'Der Pfeil',
    resolution: 480,
    vectorIsFirst: true,
    shapes: [
      {
        kind: 'polygon',
        points: [[10, 38], [52, 38], [52, 18], [90, 50], [52, 82], [52, 62], [10, 62]],
        fill: '#2e6f4e',
      },
    ],
    explanation:
      'Vergrößere die Spitze des Pfeils: In der Vektorgrafik treffen zwei gerade Linien exakt aufeinander. Im Pixelbild siehst du, welche Quadrate eingefärbt wurden – die Spitze „eiert“.',
  },
];
