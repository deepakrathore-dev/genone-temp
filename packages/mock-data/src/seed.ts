// Deterministic seed PRNG so mock data is stable across rebuilds.

let seedState = 0xC0FFEE;

export function seed(n: number) {
  seedState = n >>> 0;
}

export function rand(): number {
  // xorshift32
  let x = seedState | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  seedState = x >>> 0;
  return (seedState & 0x7fffffff) / 0x7fffffff;
}

export function randInt(min: number, maxInclusive: number) {
  return Math.floor(rand() * (maxInclusive - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!;
}

export function chance(p: number) {
  return rand() < p;
}
