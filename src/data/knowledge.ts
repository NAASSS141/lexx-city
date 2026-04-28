import type { KnowledgeCard } from '../types';

export const knowledgeCards: KnowledgeCard[] = [
  {
    id: 'intent_injury',
    title: '故意伤害与主观故意',
    content: '故意伤害并不只看伤害结果，还要判断行为人是否具有伤害他人的主观故意。若行为人的主要目的并非伤害，而是夺回财物、制止侵害或避免危险，则需要结合行为强度、现场环境、损害后果等因素综合判断。'
  },
  {
    id: 'complete_evidence',
    title: '证据为什么要完整？',
    content: '被剪辑的证据可能呈现真实片段，却制造错误结论。法律判断不仅关注某个瞬间发生了什么，也关注这个瞬间为什么发生。'
  },
  {
    id: 'platform_rules',
    title: '平台规则能不能影响个案判断？',
    content: '平台规则通常不能直接替个人行为免责，但可能构成案件背景，影响对主观恶性、责任程度和社会治理问题的判断。'
  }
];
