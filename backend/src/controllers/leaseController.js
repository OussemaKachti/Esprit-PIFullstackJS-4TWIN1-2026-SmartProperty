const { Lease } = require('../models');
const { apiResponse } = require('../utils/apiResponse');

// @desc    Get all leases
// @route   GET /api/leases
// @access  Private
exports.getAllLeases = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      propertyId,
      tenantId
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (propertyId) filter.propertyId = propertyId;
    if (tenantId) filter.tenantId = tenantId;

    const skip = (page - 1) * limit;

    const leases = await Lease.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'reference title city type price')
      .populate('tenantId', 'login email firstName lastName phone');

    const count = await Lease.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'Leases retrieved successfully', {
        leases,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lease by ID
// @route   GET /api/leases/:id
// @access  Private
exports.getLeaseById = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('propertyId', 'reference title city type price')
      .populate('tenantId', 'login email firstName lastName phone');

    if (!lease) {
      return res.status(404).json(
        apiResponse(false, 'Lease not found')
      );
    }

    res.status(200).json(
      apiResponse(true, 'Lease retrieved successfully', lease)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create new lease
// @route   POST /api/leases
// @access  Private
exports.createLease = async (req, res, next) => {
  try {
    const { propertyId, tenantId, startDate, endDate, rentAmount, charges, status } = req.body;

    // Validate required fields
    if (!propertyId || !tenantId || !startDate || !endDate || !rentAmount) {
      return res.status(400).json(
        apiResponse(false, 'Please provide all required fields: propertyId, tenantId, startDate, endDate, rentAmount')
      );
    }

    // Only allow tenant to create lease for themselves (unless admin)
    if (req.user.role !== 'ADMIN' && tenantId !== req.user._id.toString()) {
      return res.status(403).json(
        apiResponse(false, 'You can only create a lease for yourself')
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

    // Verify tenant (user) exists
    const { User } = require('../models');
    const tenant = await User.findById(tenantId);
    if (!tenant) {
      return res.status(404).json(
        apiResponse(false, 'Tenant (User) not found')
      );
    }

    const lease = await Lease.create({
      propertyId,
      tenantId,
      startDate,
      endDate,
      rentAmount,
      charges,
      status,
    });

    const populatedLease = await Lease.findById(lease._id)
      .populate('propertyId', 'reference title city type price')
      .populate('tenantId', 'login email firstName lastName phone');

    res.status(201).json(
      apiResponse(true, 'Lease created successfully', populatedLease)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update lease
// @route   PUT /api/leases/:id
// @access  Private
exports.updateLease = async (req, res, next) => {
  try {
    const { propertyId, tenantId, startDate, endDate, rentAmount, charges, status } = req.body;

    let lease = await Lease.findById(req.params.id);

    if (!lease) {
      return res.status(404).json(
        apiResponse(false, 'Lease not found')
      );
    }

    // Update fields
    if (propertyId !== undefined) lease.propertyId = propertyId;
    if (tenantId !== undefined) lease.tenantId = tenantId;
    if (startDate !== undefined) lease.startDate = startDate;
    if (endDate !== undefined) lease.endDate = endDate;
    if (rentAmount !== undefined) lease.rentAmount = rentAmount;
    if (charges !== undefined) lease.charges = charges;
    if (status !== undefined) lease.status = status;

    await lease.save();

    const populatedLease = await Lease.findById(lease._id)
      .populate('propertyId', 'reference title city type price')
      .populate('tenantId', 'login email firstName lastName phone');

    res.status(200).json(
      apiResponse(true, 'Lease updated successfully', populatedLease)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lease
// @route   DELETE /api/leases/:id
// @access  Private
exports.deleteLease = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id);

    if (!lease) {
      return res.status(404).json(
        apiResponse(false, 'Lease not found')
      );
    }

    // Check if user is the tenant or admin
    const isTenant = lease.tenantId.equals(req.user._id);
    if (req.user.role !== 'ADMIN' && !isTenant) {
      return res.status(403).json(
        apiResponse(false, 'You can only delete your own lease')
      );
    }

    await lease.deleteOne();

    res.status(200).json(
      apiResponse(true, 'Lease deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
