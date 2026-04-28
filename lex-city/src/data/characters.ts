import type { Character } from '../types';

export const characters: Character[] = [
  {
    id: 'cui_zhiwei',
    name: '崔知微',
    alias: '崔律',
    role: '法律援助中心见习律师',
    emoji: '⚖️',
    traits: ['冷静', '敏锐', '职业克制'],
    description: '玩家操控角色。刚通过法考，参与“城市公共案件计划”，在第一案中面对证据、情理与制度压力的交叉审判。',
    quote: '我不能替你编一个无辜的故事，但我可以帮你把被忽略的事实说完整。'
  },
  {
    id: 'shen_yan',
    name: '沈砚',
    alias: '沈律',
    role: '资深律师，崔律的导师',
    emoji: '📚',
    traits: ['克制', '犀利', '可靠'],
    description: '负责新手引导、法律解释和结案复盘。说话像一把被磨得很薄的裁纸刀。',
    quote: '崔律，别急着相信任何人。委托人说的，也只是事实的一种版本。'
  },
  {
    id: 'chen_mo',
    name: '陈墨',
    alias: '陈墨',
    role: '外卖骑手，案件当事人',
    emoji: '🛵',
    traits: ['沉默', '防御', '疲惫'],
    description: '涉嫌故意伤害。母亲住院，当天被平台连续派单，手机里藏着关键视频。',
    quote: '崔律，我真的没想伤他，我只是想拿回手机。'
  },
  {
    id: 'zhou_qiming',
    name: '周启明',
    alias: '周启明',
    role: '伤者，广告公司主管',
    emoji: '💼',
    traits: ['强势', '体面', '愤怒'],
    description: '自称只是要求骑手道歉，但他隐瞒了曾抢夺陈墨手机的事实。',
    quote: '他撞了人还不道歉，我只是想让他停下来。'
  },
  {
    id: 'su_lan',
    name: '苏岚',
    alias: '苏岚',
    role: '便利店店员，目击者',
    emoji: '🏪',
    traits: ['善良', '谨慎', '怕惹事'],
    description: '看到了冲突的完整经过。玩家的沟通方式决定她愿意说出多少。',
    quote: '崔律……如果我说实话，会不会惹麻烦？'
  },
  {
    id: 'xu_zhao',
    name: '许照',
    alias: '许经理',
    role: '平台城市运营经理',
    emoji: '📊',
    traits: ['圆滑', '职业', '擅长话术'],
    description: '代表平台回应案件，试图把算法压力包装成骑手的自主选择。',
    quote: '我们只是技术服务平台，骑手拥有完全自主选择权。'
  },
  {
    id: 'gu_qingci',
    name: '顾清辞',
    alias: '顾检',
    role: '检察官',
    emoji: '🏛️',
    traits: ['冷静', '严密', '锋利'],
    description: '庭审对手，不是反派，而是公共秩序的代表。',
    quote: '崔律，你的辩护很有同情心。但法庭需要的不是同情，是证据。'
  }
];

export const getCharacter = (id: string) => characters.find((item) => item.id === id);
