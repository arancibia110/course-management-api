describe('API Basic Tests', () => {
  describe('Mathematics', () => {
    test('suma básica', () => {
      expect(1 + 1).toBe(2);
      expect(5 + 10).toBe(15);
    });

    test('multiplicación', () => {
      expect(3 * 4).toBe(12);
    });
  });

  describe('Strings', () => {
    test('concatenación', () => {
      expect('Hello' + ' ' + 'World').toBe('Hello World');
    });

    test('includes', () => {
      expect('Course Management API').toContain('Course');
    });
  });

  describe('Arrays', () => {
    test('array length', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(arr).toHaveLength(5);
    });

    test('array includes', () => {
      const roles = ['ADMIN', 'STUDENT'];
      expect(roles).toContain('STUDENT');
    });
  });

  describe('Objects', () => {
    test('object properties', () => {
      const user = {
        email: 'test@example.com',
        role: 'STUDENT',
        isActive: true
      };
      
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('STUDENT');
      expect(user.isActive).toBe(true);
    });
  });

  describe('Environment Variables', () => {
    test('NODE_ENV exists', () => {
      expect(process.env.NODE_ENV).toBeDefined();
    });
  });
});
