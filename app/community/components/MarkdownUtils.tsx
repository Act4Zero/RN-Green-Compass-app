import React from 'react';
import { View, TouchableOpacity, Image, Linking } from 'react-native';
import { RenderRules } from 'react-native-markdown-display';

// Custom renderer for Markdown images to make them clickable
export const renderImage = (node: any, children: React.ReactNode, parent: any, styles: any) => {
  const { src } = node.attributes;
  
  return (
    <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
      <TouchableOpacity 
        key={node.key} 
        onPress={() => Linking.openURL(src)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: src }} 
          style={[styles.image]} 
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

// Custom rules for Markdown rendering
export const rules: RenderRules = {
  image: renderImage,
};
