// __tests__/__mocks__/@google/genai.js
// Google GenAI 모듈 mock
// Jest 테스트에서 Google GenAI API를 모킹하기 위한 파일

module.exports = {
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
    },
  })),
};
