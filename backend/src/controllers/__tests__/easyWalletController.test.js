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

/** Build a chainable populate mock that resolves to a value */
const withPopulate = (value) => ({
    populate: jest.fn().mockResolvedValue(value),
});

beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = undefined;
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

    test('returns 400 when paymentType is invalid', async () => {
        const req = {
            body: { id: 'l1', amount: 100, paymentType: 'CRYPTO' },
            user: { _id: 'u1', walletNumber: 'w1' },
        };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 400 when tenant has no wallet', async () => {
        const fakeProperty = { _id: 'p1', createdBy: 'owner1' };
        Property.findById.mockResolvedValue(fakeProperty);
        Lease.findOne.mockResolvedValue(null);
        Lease.create.mockResolvedValue({ _id: 'l1', status: 'PENDING', propertyId: 'p1' });

        const fakeOwner = { _id: 'owner1', walletNumber: 'ow1', equals: jest.fn(() => false) };
        User.findById.mockResolvedValue(fakeOwner);

        const req = {
            body: { propertyId: 'p1', amount: 500, paymentType: 'LEASE' },
            user: { _id: 'u1', walletNumber: null }, // No tenant wallet
        };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 400 when sender and recipient wallets are the same', async () => {
        const fakeProperty = { _id: 'p1', createdBy: 'owner1' };
        Property.findById.mockResolvedValue(fakeProperty);
        Lease.findOne.mockResolvedValue(null);
        Lease.create.mockResolvedValue({ _id: 'l1', status: 'PENDING', propertyId: 'p1' });

        const fakeOwner = { _id: 'owner1', walletNumber: 'SAME_WALLET', equals: jest.fn(() => false) };
        User.findById.mockResolvedValue(fakeOwner);

        const req = {
            body: { propertyId: 'p1', amount: 500, paymentType: 'LEASE' },
            user: { _id: 'u1', walletNumber: 'SAME_WALLET' },
        };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('LEASE: returns 200, confirms lease, creates RentPayment, sets property RENTED', async () => {
        const fakeProperty = { _id: 'p1', createdBy: 'owner1' };
        Property.findById.mockResolvedValue(fakeProperty);
        Property.findByIdAndUpdate.mockResolvedValue({});

        const fakeLease = {
            _id: 'l1',
            status: 'PENDING',
            propertyId: 'p1',
            save: jest.fn().mockResolvedValue(true),
        };
        Lease.findOne.mockResolvedValue(null);
        Lease.create.mockResolvedValue(fakeLease);
        RentPayment.create.mockResolvedValue({});

        const fakeOwner = { _id: 'owner1', walletNumber: 'OW-100', firstName: 'Salim', equals: jest.fn(() => false) };
        User.findById.mockResolvedValue(fakeOwner);

        global.fetch = jest.fn().mockResolvedValue({
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

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(fakeLease.save).toHaveBeenCalledTimes(1);
        expect(RentPayment.create).toHaveBeenCalledTimes(1);
        expect(Property.findByIdAndUpdate).toHaveBeenCalledWith('p1', { status: 'RENTED' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(next).not.toHaveBeenCalled();
    });

    test('SALE: returns 200, completes sale, sets property SOLD', async () => {
        const fakeProperty = { _id: 'p1', createdBy: 'owner1' };
        Property.findById.mockResolvedValue(fakeProperty);
        Property.findByIdAndUpdate.mockResolvedValue({});

        const fakeSale = {
            _id: 's1',
            status: 'PENDING',
            propertyId: 'p1',
            save: jest.fn().mockResolvedValue(true),
        };
        Sale.findOne.mockResolvedValue(null);
        Sale.create.mockResolvedValue(fakeSale);

        const fakeOwner = { _id: 'owner1', walletNumber: 'OW-100', firstName: 'Salim', equals: jest.fn(() => false) };
        User.findById.mockResolvedValue(fakeOwner);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ transactionId: 'tx2' }),
        });

        const req = {
            body: { propertyId: 'p1', amount: 75000, paymentType: 'SALE' },
            user: { _id: 'u1', walletNumber: 'TN-200' },
        };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(fakeSale.save).toHaveBeenCalledTimes(1);
        expect(Property.findByIdAndUpdate).toHaveBeenCalledWith('p1', { status: 'SOLD' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns EasyWallet error when API payment fails', async () => {
        const fakeProperty = { _id: 'p1', createdBy: 'owner1' };
        Property.findById.mockResolvedValue(fakeProperty);
        Lease.findOne.mockResolvedValue(null);
        Lease.create.mockResolvedValue({ _id: 'l1', status: 'PENDING', propertyId: 'p1' });

        const fakeOwner = { _id: 'owner1', walletNumber: 'OW-100', equals: jest.fn(() => false) };
        User.findById.mockResolvedValue(fakeOwner);

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 402,
            json: async () => ({ message: 'Insufficient funds' }),
        });

        const req = {
            body: { propertyId: 'p1', amount: 500, paymentType: 'LEASE' },
            user: { _id: 'u1', walletNumber: 'TN-200' },
        };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.initiatePayment(req, res, next);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(next).not.toHaveBeenCalled();
    });
});


