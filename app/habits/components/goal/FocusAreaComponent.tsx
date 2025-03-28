// For Focus Areas
import React from 'react';
import { View } from 'react-native';
import SelectableItem from '../../../components/SelectableItem';
import goalStyles from '../../styles/Goal.styles';

const FocusAreasComponent = ({
  focusAreas,
  selectedFocusAreas,
  toggleFocusArea,
}: {
  focusAreas: any[];
  selectedFocusAreas: any[];
  toggleFocusArea: (id: string) => void;
}) => {
  return (
    <View style={goalStyles.optionsContainer}>
      {focusAreas.map((area) => (
        <SelectableItem
          key={area.id}
          item={area}
          isSelected={selectedFocusAreas.includes(area.id)}
          onPress={(id) => toggleFocusArea(id.toString())}
          containerStyle={goalStyles.optionItem}
          selectedContainerStyle={goalStyles.optionItemSelected}
          iconContainerStyle={goalStyles.optionIcon}
          selectedIconContainerStyle={goalStyles.optionIconSelected}
          textStyle={goalStyles.optionText}
          selectedTextStyle={{ color: '#FFFFFF' }}
        />
      ))}
    </View>
  );
};

export default FocusAreasComponent;
