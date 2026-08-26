import React from 'react';
import { View } from 'react-native';
import type { EcosystemStage } from '../types';

const LEAF_COLORS = ['#8FC867', '#6FAE5E', '#4C8A50', '#B8E36B'];

function Leaf({ left, top, rotate, color }: { left: number; top: number; rotate: number; color: string }) {
  return (
    <View
      style={{
        position: 'absolute', left, top, width: 38, height: 21, borderRadius: 22,
        backgroundColor: color, transform: [{ rotate: `${rotate}deg` }],
        borderWidth: 1, borderColor: 'rgba(23,76,53,0.16)',
      }}
    />
  );
}

export function PlantIllustration({ stage, size = 180 }: { stage: EcosystemStage; size?: number }) {
  const scale = size / 180;
  const stageIndex = ['seed', 'sprout', 'young', 'leafy', 'mature'].indexOf(stage);
  const leaves = stageIndex >= 4
    ? [[39, 31, -20], [70, 16, 12], [98, 34, 26], [52, 55, 20], [87, 58, -18], [28, 70, -30], [112, 72, 30], [66, 81, 12]]
    : stageIndex === 3
      ? [[49, 57, -24], [83, 43, 22], [36, 83, -28], [93, 81, 28], [66, 72, 8]]
      : stageIndex === 2
        ? [[48, 84, -28], [84, 76, 28], [65, 60, 8]]
        : stageIndex === 1
          ? [[52, 107, -25], [82, 100, 25]]
          : [];

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, transform: [{ scale }] }}>
      <View style={{ position: 'absolute', left: 25, right: 25, bottom: 16, height: 22, borderRadius: 50, backgroundColor: '#6B8E52', opacity: 0.35 }} />
      {stageIndex === 0 ? (
        <>
          <View style={{ position: 'absolute', left: 73, bottom: 31, width: 36, height: 22, borderRadius: 18, backgroundColor: '#825C35', transform: [{ rotate: '-12deg' }], borderWidth: 2, borderColor: '#68472B' }} />
          <View style={{ position: 'absolute', left: 89, bottom: 47, width: 2, height: 12, backgroundColor: '#B8E36B', transform: [{ rotate: '20deg' }] }} />
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', left: 86, bottom: 35, width: stageIndex >= 3 ? 11 : 7, height: stageIndex >= 4 ? 108 : stageIndex >= 3 ? 84 : stageIndex >= 2 ? 65 : 43, borderRadius: 8, backgroundColor: stageIndex >= 3 ? '#6D5637' : '#3E7E49' }} />
          {stageIndex >= 2 ? <View style={{ position: 'absolute', left: 63, top: stageIndex >= 3 ? 76 : 91, width: 38, height: 6, borderRadius: 6, backgroundColor: '#6D5637', transform: [{ rotate: '-35deg' }] }} /> : null}
          {stageIndex >= 2 ? <View style={{ position: 'absolute', left: 85, top: stageIndex >= 3 ? 68 : 85, width: 38, height: 6, borderRadius: 6, backgroundColor: '#6D5637', transform: [{ rotate: '36deg' }] }} /> : null}
          {leaves.map(([left, top, rotate], index) => <Leaf key={`${left}-${top}`} left={left} top={top} rotate={rotate} color={LEAF_COLORS[index % LEAF_COLORS.length]} />)}
        </>
      )}
    </View>
  );
}
