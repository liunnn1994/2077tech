/**
 * MSDF text layout recovered as owned, editable TypeScript.
 *
 * The input font has already been prepared by MsdfGeometryLoader: glyphs are
 * indexed by character and each glyph records isWhitespace. The output keeps
 * all seven original geometry buffers, including per-letter/word/line weights
 * consumed by the text reveal shaders. Bounds and kerning remain in atlas units
 * until the final scale is applied here.
 */
export interface MsdfBounds {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

export interface MsdfGlyph {
  unicode: number;
  advance: number;
  isWhitespace: boolean;
  planeBounds?: MsdfBounds;
  atlasBounds?: MsdfBounds;
}

export interface PreparedMsdfFont {
  atlas: { width: number; height: number };
  metrics: { lineHeight: number };
  glyphs: Record<string, MsdfGlyph>;
  kerning: { unicode1: number; unicode2: number; advance: number }[];
  placeholderChar: string;
}

export interface MsdfLayoutOptions {
  text?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  size?: number;
  letterSpacing?: number;
  lineHeight?: number;
  wordSpacing?: number;
  wordBreak?: boolean;
  baseOffset?: number;
}

export interface MsdfGeometryBuffers {
  index: Uint16Array<ArrayBuffer>;
  position: Float32Array<ArrayBuffer>;
  uv: Float32Array<ArrayBuffer>;
  centr: Float32Array<ArrayBuffer>;
  uvMask: Float32Array<ArrayBuffer>;
  textWeights: Float32Array<ArrayBuffer>;
  lineWeights: Float32Array<ArrayBuffer>;
  maxLineHeight: number;
  maxUVDisp: number;
}

interface MsdfRequest {
  font: PreparedMsdfFont;
  options: MsdfLayoutOptions;
}

type MsdfResponse = { buffers: MsdfGeometryBuffers } | { error: true; message: string };

interface MsdfWorkerPort {
  onmessage: ((event: MessageEvent<MsdfRequest>) => void) | null;
  postMessage(message: MsdfResponse, transfer: Transferable[]): void;
}

interface PositionedGlyph {
  glyph: MsdfGlyph;
  offset: number;
}

interface TextLine {
  width: number;
  glyphs: PositionedGlyph[];
}

function kerningAdvance(font: PreparedMsdfFont, unicode1: number, unicode2: number): number {
  return (
    font.kerning.find((pair) => pair.unicode1 === unicode1 && pair.unicode2 === unicode2)
      ?.advance ?? 0
  );
}

function at<T>(items: readonly T[], index: number): T {
  const value = items[index];
  if (value === undefined) throw new Error(`MSDF layout index ${index} is out of range.`);
  return value;
}

export function layoutMsdf(
  font: PreparedMsdfFont,
  options: MsdfLayoutOptions,
): MsdfGeometryBuffers {
  const text = (options.text || '').replace(/\xA0/g, ' ');
  const width = options.width || Number.POSITIVE_INFINITY;
  const align = options.align || 'left';
  const size = options.size || 1;
  const letterSpacing = options.letterSpacing || 0;
  const lineHeight = options.lineHeight || 1.4;
  const wordSpacing = options.wordSpacing || 0;
  const wordBreak = options.wordBreak || false;
  const baseOffset = options.baseOffset || 0;
  const scale = size / font.metrics.lineHeight;

  // Preserve the captured allocation convention. Wrapping can remove whitespace
  // glyphs; unused quads remain zero-filled exactly as in the source algorithm.
  const glyphCapacity = text.replace(/[ \n]/g, '').length;
  const buffers: MsdfGeometryBuffers = {
    index: new Uint16Array(glyphCapacity * 6),
    position: new Float32Array(glyphCapacity * 4 * 3),
    uv: new Float32Array(glyphCapacity * 4 * 2),
    centr: new Float32Array(glyphCapacity * 4 * 3),
    uvMask: new Float32Array(glyphCapacity * 4 * 4),
    textWeights: new Float32Array(glyphCapacity * 4 * 2),
    lineWeights: new Float32Array(glyphCapacity * 4 * 3),
    maxLineHeight: Number.NEGATIVE_INFINITY,
    maxUVDisp: Number.NEGATIVE_INFINITY,
  };
  for (let glyph = 0; glyph < glyphCapacity; glyph++) {
    const vertex = glyph * 4;
    buffers.index.set(
      [vertex, vertex + 2, vertex + 1, vertex + 1, vertex + 2, vertex + 3],
      glyph * 6,
    );
  }

  const lines: TextLine[] = [];
  let characterIndex = 0;
  let wordStart = 0;
  let wordWidth = 0;
  const startLine = (): TextLine => {
    const line: TextLine = { width: 0, glyphs: [] };
    lines.push(line);
    wordStart = characterIndex;
    wordWidth = 0;
    return line;
  };

  let line = startLine();
  while (characterIndex < text.length) {
    let character = text[characterIndex] ?? '';
    if (!line.width && /[ \t]/.test(character)) {
      characterIndex++;
      wordStart = characterIndex;
      wordWidth = 0;
      continue;
    }
    if (/\n/.test(character)) {
      const previous = line.glyphs.at(-1);
      if (previous?.glyph.isWhitespace) {
        line.width -= wordSpacing * size + previous.glyph.advance * scale;
        line.glyphs.pop();
      }
      characterIndex++;
      line = startLine();
      continue;
    }

    let glyph = font.glyphs[character];
    if (!glyph) {
      console.warn(
        `${character} is not present in the MSDF font atlas. Using "${font.placeholderChar}" instead.`,
      );
      character = font.placeholderChar;
      glyph = font.glyphs[character];
    }
    if (!glyph) throw new Error(`MSDF placeholder glyph "${font.placeholderChar}" is missing.`);
    const previous = line.glyphs.at(-1);
    if (previous) {
      // Keep the observed pair order; changing it would alter captured spacing.
      const kerning = kerningAdvance(font, glyph.unicode, previous.glyph.unicode) * scale;
      line.width += kerning;
      wordWidth += kerning;
    }
    line.glyphs.push({ glyph, offset: line.width });
    let advance = 0;
    if (glyph.isWhitespace) {
      wordStart = characterIndex;
      wordWidth = 0;
      advance += wordSpacing * size;
    } else advance += letterSpacing * size;
    advance += glyph.advance * scale;
    line.width += advance;
    wordWidth += advance;

    if (line.width > width) {
      if (wordBreak && line.glyphs.length > 1) {
        line.width -= advance;
        line.glyphs.pop();
        line = startLine();
        continue;
      }
      if (!wordBreak && wordWidth !== line.width) {
        const count = characterIndex - wordStart + 1;
        line.glyphs.splice(-count, count);
        characterIndex = wordStart;
        line.width -= wordWidth;
        line = startLine();
        continue;
      }
    }
    characterIndex++;
  }
  if (!line.width) lines.pop();

  let lastTextIndex = -1;
  let lastWordIndex = -1;
  const spacesPerLine = lines.map((textLine) => {
    lastTextIndex += textLine.glyphs.length;
    lastWordIndex++;
    let spaces = 0;
    for (const item of textLine.glyphs) {
      if (item.glyph.isWhitespace) {
        lastWordIndex++;
        spaces++;
      }
    }
    return spaces;
  });
  const textWeightScale = lastTextIndex < 1 ? 0 : 1 / lastTextIndex;
  const wordWeightScale = lastWordIndex < 1 ? 0 : 1 / lastWordIndex;
  const lastLineIndex = lines.length - 1;
  const lineWeightScale = lastLineIndex < 1 ? 0 : 1 / lastLineIndex;
  const glyphWeightScales = lines.map((textLine) =>
    textLine.glyphs.length < 2 ? 0 : 1 / (textLine.glyphs.length - 1),
  );
  const spaceWeightScales = spacesPerLine.map((spaces) => (spaces < 1 ? 0 : 1 / spaces));

  let baseline = baseOffset * size;
  let writtenGlyphs = 0;
  let textIndex = -1;
  let wordIndex = 0;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const textLine = at(lines, lineIndex);
    const lineWeight = lineIndex * lineWeightScale;
    let lineWordIndex = 0;
    for (let glyphIndex = 0; glyphIndex < textLine.glyphs.length; glyphIndex++) {
      const item = at(textLine.glyphs, glyphIndex);
      const glyph = item.glyph;
      let x = item.offset;
      if (align === 'center') x -= textLine.width * 0.5;
      else if (align === 'right') x -= textLine.width;
      textIndex++;
      if (glyph.isWhitespace) {
        wordIndex++;
        lineWordIndex++;
        continue;
      }
      const plane = glyph.planeBounds;
      const atlas = glyph.atlasBounds;
      if (!plane || !atlas) throw new Error(`MSDF bounds missing for glyph ${glyph.unicode}.`);
      const bottom = plane.bottom * scale;
      const left = plane.left * scale;
      const right = plane.right * scale;
      const top = plane.top * scale;
      buffers.position.set(
        [
          x + left,
          baseline + bottom,
          0,
          x + left,
          baseline + top,
          0,
          x + right,
          baseline + bottom,
          0,
          x + right,
          baseline + top,
          0,
        ],
        writtenGlyphs * 12,
      );
      buffers.maxLineHeight = Math.max(buffers.maxLineHeight, Math.abs(top) + Math.abs(bottom));
      const centerX = x + left + (Math.abs(left) + Math.abs(right)) * 0.5;
      const centerY = baseline + bottom + (Math.abs(bottom) + Math.abs(top)) * 0.5;
      buffers.centr.set(
        [centerX, centerY, 0, centerX, centerY, 0, centerX, centerY, 0, centerX, centerY, 0],
        writtenGlyphs * 12,
      );
      const u0 = atlas.left / font.atlas.width;
      const u1 = atlas.right / font.atlas.width;
      const v0 = atlas.bottom / font.atlas.height;
      const v1 = atlas.top / font.atlas.height;
      buffers.uv.set([u0, v0, u0, v1, u1, v0, u1, v1], writtenGlyphs * 8);
      buffers.maxUVDisp = Math.max(Math.max(buffers.maxUVDisp, u1 - u0), v1 - v0);
      buffers.uvMask.set(
        [u0, u1, v0, v1, u0, u1, v0, v1, u0, u1, v0, v1, u0, u1, v0, v1],
        writtenGlyphs * 16,
      );
      const letterWeight = textIndex * textWeightScale;
      const wordWeight = wordIndex * wordWeightScale;
      buffers.textWeights.set(
        [
          letterWeight,
          wordWeight,
          letterWeight,
          wordWeight,
          letterWeight,
          wordWeight,
          letterWeight,
          wordWeight,
        ],
        writtenGlyphs * 8,
      );
      const glyphLineWeight = at(glyphWeightScales, lineIndex) * glyphIndex;
      const wordLineWeight = at(spaceWeightScales, lineIndex) * lineWordIndex;
      buffers.lineWeights.set(
        [
          glyphLineWeight,
          wordLineWeight,
          lineWeight,
          glyphLineWeight,
          wordLineWeight,
          lineWeight,
          glyphLineWeight,
          wordLineWeight,
          lineWeight,
          glyphLineWeight,
          wordLineWeight,
          lineWeight,
        ],
        writtenGlyphs * 12,
      );
      writtenGlyphs++;
    }
    wordIndex++;
    baseline -= size * lineHeight;
  }
  return buffers;
}

const msdfWorker = globalThis as unknown as MsdfWorkerPort;
msdfWorker.onmessage = (event) => {
  try {
    const buffers = layoutMsdf(event.data.font, event.data.options);
    const transfer: Transferable[] = [
      buffers.index.buffer,
      buffers.position.buffer,
      buffers.uv.buffer,
      buffers.centr.buffer,
      buffers.uvMask.buffer,
      buffers.textWeights.buffer,
      buffers.lineWeights.buffer,
    ];
    msdfWorker.postMessage({ buffers }, transfer);
  } catch (error: unknown) {
    msdfWorker.postMessage(
      { error: true, message: error instanceof Error ? error.message : String(error) },
      [],
    );
  }
};
