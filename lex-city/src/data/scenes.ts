import type { ChainDefinition } from '../types';

export const mapRegions = [
  {
    id: 'aid_center',
    name: '法律援助中心',
    status: 'open',
    emoji: '⚖️',
    description: '接案、复盘与证据板所在地。',
    chapter: 'intro'
  },
  {
    id: 'meeting_room',
    name: '会见室',
    status: 'open',
    emoji: '🪑',
    description: '陈墨在这里说出第一个版本的真相。',
    chapter: 'interview'
  },
  {
    id: 'business_crossing',
    name: '商业区路口',
    status: 'open',
    emoji: '🚦',
    description: '事故发生地，监控与现场痕迹都藏在霓虹下面。',
    chapter: 'crossing'
  },
  {
    id: 'convenience_store',
    name: '便利店',
    status: 'open',
    emoji: '🏪',
    description: '苏岚所在地点，备用监控也在这里。',
    chapter: 'sulan'
  },
  {
    id: 'platform_office',
    name: '平台办公室',
    status: 'open',
    emoji: '📊',
    description: '算法压力披着漂亮报表的外衣。',
    chapter: 'platform'
  },
  {
    id: 'central_court',
    name: '中心法院',
    status: 'open',
    emoji: '🏛️',
    description: '事实、证据和法律观点将在这里碰撞。',
    chapter: 'trial'
  },
  {
    id: 'cloud_harbor',
    name: '云港区',
    status: 'soon',
    emoji: '🌐',
    description: '数据隐私、网络犯罪、AI 版权。'
  },
  {
    id: 'academy',
    name: '学院区',
    status: 'soon',
    emoji: '🎓',
    description: '校园霸凌、未成年人保护。'
  },
  {
    id: 'old_lane',
    name: '旧巷区',
    status: 'soon',
    emoji: '🏚️',
    description: '刑事案件、邻里纠纷。'
  },
  {
    id: 'finance_street',
    name: '金融街',
    status: 'soon',
    emoji: '🏦',
    description: '合同、投资、公司治理。'
  }
] as const;

export const chains: ChainDefinition[] = [
  {
    id: 'conflict_origin',
    title: '事实链一：冲突起因',
    description: '证明冲突并非陈墨单方挑起，而是由手机抢夺引发升级。',
    requiredEvidence: ['evidence_full_video', 'evidence_sulan_full_testimony', 'evidence_phone_grab'],
    optionalEvidence: ['evidence_sulan_partial_testimony', 'evidence_chen_statement'],
    conclusion: '周启明先抢夺手机，冲突因此升级。'
  },
  {
    id: 'subjective_intent',
    title: '事实链二：主观故意',
    description: '证明陈墨的主要目的可能是夺回手机，而非伤害周启明。',
    requiredEvidence: ['evidence_chen_statement', 'evidence_brake_marks', 'evidence_push_monitor', 'evidence_full_video'],
    optionalEvidence: ['evidence_clip_monitor'],
    conclusion: '陈墨主要目的可能是夺回手机，而非伤害周启明。'
  },
  {
    id: 'platform_pressure',
    title: '事实链三：外部压力',
    description: '证明平台规则与个人困境共同构成案件背景。',
    requiredEvidence: ['evidence_delivery_record', 'evidence_penalty_rule', 'evidence_urge_notice', 'evidence_hospital_sms'],
    optionalEvidence: ['evidence_internal_chat', 'evidence_ad_slogan', 'evidence_rider_stop'],
    conclusion: '平台算法压力和个人困境共同构成案件背景，应影响责任评价与社会治理建议。'
  }
];

export const chapterTitles: Record<string, string> = {
  not_started: '尚未接案',
  intro: '第一章：接案',
  interview: '第二章：会见陈墨',
  crossing: '第三章：现场调查',
  sulan: '第四章：询问苏岚',
  video: '第五章：获取完整视频',
  platform: '第六章：平台交涉',
  evidence: '第七章：证据拼接',
  trial: '第八章：庭审',
  ending: '结案复盘'
};
