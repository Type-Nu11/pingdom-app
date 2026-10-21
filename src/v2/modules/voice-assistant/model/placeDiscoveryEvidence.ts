/** Literal evidence matching is vocabulary-independent; the model supplies close synonyms. */
export function findDiscoveryEvidence(values: readonly unknown[], terms: readonly string[]): string | undefined {
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const text = value.normalize('NFKC').replace(/\s+/gu, ' ');
    for (const term of terms) {
      const normalized = term.normalize('NFKC').trim();
      if (!normalized) continue;
      const pattern = normalized.split(/\s+/u).map(escape).join('\\s*');
      const start = /^[a-z0-9]/iu.test(normalized) ? '\\b' : '';
      const end = /[a-z0-9]$/iu.test(normalized) ? '\\b' : '';
      const matches = text.matchAll(new RegExp(`${start}${pattern}${end}`, 'giu'));
      for (const match of matches) {
        const index = match.index!;
        const before = text.slice(Math.max(0, index - 60), index);
        const after = text.slice(index + match[0].length, index + match[0].length + 70);
        // Reject explicit absence/unavailability instead of using its keyword as proof.
        if (/(?:\b(?:no|without)|\b(?:do(?:es)?\s+not|doesn['’]t|don['’]t)\s+(?:serve|have|offer))\s+(?:any\s+|a\s+)?$/iu.test(before)
          || /^(?:\s|이|가|은|는|을|를|의)*(?:없|미운영|운영하지|판매하지|판매\s*중단|제공하지|취급하지|팔지|품절|이용\s*불가|not\s+available|unavailable)/iu.test(after)
          || /(?:没有|沒有)\s*$/u.test(before) || /^(?:は|が)?(?:ない|なし)/u.test(after)) continue;
        const from = Math.max(0, index - 60);
        return text.slice(from, Math.max(index + match[0].length, from + 240));
      }
    }
  }
  return undefined;
}
