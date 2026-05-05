jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../../models', () => ({
  User: {
    findById: jest.fn(),
  },
}));

const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const auth = require('../../middleware/auth.middleware');

const buildRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('auth.middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('protect sets req.user and canTransact for approved user', async () => {
    jwt.verify.mockReturnValue({ userId: 'u1' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'u1',
        role: 'AGENCY',
        identityVerificationStatus: 'APPROVED',
      }),
    });

    const req = {
      headers: { authorization: 'Bearer token' },
    };
    const res = buildRes();
    const next = jest.fn();

    await auth.protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.canTransact).toBe(true);
  });

  test('requireApprovedForActions blocks non-approved non-admin users', () => {
    const req = {
      user: {
        _id: 'u2',
        role: 'BUYER',
        identityVerificationStatus: 'PENDING',
      },
    };
    const res = buildRes();
    const next = jest.fn();

    auth.requireApprovedForActions(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.code).toBe('ACCOUNT_NOT_APPROVED_READ_ONLY');
  });

  test('requireApprovedForActions allows admin even if status missing', () => {
    const req = {
      user: {
        _id: 'admin1',
        role: 'ADMIN',
      },
    };
    const res = buildRes();
    const next = jest.fn();

    auth.requireApprovedForActions(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

