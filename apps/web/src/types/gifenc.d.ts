declare module 'gifenc' {
  export function GIFEncoder(): {
    writeFrame(
      indexedPixels: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: number[][];
        delay?: number;
        dispose?: number;
        repeat?: number;
        transparent?: number;
        colorDepth?: number;
      },
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
  };

  export function quantize(
    rgba: Uint8Array,
    maxColors: number,
    options?: { format?: string; oneBit?: boolean; clearAlpha?: boolean },
  ): number[][];

  export function applyPalette(
    rgba: Uint8Array,
    palette: number[][],
    format?: string,
  ): Uint8Array;
}
