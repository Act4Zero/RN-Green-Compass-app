import { historyStyles } from '../../styles/historyStyles';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { defaultCategories } from '../../types/history.types';

const styles = historyStyles;

export function CategoryFilters({
  selectedCategory,
  handleSelectCategory
}: {
  selectedCategory: string;
  handleSelectCategory: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Filter by Category</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {Object.entries(defaultCategories).map(([id, name]) => (
          <TouchableOpacity
            key={id}
            style={[
              styles.filterButton,
              selectedCategory === id && styles.filterButtonActive,
            ]}
            onPress={() => handleSelectCategory(id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === id && styles.filterTextActive,
              ]}
            >
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default CategoryFilters;
