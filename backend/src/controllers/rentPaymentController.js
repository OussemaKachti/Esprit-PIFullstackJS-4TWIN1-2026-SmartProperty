const { RentPayment } = require('../models');
const { apiResponse } = require('../utils/apiResponse');

// @desc    Get all rent payments
// @route   GET /api/rent-payments
// @access  Private
exports.getAllRentPayments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      leaseId
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (leaseId) filter.leaseId = leaseId;

    const skip = (page - 1) * limit;

    const rentPayments = await RentPayment.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ dueDate: -1 })
      .populate({
        path: 'leaseId',
        populate: [
          { path: 'propertyId', select: 'reference title city type' },
          { path: 'tenantId', select: 'login email firstName lastName' }
        ]
      });

    const count = await RentPayment.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'Rent payments retrieved successfully', {
        rentPayments,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rent payment by ID
// @route   GET /api/rent-payments/:id
// @access  Private
exports.getRentPaymentById = async (req, res, next) => {
  try {
    const rentPayment = await RentPayment.findById(req.params.id)
      .populate({
        path: 'leaseId',
        populate: [
          { path: 'propertyId', select: 'reference title city type' },
          { path: 'tenantId', select: 'login email firstName lastName' }
        ]
      });

    if (!rentPayment) {
      return res.status(404).json(
        apiResponse(false, 'Rent payment not found')
      );
    }

    res.status(200).json(
      apiResponse(true, 'Rent payment retrieved successfully', rentPayment)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create new rent payment
// @route   POST /api/rent-payments
// @access  Private
exports.createRentPayment = async (req, res, next) => {
  try {
    const { leaseId, amount, dueDate, paidDate, status } = req.body;

    // Validate required fields
    if (!leaseId || !amount || !dueDate) {
      return res.status(400).json(
        apiResponse(false, 'Please provide all required fields: leaseId, amount, dueDate')
      );
    }

    // Verify lease exists and check tenant authorization
    const { Lease } = require('../models');
    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json(
        apiResponse(false, 'Lease not found')
      );
    }

    // Only allow tenant of the lease or admin/agency/owner to create payments
    const isTenant = lease.tenantId.equals(req.user._id);
    if (!['ADMIN', 'AGENCY', 'OWNER'].includes(req.user.role) && !isTenant) {
      return res.status(403).json(
        apiResponse(false, 'You can only create rent payments for your own lease')
      );
    }

    const rentPayment = await RentPayment.create({
      leaseId,
      amount,
      dueDate,
      paidDate,
      status,
    });

    const populatedRentPayment = await RentPayment.findById(rentPayment._id)
      .populate({
        path: 'leaseId',
        populate: [
          { path: 'propertyId', select: 'reference title city type' },
          { path: 'tenantId', select: 'login email firstName lastName' }
        ]
      });

    res.status(201).json(
      apiResponse(true, 'Rent payment created successfully', populatedRentPayment)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update rent payment
// @route   PUT /api/rent-payments/:id
// @access  Private
exports.updateRentPayment = async (req, res, next) => {
  try {
    const { leaseId, amount, dueDate, paidDate, status } = req.body;

    let rentPayment = await RentPayment.findById(req.params.id)
      .populate('leaseId');

    if (!rentPayment) {
      return res.status(404).json(
        apiResponse(false, 'Rent payment not found')
      );
    }

    // Check if user is tenant of the lease or admin/agency/owner
    const isTenant = rentPayment.leaseId.tenantId.equals(req.user._id);
    if (!['ADMIN', 'AGENCY', 'OWNER'].includes(req.user.role) && !isTenant) {
      return res.status(403).json(
        apiResponse(false, 'You can only update rent payments for your own lease')
      );
    }

    // Update fields
    if (leaseId !== undefined) rentPayment.leaseId = leaseId;
    if (amount !== undefined) rentPayment.amount = amount;
    if (dueDate !== undefined) rentPayment.dueDate = dueDate;
    if (paidDate !== undefined) rentPayment.paidDate = paidDate;
    if (status !== undefined) rentPayment.status = status;

    await rentPayment.save();

    const populatedRentPayment = await RentPayment.findById(rentPayment._id)
      .populate({
        path: 'leaseId',
        populate: [
          { path: 'propertyId', select: 'reference title city type' },
          { path: 'tenantId', select: 'login email firstName lastName' }
        ]
      });

    res.status(200).json(
      apiResponse(true, 'Rent payment updated successfully', populatedRentPayment)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete rent payment
// @route   DELETE /api/rent-payments/:id
// @access  Private
exports.deleteRentPayment = async (req, res, next) => {
  try {
    const rentPayment = await RentPayment.findById(req.params.id)
      .populate('leaseId');

    if (!rentPayment) {
      return res.status(404).json(
        apiResponse(false, 'Rent payment not found')
      );
    }

    // Check if user is tenant of the lease or admin
    const isTenant = rentPayment.leaseId.tenantId.equals(req.user._id);
    if (req.user.role !== 'ADMIN' && !isTenant) {
      return res.status(403).json(
        apiResponse(false, 'You can only delete rent payments for your own lease')
      );
    }

    await rentPayment.deleteOne();

    res.status(200).json(
      apiResponse(true, 'Rent payment deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
