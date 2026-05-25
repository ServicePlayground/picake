/** x.y 형식 버전을 [major, minor]로 파싱 (실패 시 null) */
function parseTermsVersion(version: string): [number, number] | null {
  const match = /^(\d+)\.(\d+)$/.exec(version.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

/** 버전 내림차순 (2.1 → 1.2 → 1.1 → 1.0) */
export function compareTermsVersionsDesc(a: string, b: string): number {
  const parsedA = parseTermsVersion(a);
  const parsedB = parseTermsVersion(b);

  if (parsedA && parsedB) {
    if (parsedA[0] !== parsedB[0]) return parsedB[0] - parsedA[0];
    return parsedB[1] - parsedA[1];
  }

  return b.localeCompare(a, undefined, { numeric: true });
}

export function sortTermsVersionsByVersionDesc<T extends { version: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => compareTermsVersionsDesc(a.version, b.version));
}
