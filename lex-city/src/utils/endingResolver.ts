import type { GameState } from '../types';

export function resolveEnding(state: GameState): 'S' | 'A' | 'B' | 'C' {
  const hasFullVideo = state.collectedEvidence.includes('evidence_full_video');
  const hasSuLanTestimony = state.collectedEvidence.includes('evidence_sulan_full_testimony');
  const hasPlatformChain = state.completedChains.includes('platform_pressure');
  const hasMotiveChain = state.completedChains.includes('subjective_intent');
  const hasOriginChain = state.completedChains.includes('conflict_origin');
  const selectedB = state.trialStrategies.includes('mitigation');
  const selectedC = state.trialStrategies.includes('social_responsibility');
  const emotionalMistakes = state.flags.emotionalMistakes || 0;

  if (
    hasFullVideo &&
    hasSuLanTestimony &&
    hasPlatformChain &&
    hasMotiveChain &&
    hasOriginChain &&
    selectedB &&
    selectedC &&
    emotionalMistakes < 2
  ) {
    return 'S';
  }

  if (!hasFullVideo || !hasSuLanTestimony) {
    return 'B';
  }

  if (emotionalMistakes >= 2) {
    return 'C';
  }

  if (hasFullVideo && hasMotiveChain && selectedB) {
    return 'A';
  }

  return 'C';
}
