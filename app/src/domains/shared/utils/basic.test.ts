// Simple test to verify Jest setup
describe('Basic Test', () => {
  test('should work', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle strings', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });
});