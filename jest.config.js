module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|expo-.*|@expo|@expo/.*|@supabase|zustand|date-fns|react-native-.*|@react-native-async-storage)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/setup.ts', '<rootDir>/__tests__/__mocks__/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
