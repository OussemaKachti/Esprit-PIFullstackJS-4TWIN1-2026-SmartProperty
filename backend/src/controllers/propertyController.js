const mongoose = require('mongoose');
const { Property } = require('../models');
const { apiResponse } = require('../utils/apiResponse');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getAllProperties = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status,
      listingType,
      city,
      region,
      minPrice, 
      maxPrice,
      rooms,
      bathrooms,
      minSurface,
      search 
    } = req.query;

    // Validate listingType if provided
    const validListingTypes = ['FOR_SALE', 'FOR_RENT'];
    if (listingType && !validListingTypes.includes(listingType)) {
      return res.status(400).json(
        apiResponse(false, `Invalid listingType. Must be one of: ${validListingTypes.join(', ')}`)
      );
    }

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    // Filter by listing type: FOR_SALE or FOR_RENT
    if (listingType) filter.listingType = listingType;
    if (city) filter.city = new RegExp(city, 'i');
    if (region) filter.region = new RegExp(region, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (rooms) filter.rooms = { $gte: Number(rooms) };
    if (bathrooms) filter.bathrooms = { $gte: Number(bathrooms) };
    if (minSurface) filter.surface = { $gte: Number(minSurface) };
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const properties = await Property.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'login email role firstName lastName'); // Peupler les infos user

    const count = await Property.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'Properties retrieved successfully', {
        properties,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get properties of the connected user (my properties)
// @route   GET /api/properties/my
// @access  Private
exports.getMyProperties = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const {
      page = 1,
      limit = 10,
      type,
      status,
      city,
      minPrice,
      maxPrice,
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 10));

    const filter = { createdBy: userId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (pageNum - 1) * limitNum;

    const properties = await Property.find(filter)
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'login email role firstName lastName');

    const total = await Property.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'My properties retrieved successfully', {
        properties,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        total,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get properties by user (createdBy)
// @route   GET /api/properties/user/:userId
// @access  Public
exports.getPropertiesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      type,
      status,
      city,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = { createdBy: userId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const properties = await Property.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'login email role firstName lastName');

    const total = await Property.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'Properties by user retrieved successfully', {
        properties,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get properties of the connected user (my properties)
// @route   GET /api/properties/my
// @access  Private
exports.getMyProperties = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const {
      page = 1,
      limit = 10,
      type,
      status,
      city,
      minPrice,
      maxPrice,
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 10));

    const filter = { createdBy: userId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (pageNum - 1) * limitNum;

    const properties = await Property.find(filter)
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'login email role firstName lastName');

    const total = await Property.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'My properties retrieved successfully', {
        properties,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        total,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get properties by user (createdBy)
// @route   GET /api/properties/user/:userId
// @access  Public
exports.getPropertiesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      type,
      status,
      city,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = { createdBy: userId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const properties = await Property.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'login email role firstName lastName');

    const total = await Property.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'Properties by user retrieved successfully', {
        properties,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }
    const property = await Property.findById(id)
      .populate('createdBy', 'login email role firstName lastName'); // Peupler les infos user

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    res.status(200).json(
      apiResponse(true, 'Property retrieved successfully', property)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Admin/Agent)
exports.createProperty = async (req, res, next) => {
  try {
    const reference = await Property.generateReference();

    const propertyData = {
      ...req.body,
      reference,
    };

    // Add createdBy if user is authenticated
    if (req.user && req.user._id) {
      propertyData.createdBy = req.user._id;
    }

    // Handle image uploads - accepts any field names (image, image1, photo, etc.)
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        fieldName: file.fieldname, // Store which field was used
      }));
      
      console.log(`✅ Uploaded ${req.files.length} image(s)`);
    }

    const property = await Property.create(propertyData);
    
    // Populate createdBy if it exists
    if (property.createdBy) {
      await property.populate('createdBy', 'login email role firstName lastName');
    }

    res.status(201).json(
      apiResponse(true, 'Property created successfully', property)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Admin/Agent)
exports.updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    // Handle new image uploads - accepts any field names
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        fieldName: file.fieldname,
      }));
      
      // Merge existing images with new ones
      req.body.images = [...property.images, ...newImages];
      
      console.log(`✅ Added ${req.files.length} new image(s). Total: ${req.body.images.length}`);
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(
      apiResponse(true, 'Property updated successfully', updatedProperty)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json(
      apiResponse(true, 'Property deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private (Admin/Agent)
exports.deletePropertyImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    const imageIndex = property.images.findIndex(
      img => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json(
        apiResponse(false, 'Image not found')
      );
    }

    // Remove from array
    property.images.splice(imageIndex, 1);
    await property.save();

    res.status(200).json(
      apiResponse(true, 'Image deleted successfully', property)
    );
  } catch (error) {
    next(error);
  }
};
