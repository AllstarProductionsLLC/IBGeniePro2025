import { personalities } from './personalities';

describe('Personalities', () => {
    it('should have entries for all roles', () => {
        expect(personalities).toHaveProperty('student');
        expect(personalities).toHaveProperty('teacher');
    });

    it('should have entries for all programs under student', () => {
        expect(personalities.student).toHaveProperty('pyp');
        expect(personalities.student).toHaveProperty('myp');
        expect(personalities.student).toHaveProperty('dp');
    });

    it('should have welcome messages for all combinations', () => {
        expect(personalities.student.pyp.welcomeMessage).toBeDefined();
        expect(personalities.teacher.dp.welcomeMessage).toBeDefined();
    });
});
