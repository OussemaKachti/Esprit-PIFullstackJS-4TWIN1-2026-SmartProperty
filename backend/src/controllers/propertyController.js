const { Property } = require('../models');
const { apiResponse } = require('../utils/apiResponse');
// const cloudinary = require('../config/cloudinary'); // Temporairement désactivé

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
      city, 
      minPrice, 
      maxPrice,
      search 
    } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
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

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
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
      createdBy: req.user._id, // Capturer l'utilisateur connecté
    };

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    const property = await Property.create(propertyData);

    // Ajouter manuellement les infos du user (car populate ne marche pas avec staticUser)
    const propertyWithUser = property.toObject();
    propertyWithUser.createdBy = {
      _id: req.user._id,
      login: req.user.login,
      email: req.user.email,
      role: req.user.role
    };

    res.status(201).json(
      apiResponse(true, 'Property created successfully', propertyWithUser)
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

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
      }));
      req.body.images = [...property.images, ...newImages];
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

    // Delete images from Cloudinary (temporairement désactivé)
    // if (property.images && property.images.length > 0) {
    //   for (const image of property.images) {
    //     if (image.publicId) {
    //       await cloudinary.uploader.destroy(image.publicId);
    //     }
    //   }
    // }

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

    // Delete from Cloudinary (temporairement désactivé)
    // const publicId = property.images[imageIndex].publicId;
    // if (publicId) {
    //   await cloudinary.uploader.destroy(publicId);
    // }

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
