module.exports = {
  root: true,
  extends: ['expo'],
  ignorePatterns: ['dist/', 'node_modules/', 'android/', 'ios/', '.expo/'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  overrides: [
    {
      files: ['supabase/functions/**/*.{ts,tsx}'],
      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
};
