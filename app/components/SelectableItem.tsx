import React from 'react';
import { TouchableOpacity, View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectableItemProps {
  item: {
    id: string | number;
    icon: string;
    name: string;
  };
  isSelected: boolean;
  onPress: (id: string | number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  selectedContainerStyle?: StyleProp<ViewStyle>;
  iconContainerStyle?: StyleProp<ViewStyle>;
  selectedIconContainerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
}

const SelectableItem: React.FC<SelectableItemProps> = ({
  item,
  isSelected,
  onPress,
  containerStyle,
  selectedContainerStyle,
  iconContainerStyle,
  selectedIconContainerStyle,
  textStyle,
  selectedTextStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        containerStyle,
        isSelected && selectedContainerStyle,
      ]}
      onPress={() => onPress(item.id)}
    >
      <View
        style={[
          iconContainerStyle,
          isSelected && selectedIconContainerStyle,
        ]}
      >
        <Ionicons
          name={item.icon as any}
          size={24}
          color={isSelected ? '#2E7D32' : '#757575'}
        />
      </View>
      <Text
        style={[
          textStyle,
          isSelected ? selectedTextStyle : { color: '#333333' },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

export default SelectableItem;