describe('easyWalletController.getPaymentStatus', () => {
    test('returns 200 with wallet status info for LEASE type', async () => {
        const fakeRecord = {
            _id: 'l1',
            propertyId: { _id: 'p1', createdBy: 'owner1' },
            rentAmount: 600,
        };
        // findOne returns a query-like chain (populate then resolves), not a bare value
        Lease.findOne.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
        });
        Lease.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeRecord) });

        const fakeOwner = { _id: 'owner1', walletNumber: 'OW-100', firstName: 'Selim', lastName: 'Ben Ali', equals: jest.fn(() => false) };
        User.findById.mockResolvedValue(fakeOwner);

        const req = {
            params: { id: 'l1' },
            query: { paymentType: 'LEASE' },
            user: { _id: 'u1', walletNumber: 'TN-200' },
        };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.getPaymentStatus(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(next).not.toHaveBeenCalled();
    });
});


describe('easyWalletController.createWalletAndLink', () => {
    test('returns 404 when user is not found', async () => {
        User.findById.mockResolvedValue(null);

        const req = { user: { _id: 'ghost' } };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.createWalletAndLink(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 400 when user already has a wallet', async () => {
        User.findById.mockResolvedValue({ _id: 'u1', walletNumber: 'TN-EXISTING' });

        const req = { user: { _id: 'u1' } };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.createWalletAndLink(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 201 with new wallet number on success', async () => {
        const fakeUser = {
            _id: 'u1',
            walletNumber: null,
            email: 'user@test.com',
            login: 'userLogin',
            lastName: 'Smith',
            save: jest.fn().mockResolvedValue(true),
        };
        User.findById.mockResolvedValue(fakeUser);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 201,
            json: async () => ({ wallet: { walletNumber: 'TN-NEW-999' } }),
        });

        const req = { user: { _id: 'u1' } };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.createWalletAndLink(req, res, next);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(fakeUser.save).toHaveBeenCalledTimes(1);
        expect(fakeUser.walletNumber).toBe('TN-NEW-999');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns error status when EasyWallet API fails', async () => {
        const fakeUser = {
            _id: 'u1',
            walletNumber: null,
            email: 'user@test.com',
            login: 'userLogin',
            lastName: 'Smith',
            save: jest.fn(),
        };
        User.findById.mockResolvedValue(fakeUser);

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 422,
            json: async () => ({ error: 'Email already exists' }),
        });

        const req = { user: { _id: 'u1' } };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.createWalletAndLink(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(fakeUser.save).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });
});


describe('easyWalletController.getBalance', () => {
    test('returns 400 when user has no wallet linked', async () => {
        const req = { user: { _id: 'u1', walletNumber: null } };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.getBalance(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 200 with balance data on success', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ balance: 1250, currency: 'TND', walletNumber: 'TN-200' }),
        });

        const req = { user: { _id: 'u1', walletNumber: 'TN-200' } };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.getBalance(req, res, next);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.json.mock.calls[0][0];
        expect(payload.data.balance).toBe(1250);
        expect(payload.data.currency).toBe('TND');
        expect(next).not.toHaveBeenCalled();
    });

    test('returns EasyWallet error when balance fetch fails', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
            json: async () => ({ message: 'Wallet not found' }),
        });

        const req = { user: { _id: 'u1', walletNumber: 'TN-MISSING' } };
        const res = buildRes();
        const next = jest.fn();

        await easyWalletController.getBalance(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });
});
