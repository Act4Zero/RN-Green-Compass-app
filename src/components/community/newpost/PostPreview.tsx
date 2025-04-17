import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Linking } from 'react-native';
import { markdownStyles } from '@/styles/NewPostStyles';

interface PostPreviewProps {
  content: string | undefined;
  sanitizeMarkdown: (text: string, type: string) => string;
}

function PostPreview({ content, sanitizeMarkdown }: PostPreviewProps) {
  return (
    <View style={styles.previewContainer}>
      <ScrollView style={styles.previewScroll}>
        {content?.trim() ? (
          <Markdown 
            style={markdownStyles}
            // Custom renderers for images and links
            rules={{
              image: (node, children, parent, styles) => {
                return (
                  <Image 
                    key={node.key} 
                    source={{ uri: node.attributes.src }}
                    style={{
                      width: '100%',
                      height: 200,
                      resizeMode: 'contain',
                      marginVertical: 8,
                      borderRadius: 8,
                    }}
                  />
                );
              },
              link: (node, children, parent, styles) => {
                return (
                  <Text 
                    key={node.key}
                    style={markdownStyles.link}
                    onPress={() => {
                      // Handle external URLs properly
                      let url = node.attributes.href;
                      
                      // Handle URLs without protocol
                      if (url && !url.match(/^(https?|mailto|tel):\/\//i)) {
                        // Check if it's likely a web URL (contains domain-like structure)
                        if (url.match(/^[\w-]+(\.[\w-]+)+/)) {
                          url = `https://${url}`;
                        } else if (url.startsWith('/')) {
                          // Relative path within the app - could be handled differently
                          console.log('Relative path detected:', url);
                          return;
                        }
                      }
                      
                      // Open the URL if it seems valid
                      if (url) {
                        console.log('Opening URL:', url);
                        Linking.openURL(url).catch(err => {
                          console.error('An error occurred opening the URL:', err);
                        });
                      }
                    }}
                  >
                    {children}
                  </Text>
                );
              }
            }}
          >
            {sanitizeMarkdown(content || '', 'post')}
          </Markdown>
        ) : (
          <Text style={styles.previewPlaceholder}>
            Your preview will appear here. Start typing in edit mode to see the preview.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    minHeight: 200,
  },
  previewScroll: {
    maxHeight: 400,
  },
  previewPlaceholder: {
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
});

export default PostPreview;
