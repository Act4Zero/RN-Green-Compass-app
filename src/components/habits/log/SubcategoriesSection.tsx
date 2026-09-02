import LogStyles from '@/styles/LogStyles';
import { TouchableOpacity, Text, View, ScrollView } from 'react-native';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

const styles = LogStyles;

export function SubcategoriesSection({
    subcategories,
    selectedSubcategory,
    handleSelectSubcategory
}: {
    subcategories: { id: string; name: string }[];
    selectedSubcategory: string;
    handleSelectSubcategory: (id: string) => void;
}) {
    const { theme } = useAppTheme();
    const { t } = useAppLocale();
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('2. Refine your focus', '2. Уточни избора си')}</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={[styles.subcategoriesContainer, { width: subcategories.length * 120 }]}
              decelerationRate="fast"
            >
              {subcategories.map((subcategory) => (
                <TouchableOpacity
                  key={subcategory.id}
                  style={[
                    styles.subcategoryItem,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    selectedSubcategory === subcategory.id && styles.subcategoryItemSelected,
                    selectedSubcategory === subcategory.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => handleSelectSubcategory(subcategory.id)}
                >
                  <Text
                    style={[
                      styles.subcategoryText,
                      { color: selectedSubcategory === subcategory.id ? theme.colors.textInverse : theme.colors.text },
                    ]}
                    numberOfLines={2}
                  >
                    {subcategory.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
    )
}

export default SubcategoriesSection;
