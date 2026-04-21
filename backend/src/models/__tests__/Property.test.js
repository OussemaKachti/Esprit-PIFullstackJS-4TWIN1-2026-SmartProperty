const { Property } = require('../Property');

describe('Property model', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('generateReference starts at 00001 when no previous reference exists', async () => {
    jest.spyOn(Property, 'findOne').mockReturnValue({
      sort: () => ({
        select: () => ({
          lean: async () => null,
        }),
      }),
    });

    const year = new Date().getFullYear();
    const reference = await Property.generateReference();

    expect(reference).toBe(`PROP-${year}-00001`);
  });

  test('generateReference increments based on latest saved reference', async () => {
    jest.spyOn(Property, 'findOne').mockReturnValue({
      sort: () => ({
        select: () => ({
          lean: async () => ({ reference: 'PROP-2026-00042' }),
        }),
      }),
    });

    const reference = await Property.generateReference();

    expect(reference).toBe('PROP-2026-00043');
  });
});
