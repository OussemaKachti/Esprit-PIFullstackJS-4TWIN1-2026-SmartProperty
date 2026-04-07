const mongoose = require('mongoose');
const { Property, Feedback } = require('../models');
const { apiResponse } = require('../utils/apiResponse');
const { analyzeImageWithAI, generateHuggingFaceStaging } = require('../services/huggingface.service');
const { getDashboardStatsForUser } = require('../services/dashboardStats.service');

// @desc    Get featured properties based on smart algorithm (reviews, popularity, recency)
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const featuredProperties = await Property.aggregate([
      {
        $match: {
          status: 'AVAILABLE'
        }
      },
      {
        $lookup: {
          from: 'feedbacks', // Mongoose pluralizes Feedback to feedbacks
          localField: '_id',
          foreignField: 'propertyId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          avgRating: { $avg: '$reviews.rating' }
        }
      },
      {
        $addFields: {
          // Smart Score Algorithm: (avgRating * 10) + (reviewCount * 5) + (isNew ? 10 : 0)
          smartScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$avgRating', 0] }, 10] },
              { $multiply: ['$reviewCount', 5] },
              {
                $cond: [
                  { $gt: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                  10,
                  0
                ]
              }
            ]
          }
        }
      },
      {
        $sort: {
          smartScore: -1,
          createdAt: -1
        }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      {
        $unwind: {
          path: '$createdBy',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          'createdBy.password': 0,
          'createdBy.twoFactorSecret': 0,
          'createdBy.twoFactorBackupCodes': 0,
          reviews: 0
        }
      }
    ]);

    res.status(200).json(
      apiResponse(true, 'Featured properties retrieved successfully', featuredProperties)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard stats for backoffice (scoped to user or full platform for admin)
// @route   GET /api/properties/dashboard/stats
// @access  Private (Admin / Agency / Owner)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStatsForUser(req.user._id, req.user.role);
    res.status(200).json(apiResponse(true, 'Dashboard stats retrieved successfully', stats));
  } catch (error) {
    next(error);
  }
};

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
      search,
      sortBy,
      sortOrder = 'desc'
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

    // Apply only known sortable fields and sort directions.
    const sortField = ['createdAt', 'price', 'title'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    // Fetch properties
    let properties = await Property.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort(sort)
      .populate('createdBy', 'login email role firstName lastName')
      .lean();

    // Attach latest RENT transaction (if any) to each property
    const propertyIds = properties.map(p => p._id);
    const Transaction = require('../models/Transaction').Transaction;
    const transactions = await Transaction.aggregate([
      { $match: { propertyId: { $in: propertyIds }, type: 'RENT' } },
      { $sort: { endDate: -1, createdAt: -1 } },
      {
        $group: {
          _id: '$propertyId',
          latest: { $first: '$$ROOT' }
        }
      }
    ]);
    const txMap = {};
    transactions.forEach(tg => { txMap[tg._id.toString()] = tg.latest; });
    properties = properties.map(p => ({
      ...p,
      latestRentTransaction: txMap[p._id.toString()] || null
    }));

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
      listingType,
      city,
      minPrice,
      maxPrice,
    } = req.query;
    const validListingTypes = ['FOR_SALE', 'FOR_RENT'];
    if (listingType && !validListingTypes.includes(listingType)) {
      return res.status(400).json(
        apiResponse(false, `Invalid listingType. Must be one of: ${validListingTypes.join(', ')}`)
      );
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 10));

    const filter = { createdBy: userId };
    if (type) filter.type = type;
    if (status) {
      filter.status = status;
    } else {
      // Hide sold properties from the default "my listings" view; they drop off once a sale is confirmed/completed
      filter.status = { $ne: 'SOLD' };
    }
    if (listingType) filter.listingType = listingType;
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (pageNum - 1) * limitNum;

    let properties = await Property.find(filter)
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'login email role firstName lastName')
      .lean();

    // Attach latest RENT transaction (if any) to each property
    const propertyIds = properties.map(p => p._id);
    const Transaction = require('../models/Transaction').Transaction;
    const transactions = await Transaction.aggregate([
      { $match: { propertyId: { $in: propertyIds }, type: 'RENT' } },
      { $sort: { endDate: -1, createdAt: -1 } },
      {
        $group: {
          _id: '$propertyId',
          latest: { $first: '$$ROOT' }
        }
      }
    ]);
    const txMap = {};
    transactions.forEach(tg => { txMap[tg._id.toString()] = tg.latest; });
    properties = properties.map(p => ({
      ...p,
      latestRentTransaction: txMap[p._id.toString()] || null
    }));

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
      listingType,
      city,
      minPrice,
      maxPrice,
    } = req.query;

    const validListingTypes = ['FOR_SALE', 'FOR_RENT'];
    if (listingType && !validListingTypes.includes(listingType)) {
      return res.status(400).json(
        apiResponse(false, `Invalid listingType. Must be one of: ${validListingTypes.join(', ')}`)
      );
    }

    const filter = { createdBy: userId };
    if (type) filter.type = type;
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'SOLD' };
    }
    if (listingType) filter.listingType = listingType;
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    let properties = await Property.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'login email role firstName lastName')
      .lean();

    // Attach latest RENT transaction (if any) to each property
    const propertyIds = properties.map(p => p._id);
    const Transaction = require('../models/Transaction').Transaction;
    const transactions = await Transaction.aggregate([
      { $match: { propertyId: { $in: propertyIds }, type: 'RENT' } },
      { $sort: { endDate: -1, createdAt: -1 } },
      {
        $group: {
          _id: '$propertyId',
          latest: { $first: '$$ROOT' }
        }
      }
    ]);
    const txMap = {};
    transactions.forEach(tg => { txMap[tg._id.toString()] = tg.latest; });
    properties = properties.map(p => ({
      ...p,
      latestRentTransaction: txMap[p._id.toString()] || null
    }));

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
      .populate('createdBy', 'login email role firstName lastName phone createdAt')
      .lean(); // Plain JSON so panoramas (id, url, linkHotspots) match front + backoffice

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
    const propertyData = {
      ...req.body,
    };

    // Never trust client-side reference for a unique, server-generated field.
    delete propertyData.reference;

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

      // Attempt to auto-detect features using FastAPI /detect/ endpoint (all images)
      try {
        const fs = require('fs');
        // Only process regular images (skip panoramas)
        const imagesToDetect = req.files.filter(f => !f.fieldname || !f.fieldname.startsWith('pano'));

        if (imagesToDetect.length > 0) {
          console.log(`🔍 Calling FastAPI detect endpoint for ${imagesToDetect.length} image(s)...`);

          // Run detection on every image in parallel
          const detectionResults = await Promise.allSettled(
            imagesToDetect.map(async (imgFile) => {
              const buffer = fs.readFileSync(imgFile.path);
              const mimeType = imgFile.mimetype || 'image/jpeg';

              const blob = new Blob([buffer], { type: mimeType });
              const formData = new FormData();
              formData.append('file', blob, imgFile.originalname);

              const detectRes = await fetch('http://127.0.0.1:8000/detect/', {
                method: 'POST',
                body: formData,
              });

              if (!detectRes.ok) {
                console.warn(`⚠️ Detect API returned ${detectRes.status} for ${imgFile.originalname}`);
                return null;
              }
              return detectRes.json();
            })
          );

          // Aggregate results across all images
          const allObjectsSet = new Set();
          const aggregatedRoomVotes = {};

          for (const result of detectionResults) {
            if (result.status === 'fulfilled' && result.value) {
              const data = result.value;
              (data.detected_objects || []).forEach(obj => allObjectsSet.add(obj));
              for (const [room, votes] of Object.entries(data.room_votes || {})) {
                aggregatedRoomVotes[room] = (aggregatedRoomVotes[room] || 0) + votes;
              }
            }
          }

          const allObjects = Array.from(allObjectsSet);
          const inferredRoom = Object.keys(aggregatedRoomVotes).length > 0
            ? Object.entries(aggregatedRoomVotes).sort((a, b) => b[1] - a[1])[0][0]
            : null;

          if (allObjects.length > 0 || inferredRoom) {
            propertyData.detectedFeatures = {
              objects: allObjects,
              inferredRoom,
              roomVotes: aggregatedRoomVotes,
            };
            console.log(`✅ AI Detection complete — objects: [${allObjects.join(', ')}], inferred room: ${inferredRoom}`);
          }
        }
      } catch (detectErr) {
        console.warn('⚠️ Error calling auto-detect API:', detectErr.message);
      }
    }

    let property = null;
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      propertyData.reference = await Property.generateReference();

      try {
        property = await Property.create(propertyData);
        break;
      } catch (err) {
        const duplicateReference =
          err &&
          err.code === 11000 &&
          err.keyPattern &&
          err.keyPattern.reference;

        if (!duplicateReference || attempt === maxAttempts - 1) {
          throw err;
        }
      }
    }

    // Populate createdBy if it exists
    if (property && property.createdBy) {
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
      const newImages = [];
      const newPanoramas = [];

      req.files.forEach(file => {
        const item = {
          url: file.path,
          publicId: file.filename,
          fieldName: file.fieldname,
        };

        if (file.fieldname && file.fieldname.startsWith('pano')) {
          // It's a panorama
          newPanoramas.push({
            ...item,
            id: file.filename, // Use filename as unique ID for scene management
            name: file.originalname.split('.')[0], // Default name from filename
          });
        } else {
          // It's a regular image
          newImages.push(item);
        }
      });

      if (newImages.length > 0) {
        req.body.images = [...property.images, ...newImages];
        console.log(`✅ Added ${newImages.length} new image(s).`);
      }

      if (newPanoramas.length > 0) {
        req.body.panoramas = [...(property.panoramas || []), ...newPanoramas];
        console.log(`✅ Added ${newPanoramas.length} new panorama(s).`);
      }
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

// @desc    Update property panoramas (hotspots, names)
// @route   PUT /api/properties/:id/panoramas
// @access  Private (Admin/Agent)
exports.updatePropertyPanoramas = async (req, res, next) => {
  try {
    const { panoramas } = req.body;

    if (!panoramas || !Array.isArray(panoramas)) {
      return res.status(400).json(
        apiResponse(false, 'Please provide panoramas array')
      );
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    // Update panoramas data (names, hotspots) while keeping URLs
    property.panoramas = panoramas;
    await property.save();

    res.status(200).json(
      apiResponse(true, 'Property panoramas updated successfully', property)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Admin/Agency/Owner)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    const userRole = String(req.user?.role || '').toUpperCase();
    const isOwner = String(property.createdBy || '') === String(req.user?._id || '');
    if (userRole !== 'ADMIN' && !isOwner) {
      return res.status(403).json(
        apiResponse(false, 'Forbidden: insufficient permissions')
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

// @desc    Analyze property images for virtual staging eligibility
// @route   POST /api/properties/:id/analyze-images
// @access  Private (Admin/Agent/Owner)
exports.analyzePropertyImages = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    // Real Image Classification via HuggingFace (Free Vision AI)
    let analyzedCount = 0;

    // Process sequentially to avoid rate-limiting
    for (const img of property.images) {
      if (!img.classification || img.classification === 'other') {
        const { isEligible, classification } = await analyzeImageWithAI(img.url);
        img.classification = classification;
        img.isEligibleForStaging = isEligible;
        analyzedCount++;
      }
    }

    if (analyzedCount > 0) {
      await property.save();
    }

    res.status(200).json(
      apiResponse(true, `Analyzed ${analyzedCount} images successfully`, property)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Generate virtual staging for a specific property image
// @route   POST /api/properties/:id/virtual-staging
// @access  Private (Admin/Agent/Owner)
exports.generateVirtualStaging = async (req, res, next) => {
  try {
    const { imageId, style, roomType } = req.body;

    if (!imageId || !style) {
      return res.status(400).json(
        apiResponse(false, 'Please provide imageId and style')
      );
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    const image = property.images.id(imageId);

    if (!image) {
      return res.status(404).json(
        apiResponse(false, 'Image not found in this property')
      );
    }

    if (!image.isEligibleForStaging) {
      return res.status(400).json(
        apiResponse(false, 'This image is not eligible for virtual staging. It must be classified as an empty room.')
      );
    }

    // Call Real Hugging Face API (Instruct-Pix2Pix - Free Image editing)
    const prompt = `Virtually staged ${roomType}, ${style} style interior design, highly detailed, realistic`;
    const stagedImageUrl = await generateHuggingFaceStaging(image.url, prompt);

    // Push the result to the virtualStaging array
    property.virtualStaging.push({
      originalImageId: image._id,
      stagedImageUrl,
      roomType: roomType || 'other',
      style,
      createdAt: new Date()
    });

    await property.save();

    res.status(200).json(
      apiResponse(true, 'Virtual staging generated successfully', property.virtualStaging[property.virtualStaging.length - 1])
    );
  } catch (error) {
    next(error);
  }
};
