import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import LogStyles from '@/styles/LogStyles';
import { Ionicons } from '@expo/vector-icons';

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
    return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Category</Text>
          
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
                  selectedCategory === category.id && styles.categoryItemSelected,
                ]}
                onPress={() => handleSelectCategory(category.id)}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={selectedCategory === category.id ? '#2E7D32' : '#757575'}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? '#FFFFFF' : '#333333' },
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