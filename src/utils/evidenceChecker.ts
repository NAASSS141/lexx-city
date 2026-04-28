import { chains } from '../data/scenes';

export type ChainCheckResult = 'complete' | 'partial' | 'irrelevant' | 'conflict';

export function checkChain(chainId: string, selectedEvidence: string[]): ChainCheckResult {
  const chain = chains.find((item) => item.id === chainId);
  if (!chain || selectedEvidence.length === 0) return 'irrelevant';

  const requiredHits = chain.requiredEvidence.filter((id) => selectedEvidence.includes(id)).length;
  const optionalHits = (chain.optionalEvidence ?? []).filter((id) => selectedEvidence.includes(id)).length;
  const relevantIds = new Set([...chain.requiredEvidence, ...(chain.optionalEvidence ?? [])]);
  const irrelevantCount = selectedEvidence.filter((id) => !relevantIds.has(id)).length;

  if (requiredHits === chain.requiredEvidence.length) return 'complete';
  if (irrelevantCount >= Math.max(2, selectedEvidence.length - 1)) return 'conflict';
  if (requiredHits > 0 || optionalHits > 0) return 'partial';
  return 'irrelevant';
}

export function chainProgress(chainId: string, selectedEvidence: string[]) {
  const chain = chains.find((item) => item.id === chainId);
  if (!chain) return { hits: 0, total: 0 };
  return {
    hits: chain.requiredEvidence.filter((id) => selectedEvidence.includes(id)).length,
    total: chain.requiredEvidence.length
  };
}
