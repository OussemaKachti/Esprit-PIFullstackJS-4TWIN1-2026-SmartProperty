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
        create: jest.fn(),
    },
    Sale: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
    Property: {
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
    },
    User: {
        findById: jest.fn(),
    },
    RentPayment: {
        create: jest.fn(),
    },
}));

jest.mock('../../utils/apiResponse', () => ({
    apiResponse: jest.fn((success, message, data) => ({
        success,
        message,
        data,
    })),
}));

const {
    Lease,
    Property,
    User,
    RentPayment,
} = require('../../models');

const easyWalletController = require('../easyWalletController');

const buildRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

let originalFetch;

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    originalFetch = global.fetch;
});

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
});

/* ---------------- INITIATE PAYMENT ---------------- */

describe('easyWalletController.initiatePayment', () => {

    test('returns 400 when missing ids', async () => {
        const req = {
            body: { amount: 100 },
            user: { _id: 'u1', walletNumber: 'TN1' },
        };

        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('handles network error', async () => {
        Property.findById.mockResolvedValue({
            _id: 'p1',
            createdBy: 'o1',
        });

        Lease.findOne.mockResolvedValue(null);

        Lease.create.mockResolvedValue({
            _id: 'l1',
            status: 'PENDING',
            save: jest.fn().mockRejectedValue(new Error('Network error')),
        });

        User.findById.mockResolvedValue({
            _id: 'o1',
            walletNumber: 'OW1',
        });

        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        const req = {
            body: {
                propertyId: 'p1',
                amount: 500,
                paymentType: 'LEASE',
            },
            user: { _id: 'u1', walletNumber: 'TN1' },
        };

        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('LEASE success flow', async () => {
        Property.findById.mockResolvedValue({
            _id: 'p1',
            createdBy: 'o1',
        });

        Property.findByIdAndUpdate.mockResolvedValue({});

        Lease.findOne.mockResolvedValue(null);

        const fakeLease = {
            _id: 'l1',
            status: 'PENDING',
            save: jest.fn().mockResolvedValue(true),
        };

        Lease.create.mockResolvedValue(fakeLease);

        User.findById.mockResolvedValue({
            _id: 'o1',
            walletNumber: 'OW1',
        });

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ transactionId: 'tx1' }),
        });

        const req = {
            body: {
                propertyId: 'p1',
                amount: 500,
                paymentType: 'LEASE',
            },
            user: { _id: 'u1', walletNumber: 'TN1' },
        };

        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(fakeLease.save).toHaveBeenCalled();
        expect(RentPayment.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});


describe('easyWalletController.getBalance', () => {

    test('success', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ balance: 100 }),
        });

        const req = {
            user: { walletNumber: 'TN1' },
        };

        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.getBalance(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('fetch failure', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('API down'));

        const req = {
            user: { walletNumber: 'TN1' },
        };

        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.getBalance(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});