jest.mock('mongoose', () => ({
    Types: {
        ObjectId: {
            isValid: jest.fn(() => true),
        },
    },
}));

jest.mock('../../models', () => ({
    Lease: {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
    },
    Sale: {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
    },
    Property: {
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
    },
    User: {
        findById: jest.fn(),
        findOne: jest.fn(),
    },
    RentPayment: {
        create: jest.fn(),
    },
}));

jest.mock('../../utils/apiResponse', () => ({
    apiResponse: jest.fn((success, message, data) => ({ success, message, data })),
}));

const { Lease, Sale, Property, User, RentPayment } = require('../../models');
const easyWalletController = require('../easyWalletController');

const buildRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

beforeEach(() => {
    jest.resetAllMocks();

    global.fetch = jest.fn(); // safer than undefined
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('easyWalletController.initiatePayment', () => {

    test('returns 400 when both id and propertyId are missing', async () => {
        const req = {
            body: { amount: 100 },
            user: { _id: 'u1', walletNumber: 'w1' },
        };

        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('handles fetch network error', async () => {
        Property.findById.mockResolvedValue({ _id: 'p1', createdBy: 'owner1' });
        Lease.findOne.mockResolvedValue(null);
        Lease.create.mockResolvedValue({ _id: 'l1', status: 'PENDING', propertyId: 'p1' });

        User.findById.mockResolvedValue({
            _id: 'owner1',
            walletNumber: 'OW-1',
            equals: jest.fn(() => false),
        });

        global.fetch.mockRejectedValue(new Error('Network error'));

        const req = {
            body: { propertyId: 'p1', amount: 500, paymentType: 'LEASE' },
            user: { _id: 'u1', walletNumber: 'TN-1' },
        };

        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(next).toHaveBeenCalled(); // important
    });

    test('LEASE success flow', async () => {
        Property.findById.mockResolvedValue({ _id: 'p1', createdBy: 'owner1' });
        Property.findByIdAndUpdate.mockResolvedValue({});

        const fakeLease = {
            _id: 'l1',
            status: 'PENDING',
            propertyId: 'p1',
            save: jest.fn(),
        };

        Lease.findOne.mockResolvedValue(null);
        Lease.create.mockResolvedValue(fakeLease);

        User.findById.mockResolvedValue({
            _id: 'owner1',
            walletNumber: 'OW-100',
            equals: jest.fn(() => false),
        });

        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ transactionId: 'tx1' }),
        });

        const req = {
            body: { propertyId: 'p1', amount: 500, paymentType: 'LEASE' },
            user: { _id: 'u1', walletNumber: 'TN-200' },
        };

        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(fakeLease.save).toHaveBeenCalled();
        expect(RentPayment.create).toHaveBeenCalled();
        expect(Property.findByIdAndUpdate).toHaveBeenCalledWith('p1', { status: 'RENTED' });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe('easyWalletController.getBalance', () => {

    test('success', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                balance: 1000,
                currency: 'TND',
            }),
        });

        const req = { user: { walletNumber: 'TN-1' } };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.getBalance(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('fetch fails', async () => {
        global.fetch.mockRejectedValue(new Error('API down'));

        const req = { user: { walletNumber: 'TN-1' } };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.getBalance(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});