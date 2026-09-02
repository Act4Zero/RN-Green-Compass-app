import React from 'react';
import { View, Text, SectionList } from 'react-native';
import { PointEvent, PointSource } from '@/types/community/points';
import PointsHistoryItem from './PointsHistoryItem';
import PointsHistoryFilter from './PointsHistoryFilter';
import pointsStyles from '@/styles/community/Points.styles';
import { useAppLocale } from '@/context/AppLocaleContext';

interface PointsHistoryProps {
  historyByDate: Record<string, PointEvent[]>;
  availableSources: PointSource[];
  activeFilters: PointSource[];
  onToggleFilter: (source: PointSource) => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

function PointsHistory({
  historyByDate,
  availableSources,
  activeFilters,
  onToggleFilter,
  onClearFilters,
  isLoading
}: PointsHistoryProps) {
  const { t } = useAppLocale();
  // Convert the grouped history object to a format that SectionList can use
  const sectionData = Object.entries(historyByDate).map(([date, events]) => ({
    title: date,
    data: events
  })).sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime());

  return (
    <View style={pointsStyles.historyContainer}>
      <Text style={pointsStyles.sectionTitle}>{t('Points History', 'История на точките')}</Text>
      
      <PointsHistoryFilter
        activeFilters={activeFilters}
        availableSources={availableSources}
        onToggleFilter={onToggleFilter}
        onClearFilters={onClearFilters}
      />
      
      {sectionData.length > 0 ? (
        <SectionList
          sections={sectionData}
          keyExtractor={(item) => `${item.id}`}
          renderItem={({ item }) => <PointsHistoryItem pointEvent={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={pointsStyles.historyDate}>{title}</Text>
          )}
          style={pointsStyles.historyList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={pointsStyles.emptyState}>
          <Text style={pointsStyles.emptyStateText}>
            {isLoading 
              ? t('Loading your points history...', 'Зареждане на историята на точките...')
              : t('No points history found. Start earning points by logging in daily and tracking sustainable habits!', 'Няма история на точки. Печелете точки с ежедневно влизане и проследяване на устойчиви навици!')}
          </Text>
        </View>
      )}
    </View>
  );
}

export default PointsHistory;
