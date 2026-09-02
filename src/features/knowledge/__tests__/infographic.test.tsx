import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { View } from 'react-native';
import { KnowledgeBlockRenderer } from '../components/KnowledgeBlockRenderer';
import type { KnowledgeBlock, KnowledgeSource } from '../types';

jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('@/context/AppLocaleContext', () => ({ useAppLocale: () => ({ locale: 'en', t: (english: string) => english }) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const source: KnowledgeSource = { id: 'source-1', publisher: 'UNEP', title: 'Reviewed source', url: 'https://www.unep.org/', sourceType: 'intergovernmental', accessedOn: '2026-08-26' };
const block: KnowledgeBlock = { id: 'graphic-1', type: 'infographic', template: 'process', title: 'A four-step process', description: 'A structured summary.', dataPoints: [{ id: 'one', label: 'Observe', value: 1, displayValue: '1', sourceId: source.id }, { id: 'two', label: 'Act', value: 2, displayValue: '2', sourceId: source.id }], takeaways: ['Observe first', 'Act with evidence'], textAlternative: 'First observe. Second act with evidence.' };

describe('Knowledge infographic renderer', () => {
  it('exposes a complete text alternative and visible labels', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<KnowledgeBlockRenderer blocks={[block]} sources={[source]} sourceContentId="item-1" />); });
    const summary = tree.root.findAllByType(View).find((node) => node.props.accessibilityRole === 'summary');
    expect(summary?.props.accessibilityLabel).toBe(block.type === 'infographic' ? block.textAlternative : '');
    expect(tree.root.findByProps({ children: 'A four-step process' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Observe' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Act' })).toBeTruthy();
  });
});
