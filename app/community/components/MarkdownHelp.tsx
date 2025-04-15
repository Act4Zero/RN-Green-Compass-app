import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function MarkdownHelp() {
  return (
    <View style={styles.markdownHelpContainer}>
      <Text style={styles.markdownHelpTitle}>Markdown Formatting</Text>
      <View style={styles.markdownHelpItem}>
        <Text style={styles.markdownHelpCode}>**bold**</Text>
        <Text style={styles.markdownHelpDescription}>Bold text</Text>
      </View>
      <View style={styles.markdownHelpItem}>
        <Text style={styles.markdownHelpCode}>*italic*</Text>
        <Text style={styles.markdownHelpDescription}>Italic text</Text>
      </View>
      <View style={styles.markdownHelpItem}>
        <Text style={styles.markdownHelpCode}>- item</Text>
        <Text style={styles.markdownHelpDescription}>Bullet list</Text>
      </View>
      <View style={styles.markdownHelpItem}>
        <Text style={styles.markdownHelpCode}>[link](url)</Text>
        <Text style={styles.markdownHelpDescription}>Hyperlink</Text>
      </View>
      <View style={styles.markdownHelpItem}>
        <Text style={styles.markdownHelpCode}>![alt text](image_url)</Text>
        <Text style={styles.markdownHelpDescription}>Image</Text>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  markdownHelpContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  markdownHelpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  markdownHelpItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  markdownHelpCode: {
    fontFamily: 'monospace',
    backgroundColor: '#E0E0E0',
    padding: 4,
    borderRadius: 4,
    marginRight: 12,
    fontSize: 14,
    minWidth: 100,
  },
  markdownHelpDescription: {
    fontSize: 14,
    color: '#616161',
  },
});

export default MarkdownHelp;
