const { Sale } = require('../models');
const { apiResponse } = require('../utils/apiResponse');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getAllSales = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      propertyId,
      buyerId,
      minPrice,
      maxPrice,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (propertyId) filter.propertyId = propertyId;
    if (buyerId) filter.buyerId = buyerId;
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }
    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const sales = await Sale.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ saleDate: -1 })
      .populate('propertyId', 'reference title city type price')
      .populate('buyerId', 'login email firstName lastName phone');

    const count = await Sale.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'Sales retrieved successfully', {
        sales,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
// @access  Private
exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('propertyId', 'reference title city type price')
      .populate('buyerId', 'login email firstName lastName phone');

    if (!sale) {
      return res.status(404).json(
        apiResponse(false, 'Sale not found')
      );
    }

    res.status(200).json(
      apiResponse(true, 'Sale retrieved successfully', sale)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res, next) => {
  try {
    const { propertyId, buyerId, salePrice, saleDate, status } = req.body;

    // Validate required fields
    if (!propertyId || !buyerId || !salePrice || !saleDate) {
      return res.status(400).json(
        apiResponse(false, 'Please provide all required fields: propertyId, buyerId, salePrice, saleDate')
      );
    }

    // Only allow buyer to create sale for themselves (unless admin/agency)
    if (!['ADMIN', 'AGENCY'].includes(req.user.role) && buyerId !== req.user._id.toString()) {
      return res.status(403).json(
        apiResponse(false, 'You can only create a sale for yourself')
      );
    }

    // Verify property exists
    const { Property } = require('../models');
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    // Verify buyer (user) exists
    const { User } = require('../models');
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json(
        apiResponse(false, 'Buyer (User) not found')
      );
    }

    const sale = await Sale.create({
      propertyId,
      buyerId,
      salePrice,
      saleDate,
      status,
    });

    const populatedSale = await Sale.findById(sale._id)
      .populate('propertyId', 'reference title city type price')
      .populate('buyerId', 'login email firstName lastName phone');

    res.status(201).json(
      apiResponse(true, 'Sale created successfully', populatedSale)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private
exports.updateSale = async (req, res, next) => {
  try {
    const { propertyId, buyerId, salePrice, saleDate, status } = req.body;

    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json(
        apiResponse(false, 'Sale not found')
      );
    }

    // Check if user is buyer or admin/agency
    const isBuyer = sale.buyerId.equals(req.user._id);
    if (!['ADMIN', 'AGENCY'].includes(req.user.role) && !isBuyer) {
      return res.status(403).json(
        apiResponse(false, 'You can only update your own sale')
      );
    }

    // Update fields
    if (propertyId !== undefined) sale.propertyId = propertyId;
    if (buyerId !== undefined) sale.buyerId = buyerId;
    if (salePrice !== undefined) sale.salePrice = salePrice;
    if (saleDate !== undefined) sale.saleDate = saleDate;
    if (status !== undefined) sale.status = status;

    await sale.save();

    const populatedSale = await Sale.findById(sale._id)
      .populate('propertyId', 'reference title city type price')
      .populate('buyerId', 'login email firstName lastName phone');

    res.status(200).json(
      apiResponse(true, 'Sale updated successfully', populatedSale)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private
exports.deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json(
        apiResponse(false, 'Sale not found')
      );
    }

    // Check if user is buyer or admin
    const isBuyer = sale.buyerId.equals(req.user._id);
    if (req.user.role !== 'ADMIN' && !isBuyer) {
      return res.status(403).json(
        apiResponse(false, 'You can only delete your own sale')
      );
    }

    await sale.deleteOne();

    res.status(200).json(
      apiResponse(true, 'Sale deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
