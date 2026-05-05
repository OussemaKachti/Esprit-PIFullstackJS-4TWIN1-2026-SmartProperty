
jest.mock('../../models', () => ({
    Feedback: {
        find: jest.fn(),
        findById: jest.fn(),
        countDocuments: jest.fn(),
        aggregate: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock('../../services/reviewProfanity.service', () => ({
    moderateReviewComment: jest.fn(),
}));

jest.mock('../../services/email.service', () => ({
    sendReviewProfanityWarningEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../utils/apiResponse', () => ({
    apiResponse: jest.fn((success, message, data) => ({ success, message, data })),
}));


const { Feedback } = require('../../models');
const { moderateReviewComment } = require('../../services/reviewProfanity.service');
const { sendReviewProfanityWarningEmail } = require('../../services/email.service');
const feedbackController = require('../feedbackController');


const buildRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

const chainable = (finalValue) => {
    const obj = {};
    obj.limit = jest.fn(() => obj);
    obj.skip = jest.fn(() => obj);
    obj.sort = jest.fn(() => obj);
    obj.populate = jest.fn(() => obj);
    obj.then = (resolve) => Promise.resolve(finalValue).then(resolve);
    // Make the mock awaitable
    const p = Promise.resolve(finalValue);
    obj[Symbol.toStringTag] = 'Promise';
    obj.then = p.then.bind(p);
    obj.catch = p.catch.bind(p);
    return obj;
};

beforeEach(() => {
    jest.clearAllMocks();
});


describe('feedbackController.getAllFeedbacks', () => {
    test('returns 200 with paginated feedback list', async () => {
        const fakeFeedbacks = [{ _id: 'f1' }, { _id: 'f2' }];
        Feedback.find.mockReturnValue(chainable(fakeFeedbacks));
        Feedback.countDocuments.mockResolvedValue(2);

        const req = { query: {} };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.getAllFeedbacks(req, res, next);

        expect(Feedback.find).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(next).not.toHaveBeenCalled();
    });

    test('calls next on DB error', async () => {
        Feedback.find.mockReturnValue({ limit: () => { throw new Error('db down'); } });

        const req = { query: {} };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.getAllFeedbacks(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});


describe('feedbackController.getFeedbackSummary', () => {
    test('returns 200 with aggregated byProperty map', async () => {
        Feedback.aggregate.mockResolvedValue([
            { _id: 'prop1', totalReviews: 3, averageRating: 4.2 },
        ]);

        const req = { query: { propertyId: 'prop1' } };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.getFeedbackSummary(req, res, next);

        expect(Feedback.aggregate).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.json.mock.calls[0][0];
        expect(payload.data.byProperty['prop1']).toBeDefined();
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 200 with empty map when no feedbacks', async () => {
        Feedback.aggregate.mockResolvedValue([]);

        const req = { query: {} };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.getFeedbackSummary(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json.mock.calls[0][0].data.byProperty).toEqual({});
    });
});


describe('feedbackController.getFeedbackById', () => {
    test('returns 404 when feedback is not found', async () => {
        Feedback.findById.mockReturnValue(chainable(null));

        const req = { params: { id: 'nonexistent' } };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.getFeedbackById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 200 with feedback data when found', async () => {
        const fakeFeedback = { _id: 'f1', rating: 5, comment: 'Great!' };
        Feedback.findById.mockReturnValue(chainable(fakeFeedback));

        const req = { params: { id: 'f1' } };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.getFeedbackById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(next).not.toHaveBeenCalled();
    });
});


describe('feedbackController.createFeedback', () => {
    test('returns 400 when required fields are missing', async () => {
        const req = {
            body: { agentId: 'a1' },
            user: { _id: 'u1' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.createFeedback(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 400 when rating is out of range', async () => {
        const req = {
            body: { propertyId: 'p1', rating: 6 },
            user: { _id: 'u1' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.createFeedback(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 201 on success with clean comment', async () => {
        moderateReviewComment.mockReturnValue({ maskedComment: 'Great place!', hadProfanity: false });

        const created = { _id: 'f1' };
        Feedback.create.mockResolvedValue(created);
        Feedback.findById.mockReturnValue(chainable({ _id: 'f1', propertyId: { title: 'Villa' } }));

        const req = {
            body: { propertyId: 'p1', rating: 5, comment: 'Great place!' },
            user: { _id: 'u1', email: 'user@test.com' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.createFeedback(req, res, next);

        expect(Feedback.create).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(sendReviewProfanityWarningEmail).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 201 and schedules profanity warning email when profanity detected', async () => {
        moderateReviewComment.mockReturnValue({ maskedComment: '*** place!', hadProfanity: true });

        const created = { _id: 'f2' };
        Feedback.create.mockResolvedValue(created);
        Feedback.findById.mockReturnValue(chainable({ _id: 'f2', propertyId: { title: 'Apartment' } }));

        const req = {
            body: { propertyId: 'p1', rating: 4, comment: 'shit place!' },
            user: { _id: 'u1', email: 'user@test.com', firstName: 'Ali', lastName: 'Ben', login: 'alibeny' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.createFeedback(req, res, next);

        // setImmediate email is fire-and-forget; verify the main response and masked message
        expect(res.status).toHaveBeenCalledWith(201);
        const payload = res.json.mock.calls[0][0];
        expect(payload.message).toMatch(/masqu/);
        expect(next).not.toHaveBeenCalled();
    });
});


describe('feedbackController.updateFeedback', () => {
    test('returns 404 when feedback is not found', async () => {
        Feedback.findById.mockResolvedValue(null);

        const req = {
            params: { id: 'nonexistent' },
            body: {},
            user: { _id: 'u1', role: 'CLIENT' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.updateFeedback(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 when user is not the author and not admin', async () => {
        const fakeFeedback = {
            _id: 'f1',
            authorId: { equals: jest.fn(() => false) },
        };
        Feedback.findById.mockResolvedValue(fakeFeedback);

        const req = {
            params: { id: 'f1' },
            body: {},
            user: { _id: 'u99', role: 'CLIENT' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.updateFeedback(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 200 on successful update by author', async () => {
        const fakeFeedback = {
            _id: 'f1',
            authorId: { equals: jest.fn(() => true) },
            save: jest.fn().mockResolvedValue(true),
        };
        Feedback.findById
            .mockResolvedValueOnce(fakeFeedback)
            .mockReturnValue(chainable({ _id: 'f1', rating: 4 }));

        moderateReviewComment.mockReturnValue({ maskedComment: 'Nice!', hadProfanity: false });

        const req = {
            params: { id: 'f1' },
            body: { rating: 4, comment: 'Nice!' },
            user: { _id: 'u1', role: 'CLIENT', email: 'u1@test.com' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.updateFeedback(req, res, next);

        expect(fakeFeedback.save).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(next).not.toHaveBeenCalled();
    });
});


describe('feedbackController.deleteFeedback', () => {
    test('returns 404 when feedback is not found', async () => {
        Feedback.findById.mockResolvedValue(null);

        const req = {
            params: { id: 'nonexistent' },
            user: { _id: 'u1', role: 'CLIENT' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.deleteFeedback(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 when user is not the author and not admin', async () => {
        const fakeFeedback = {
            _id: 'f1',
            authorId: { equals: jest.fn(() => false) },
        };
        Feedback.findById.mockResolvedValue(fakeFeedback);

        const req = {
            params: { id: 'f1' },
            user: { _id: 'u99', role: 'CLIENT' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.deleteFeedback(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 200 on successful deletion by admin', async () => {
        const fakeFeedback = {
            _id: 'f1',
            authorId: { equals: jest.fn(() => false) }, // Not the author
            deleteOne: jest.fn().mockResolvedValue(true),
        };
        Feedback.findById.mockResolvedValue(fakeFeedback);

        const req = {
            params: { id: 'f1' },
            user: { _id: 'admin1', role: 'ADMIN' },
        };
        const res = buildRes();
        const next = jest.fn();

        await feedbackController.deleteFeedback(req, res, next);

        expect(fakeFeedback.deleteOne).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(next).not.toHaveBeenCalled();
    });
});
