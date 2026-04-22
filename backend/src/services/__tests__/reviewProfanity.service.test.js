const { moderateReviewComment } = require('../reviewProfanity.service');

describe('reviewProfanity.service', () => {
  test('returns unchanged text when clean', () => {
    const { maskedComment, hadProfanity } = moderateReviewComment('Beautiful apartment, very professional.');
    expect(hadProfanity).toBe(false);
    expect(maskedComment).toBe('Beautiful apartment, very professional.');
  });

  test('masks known profanity and flags', () => {
    const { maskedComment, hadProfanity } = moderateReviewComment('Great view but merde everywhere');
    expect(hadProfanity).toBe(true);
    expect(maskedComment).not.toContain('merde');
    expect(maskedComment).toMatch(/\*+/);
  });
});
