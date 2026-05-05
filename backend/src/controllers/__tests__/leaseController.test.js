jest.mock('../../models', () => ({
  Lease: {
    find: jest.fn(),
  },
  LeaseStatus: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  Property: {
    find: jest.fn(),
  },
  User: {},
  Notification: {},
  NotificationType: {},
  Transaction: {},
  TransactionStatus: {},
  TransactionType: {},
}));

jest.mock('../../utils/apiResponse', () => ({
  apiResponse: jest.fn((success, message, data) => ({ success, message, data })),
}));

jest.mock('../../services/email.service', () => ({}));
jest.mock('../../services/pusher.service', () => ({
  triggerOwnerNotification: jest.fn(),
}));
jest.mock('../../services/transaction.service', () => ({
  addTimelineEntry: jest.fn(),
  recalcPropertyStatus: jest.fn(),
  hasOverlappingConfirmedRent: jest.fn(),
}));

const { Lease, Property } = require('../../models');
const leaseController = require('../leaseController');

const buildRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const chainableLeaseFind = (result) => ({
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(result),
});

describe('leaseController.getLeaseCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns tenant-scoped events with tenant-friendly title', async () => {
    const fakeLeases = [
      {
        _id: 'l1',
        status: 'CONFIRMED',
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-05-10T00:00:00.000Z',
        rentAmount: 1200,
        charges: 50,
        tenantId: {
          _id: 'u-tenant',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@tenant.com',
        },
        propertyId: {
          _id: 'p1',
          title: 'Sea View Apartment',
          reference: 'PROP-001',
          city: 'Tunis',
          listingType: 'FOR_RENT',
        },
      },
    ];

    Lease.find.mockReturnValue(chainableLeaseFind(fakeLeases));

    const req = {
      user: { _id: 'u-tenant', role: 'TENANT' },
      query: {
        start: '2026-05-01T00:00:00.000Z',
        end: '2026-05-31T23:59:59.000Z',
      },
    };
    const res = buildRes();
    const next = jest.fn();

    await leaseController.getLeaseCalendar(req, res, next);

    expect(Lease.find).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'u-tenant',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.data.roleView).toBe('TENANT');
    expect(payload.data.events[0].title).toBe('Sea View Apartment');
    expect(payload.data.metrics.totalLeases).toBe(1);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns empty calendar for agency when no owned properties', async () => {
    Property.find.mockReturnValue({
      distinct: jest.fn().mockResolvedValue([]),
    });

    const req = {
      user: { _id: 'u-agency', role: 'AGENCY' },
      query: {},
    };
    const res = buildRes();
    const next = jest.fn();

    await leaseController.getLeaseCalendar(req, res, next);

    expect(Property.find).toHaveBeenCalledWith({ createdBy: 'u-agency' });
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.data.roleView).toBe('AGENCY');
    expect(payload.data.events).toEqual([]);
    expect(payload.data.metrics.totalLeases).toBe(0);
    expect(next).not.toHaveBeenCalled();
  });
});

