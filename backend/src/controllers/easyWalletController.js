const { Lease, Sale, Property, User, RentPayment } = require('../models');
const { apiResponse } = require('../utils/apiResponse');

/**
 * Handle payments via EasyWallet
 */

// @desc    Initiate a payment for a lease or sale (supports Insta-Pay for sales)
// @route   POST /api/easy-wallet/pay
// @access  Private
exports.initiatePayment = async (req, res, next) => {
    try {
        const { id, propertyId, amount, paymentType = 'LEASE' } = req.body;

        if ((!id && !propertyId) || !amount) {
            return res.status(400).json(
                apiResponse(false, 'id (or propertyId for sales) and amount are required')
            );
        }

        let record;
        let ownerId;

        // 1. Fetch record based on type
        if (paymentType === 'LEASE') {
            record = await Lease.findById(id).populate('propertyId');
            if (!record) return res.status(404).json(apiResponse(false, 'Lease not found'));
            if (!record.propertyId) {
                return res.status(404).json(apiResponse(false, 'Associated property not found for this lease'));
            }
            ownerId = record.propertyId.createdBy;
        } else if (paymentType === 'SALE') {
            if (propertyId) {
                // Insta-Pay flow: Create or find Sale record
                const property = await Property.findById(propertyId);
                if (!property) return res.status(404).json(apiResponse(false, 'Property not found'));

                ownerId = property.createdBy;

                // Check for existing pending sale for this buyer/property
                record = await Sale.findOne({
                    propertyId,
                    buyerId: req.user._id,
                    status: 'PENDING'
                });

                if (!record) {
                    // Create new sale record
                    record = await Sale.create({
                        propertyId,
                        buyerId: req.user._id,
                        salePrice: Number(amount),
                        saleDate: new Date(),
                        status: 'PENDING'
                    });
                }
            } else {
                record = await Sale.findById(id).populate('propertyId buyerId');
                if (!record) return res.status(404).json(apiResponse(false, 'Sale not found'));
                if (record.propertyId) {
                    ownerId = record.propertyId.createdBy;
                }
            }
        } else {
            return res.status(400).json(apiResponse(false, 'Invalid paymentType. Must be LEASE or SALE'));
        }

        // 2. Resolve Owner/Agency recipient
        let owner;
        if (ownerId) {
            owner = await User.findById(ownerId);
        }

        // Fallback: If no owner found via createdBy, look for an AGENCY or ADMIN
        if (!owner) {
            console.warn(`Owner not found for ownerId: ${ownerId}. Searching for AGENCY/ADMIN fallback.`);
            owner = await User.findOne({ role: 'AGENCY' });
            if (!owner || owner._id.equals(req.user._id)) {
                owner = await User.findOne({ role: 'ADMIN' });
            }
        }

        if (!owner) {
            return res.status(404).json(
                apiResponse(false, 'Recipient account (Agency or Owner) could not be identified.')
            );
        }

        // 3. Get wallet numbers
        const tenantWallet = req.user.walletNumber;
        const ownerWallet = owner.walletNumber;

        if (!tenantWallet) {
            return res.status(400).json(
                apiResponse(false, 'You must set your EasyWallet number in your profile first')
            );
        }

        if (!ownerWallet) {
            return res.status(400).json(
                apiResponse(false, `The recipient (${owner.firstName || 'Agency'}) has not set their EasyWallet number.`)
            );
        }

        if (tenantWallet === ownerWallet) {
            return res.status(400).json(
                apiResponse(false, 'Sender and Recipient wallets are the same. You cannot pay yourself.')
            );
        }

        // 4. Call EasyWallet API (using /send for transfer)
        const easyWalletUrl = process.env.EASYWALLET_URL || 'https://easywallet-8d5c.onrender.com/api/wallet';

        console.log(`INITIATING TRANSFER: From ${tenantWallet} (You) -> To ${ownerWallet} (Seller/Agency) Amount: ${amount}`);

        const response = await fetch(`${easyWalletUrl}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromWalletNumber: tenantWallet,
                toWalletNumber: ownerWallet,
                amount: Number(amount),
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(
                apiResponse(false, result.message || 'EasyWallet payment failed')
            );
        }

        // 5. If successful, update status
        if (paymentType === 'LEASE') {
            if (record.status === 'PENDING') {
                record.status = 'CONFIRMED';
                await record.save();
            }
            // Create a rent payment record
            await RentPayment.create({
                leaseId: record._id,
                amount: Number(amount),
                dueDate: new Date(),
                paidDate: new Date(),
                status: 'PAID'
            });
        } else if (paymentType === 'SALE') {
            if (record.status === 'PENDING') {
                record.status = 'COMPLETED';
                await record.save();
            }
        }

        res.status(200).json(
            apiResponse(true, 'Payment successful', {
                record,
                walletTransaction: result
            })
        );

    } catch (error) {
        console.error('EasyWallet Integration Error:', error);
        next(error);
    }
};

// @desc    Check if users have wallets set up
// @route   GET /api/easy-wallet/status/:id?paymentType=LEASE|SALE
// @access  Private
exports.getPaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentType = 'LEASE' } = req.query;

        let ownerId;
        let amount;

        if (paymentType === 'LEASE') {
            const record = await Lease.findById(id).populate('propertyId');
            if (record && record.propertyId) {
                ownerId = record.propertyId.createdBy;
                amount = record.rentAmount;
            }
        } else if (paymentType === 'SALE') {
            let record = await Sale.findById(id).populate('propertyId');
            if (record && record.propertyId) {
                ownerId = record.propertyId.createdBy;
                amount = record.salePrice;
            } else {
                const property = await Property.findById(id);
                if (property) {
                    ownerId = property.createdBy;
                    amount = property.price;
                }
            }
        }

        let owner;
        if (ownerId) {
            owner = await User.findById(ownerId);
        }

        if (!owner) {
            owner = await User.findOne({ role: 'AGENCY' });
            if (!owner || owner._id.equals(req.user._id)) {
                owner = await User.findOne({ role: 'ADMIN' });
            }
        }

        res.status(200).json(apiResponse(true, 'Status retrieved', {
            hasTenantWallet: !!req.user.walletNumber,
            hasOwnerWallet: !!owner?.walletNumber,
            tenantWallet: req.user.walletNumber,
            recipientName: owner ? `${owner.firstName || 'Agency'} ${owner.lastName || ''}` : 'Unknown Recipient',
            amount: amount || 0,
            paymentType
        }));
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new wallet in EasyWallet and link it to the user's profile
// @route   POST /api/easy-wallet/create
// @access  Private
exports.createWalletAndLink = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json(apiResponse(false, 'User not found'));

        if (user.walletNumber) {
            return res.status(400).json(apiResponse(false, 'You already have a wallet linked to your account', { walletNumber: user.walletNumber }));
        }

        const easyWalletUrl = process.env.EASYWALLET_URL || 'https://easywallet-8d5c.onrender.com/api/wallet';

        // Prepare data for EasyWallet - we use the user's info
        // We generate a secure random password for the wallet side
        const walletPassword = Math.random().toString(36).slice(-10);

        const response = await fetch(`${easyWalletUrl}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: user.login || user.email.split('@')[0],
                lastName: user.lastName || 'User',
                email: user.email,
                password: walletPassword
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(
                apiResponse(false, result.error || result.message || 'Failed to create wallet in EasyWallet')
            );
        }

        // Link the wallet number to the profile
        const walletNumber = result.wallet?.walletNumber;
        if (!walletNumber) {
            return res.status(500).json(apiResponse(false, 'EasyWallet returned success but no wallet number was found'));
        }

        user.walletNumber = walletNumber;
        await user.save();

        res.status(201).json(apiResponse(true, 'Wallet created and linked successfully', {
            walletNumber,
            user: {
                id: user._id,
                email: user.email,
                walletNumber: user.walletNumber
            }
        }));

    } catch (error) {
        console.error('Create Wallet Error:', error);
        next(error);
    }
};

// @desc    Get the current balance of the user's EasyWallet
// @route   GET /api/easy-wallet/balance
// @access  Private
exports.getBalance = async (req, res, next) => {
    try {
        const walletNumber = req.user.walletNumber;

        if (!walletNumber) {
            return res.status(400).json(
                apiResponse(false, 'You have not linked a wallet yet.')
            );
        }

        const easyWalletUrl = process.env.EASYWALLET_URL || 'https://easywallet-8d5c.onrender.com/api/wallet';

        console.log(`FETCHING BALANCE: For ${walletNumber}`);

        const response = await fetch(`${easyWalletUrl}/balance/${walletNumber}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(
                apiResponse(false, result.message || 'Failed to fetch balance from EasyWallet')
            );
        }

        res.status(200).json(
            apiResponse(true, 'Balance retrieved successfully', {
                balance: result.balance,
                currency: result.currency || 'TND',
                walletNumber: result.walletNumber
            })
        );

    } catch (error) {
        console.error('Fetch Balance Error:', error);
        next(error);
    }
};
