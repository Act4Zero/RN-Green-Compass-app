import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import LogStyles from '@/styles/LogStyles';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

const styles = LogStyles;

export function CategoriesSection({
    categories,
    selectedCategory,
    handleSelectCategory
}: {
    categories: { id: string; name: string; icon: string }[];
    selectedCategory: string;
    handleSelectCategory: (id: string) => void;
}) {
    const { theme } = useAppTheme();
    const { t } = useAppLocale();
    return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('1. Choose a category', '1. Избери категория')}</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  selectedCategory === category.id && styles.categoryItemSelected,
                  selectedCategory === category.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
                onPress={() => handleSelectCategory(category.id)}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={selectedCategory === category.id ? theme.colors.primary : theme.colors.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? theme.colors.textInverse : theme.colors.text },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
    )
}

export default CategoriesSection;
