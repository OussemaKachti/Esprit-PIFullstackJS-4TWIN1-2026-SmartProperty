jest.mock('node:fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('fake-image')),
}));

jest.mock('../../models', () => ({
  Property: {
    aggregate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    generateReference: jest.fn(),
    create: jest.fn(),
  },
  Feedback: {},
}));

jest.mock('../../services/huggingface.service', () => ({
  analyzeImageWithAI: jest.fn(),
  generateHuggingFaceStaging: jest.fn(),
}));

jest.mock('../../services/dashboardStats.service', () => ({
  getDashboardStatsForUser: jest.fn(),
}));

const { Property } = require('../../models');
const propertyController = require('../propertyController');

const buildRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('propertyController (coverage bootstrap)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getPropertyById returns 404 for invalid id', async () => {
    const req = { params: { id: 'not-a-valid-id' } };
    const res = buildRes();
    const next = jest.fn();

    await propertyController.getPropertyById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  test('getAllProperties returns 400 when listingType is invalid', async () => {
    const req = {
      query: {
        listingType: 'WRONG_TYPE',
      },
    };
    const res = buildRes();
    const next = jest.fn();

    await propertyController.getAllProperties(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('createProperty builds images + detection payload and creates property', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        detected_objects: ['bed', 'window'],
        room_votes: { bedroom: 3 },
      }),
    });

    Property.generateReference.mockResolvedValue('PROP-2026-00001');

    const createdDoc = {
      _id: 'p1',
      createdBy: 'u1',
      populate: jest.fn().mockResolvedValue(true),
    };
    Property.create.mockResolvedValue(createdDoc);

    const req = {
      body: { title: 'Nice home', city: 'Tunis' },
      user: { _id: 'u1' },
      files: [
        {
          path: 'uploads/one.jpg',
          filename: 'one',
          fieldname: 'image',
          mimetype: 'image/jpeg',
          originalname: 'one.jpg',
        },
      ],
    };
    const res = buildRes();
    const next = jest.fn();

    await propertyController.createProperty(req, res, next);

    expect(Property.generateReference).toHaveBeenCalledTimes(1);
    expect(Property.create).toHaveBeenCalledTimes(1);
    expect(Property.create.mock.calls[0][0]).toMatchObject({
      title: 'Nice home',
      city: 'Tunis',
      createdBy: 'u1',
      images: [
        {
          url: 'uploads/one.jpg',
          publicId: 'one',
          fieldName: 'image',
        },
      ],
      detectedFeatures: {
        objects: ['bed', 'window'],
        inferredRoom: 'bedroom',
        roomVotes: { bedroom: 3 },
      },
    });
    expect(createdDoc.populate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  });

  test('createProperty retries when reference is duplicated', async () => {
    Property.generateReference
      .mockResolvedValueOnce('PROP-2026-00001')
      .mockResolvedValueOnce('PROP-2026-00002');

    const duplicateError = {
      code: 11000,
      keyPattern: { reference: 1 },
    };
    const createdDoc = {
      _id: 'p2',
      createdBy: null,
      populate: jest.fn(),
    };
    Property.create
      .mockRejectedValueOnce(duplicateError)
      .mockResolvedValueOnce(createdDoc);

    const req = {
      body: { title: 'Retry listing', city: 'Sousse' },
      user: { _id: 'u2' },
      files: [],
    };
    const res = buildRes();
    const next = jest.fn();

    await propertyController.createProperty(req, res, next);

    expect(Property.generateReference).toHaveBeenCalledTimes(2);
    expect(Property.create).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  });

  test('createProperty skips detection for panorama-only uploads', async () => {
    global.fetch = jest.fn();
    Property.generateReference.mockResolvedValue('PROP-2026-00003');
    Property.create.mockResolvedValue({
      _id: 'p3',
      createdBy: null,
      populate: jest.fn(),
    });

    const req = {
      body: { title: 'Panorama listing', city: 'Nabeul' },
      user: { _id: 'u3' },
      files: [
        {
          path: 'uploads/pano.jpg',
          filename: 'pano',
          fieldname: 'pano-main',
          mimetype: 'image/jpeg',
          originalname: 'pano.jpg',
        },
      ],
    };
    const res = buildRes();
    const next = jest.fn();

    await propertyController.createProperty(req, res, next);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(Property.create).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [
          expect.objectContaining({
            fieldName: 'pano-main',
          }),
        ],
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  });

  test('createProperty handles detection API errors and still creates property', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
    Property.generateReference.mockResolvedValue('PROP-2026-00004');
    Property.create.mockResolvedValue({
      _id: 'p4',
      createdBy: null,
      populate: jest.fn(),
    });

    const req = {
      body: { title: 'Fallback listing', city: 'Sfax' },
      user: { _id: 'u4' },
      files: [
        {
          path: 'uploads/fallback.jpg',
          filename: 'fallback',
          fieldname: 'image',
          mimetype: 'image/jpeg',
          originalname: 'fallback.jpg',
        },
      ],
    };
    const res = buildRes();
    const next = jest.fn();

    await propertyController.createProperty(req, res, next);

    expect(Property.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  });
});
