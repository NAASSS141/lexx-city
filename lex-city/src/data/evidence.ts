import type { Evidence } from '../types';

export const evidenceList: Evidence[] = [
  {
    id: 'evidence_chen_statement',
    name: '陈墨口供',
    description: '陈墨称自己没有伤害故意，只是想拿回被抢的手机。',
    source: '会见室',
    credibility: 68,
    tags: ['主观故意', '冲突起因'],
    isKey: true,
    icon: '📝'
  },
  {
    id: 'evidence_delivery_record',
    name: '派单记录截图',
    description: '显示陈墨在事故前一小时内连续接到多个订单。',
    source: '陈墨手机备份',
    credibility: 82,
    tags: ['平台压力', '行为背景'],
    isKey: true,
    icon: '📱'
  },
  {
    id: 'evidence_hospital_sms',
    name: '医院缴费短信',
    description: '陈墨母亲正在医院等待缴费，解释其当天异常焦急。',
    source: '陈墨手机短信',
    credibility: 78,
    tags: ['个人困境', '行为背景'],
    isKey: true,
    icon: '🏥'
  },
  {
    id: 'evidence_clip_monitor',
    name: '剪辑版监控',
    description: '只显示陈墨推倒周启明的瞬间，缺少前因。',
    source: '路口监控',
    credibility: 54,
    tags: ['伤害结果', '证据剪辑'],
    isKey: false,
    icon: '📹'
  },
  {
    id: 'evidence_push_monitor',
    name: '推搡动作监控',
    description: '监控片段显示存在推搡动作，但无法单独证明伤害故意。',
    source: '路口监控放大帧',
    credibility: 61,
    tags: ['伤害结果', '主观故意'],
    isKey: true,
    icon: '🧊'
  },
  {
    id: 'evidence_brake_marks',
    name: '刹车痕迹照片',
    description: '斑马线附近有明显急刹痕迹，说明陈墨曾试图避免碰撞。',
    source: '商业区路口',
    credibility: 74,
    tags: ['主观故意', '现场环境'],
    isKey: true,
    icon: '🛞'
  },
  {
    id: 'evidence_rider_stop',
    name: '骑手等待点照片',
    description: '显示该区域长期存在骑手聚集和交通混乱问题。',
    source: '外卖停靠区',
    credibility: 55,
    tags: ['环境背景', '平台压力'],
    isKey: false,
    icon: '🅿️'
  },
  {
    id: 'evidence_ad_slogan',
    name: '平台广告截图',
    description: '商业广告屏显示“准时必达”，作为平台速度叙事的背景证据。',
    source: '商业广告屏',
    credibility: 50,
    tags: ['平台压力', '社会背景'],
    isKey: false,
    icon: '🪧'
  },
  {
    id: 'evidence_phone_grab',
    name: '手机抢夺事实',
    description: '证明周启明曾抢夺陈墨手机，冲突并非陈墨单方挑起。',
    source: '目击者证言',
    credibility: 83,
    tags: ['冲突起因', '主观故意'],
    isKey: true,
    icon: '✋'
  },
  {
    id: 'evidence_sulan_partial_testimony',
    name: '苏岚简略证词',
    description: '苏岚表示争执发生在推搡之前，但她仍不愿出庭。',
    source: '便利店询问',
    credibility: 64,
    tags: ['冲突起因'],
    isKey: false,
    icon: '💬'
  },
  {
    id: 'evidence_sulan_full_testimony',
    name: '苏岚完整证词',
    description: '苏岚愿意说明周启明先抢夺手机，并同意必要时出庭。',
    source: '便利店询问',
    credibility: 90,
    tags: ['冲突起因', '证人证言'],
    isKey: true,
    icon: '🗣️'
  },
  {
    id: 'evidence_full_video',
    name: '完整现场视频',
    description: '便利店备用监控拍下了冲突完整经过，包括抢夺手机和推搡前因。',
    source: '便利店备用监控',
    credibility: 95,
    tags: ['冲突起因', '主观故意', '证据完整性'],
    isKey: true,
    icon: '🎞️'
  },
  {
    id: 'evidence_penalty_rule',
    name: '平台超时处罚规则',
    description: '显示超时会带来罚款、扣分甚至封号风险。',
    source: '平台规则页面',
    credibility: 84,
    tags: ['平台压力', '行为背景'],
    isKey: true,
    icon: '⏱️'
  },
  {
    id: 'evidence_urge_notice',
    name: '系统催单通知',
    description: '事故当天系统多次推送催单提醒，强化陈墨的时间压力。',
    source: '骑手端通知记录',
    credibility: 86,
    tags: ['平台压力', '行为背景'],
    isKey: true,
    icon: '🔔'
  },
  {
    id: 'evidence_internal_chat',
    name: '内部运营群公告截图',
    description: '平台明知恶劣天气和高峰拥堵，仍要求维持高准时率。',
    source: '平台办公室交涉',
    credibility: 88,
    tags: ['平台压力', '社会治理'],
    isKey: true,
    icon: '🧾'
  }
];

export const getEvidence = (id: string) => evidenceList.find((item) => item.id === id);
