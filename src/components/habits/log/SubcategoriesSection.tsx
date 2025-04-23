import LogStyles from '@/styles/LogStyles';
import { TouchableOpacity, Text, View, ScrollView } from 'react-native';

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
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Subcategory</Text>
            
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
                    selectedSubcategory === subcategory.id && styles.subcategoryItemSelected,
                  ]}
                  onPress={() => handleSelectSubcategory(subcategory.id)}
                >
                  <Text
                    style={[
                      styles.subcategoryText,
                      { color: selectedSubcategory === subcategory.id ? '#FFFFFF' : '#333333' },
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
