import CouponModel from "../models/CouponModel.js";


// CREATE COUPON
export const createCoupon = async (req, res) => {

  try {

    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiryDate,
      usageLimit
    } = req.body;


    // BASIC VALIDATION
    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Code, Discount Value and Expiry Date are required"
      });
    }


    // CHECK EXISTING COUPON
    const existingCoupon = await CouponModel.findOne({
      code: code.toUpperCase()
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon already exists"
      });
    }

    const coupon = await CouponModel.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: Number(maxDiscount || 0),
      expiryDate: new Date(expiryDate),
      usageLimit: Number(usageLimit || 0)
    });


    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon
    });

  } catch (error) {

    console.error("Create Coupon Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


// // GET ALL COUPONS
export const getAllCoupons = async (req, res) => {

  try {

    const coupons = await CouponModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      coupons
    });

  } catch (error) {

    console.error("Get Coupons Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// UPDATE COUPON
export const updateCoupon = async (req, res) => {

  try {

    const coupon = await CouponModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon
    });

  } catch (error) {

    console.error("Update Coupon Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// DELETE COUPON
export const deleteCoupon = async (req, res) => {

  try {

    const coupon = await CouponModel.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully"
    });

  } catch (error) {

    console.error("Delete Coupon Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


// APPLY COUPON
export const applyCoupon = async (req, res) => {

  try {

    const { code, subtotal } = req.body;
    const userId = req.user._id;

    // VALIDATION
    if (!code || subtotal === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and subtotal required"
      });
    }

    // FIND COUPON
    const coupon = await CouponModel.findOne({
      code: code.toUpperCase()
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon"
      });
    }

    // ACTIVE CHECK
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "Coupon is inactive"
      });
    }

    // EXPIRY CHECK
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired"
      });
    }

    // GLOBAL LIMIT CHECK
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached"
      });
    }

    // USER LIMIT CHECK
    const userUsage = coupon.usedBy.find(
      (u) => u.userId.toString() === userId.toString()
    );

    if (userUsage && userUsage.count >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: "You already used this coupon"
      });
    }

    // MIN ORDER CHECK
    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order ₹${coupon.minOrderValue}`
      });
    }

    // CALCULATE DISCOUNT
    let discount = 0;

    if (coupon.discountType === "percentage") {

      discount = (subtotal * coupon.discountValue) / 100;

      if (coupon.maxDiscount && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }

    } else {

      discount = coupon.discountValue;

    }

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      code: coupon.code,
      discount
    });

  } catch (error) {

    console.error("Apply Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


export const getAvailableCoupons = async (req, res) => {

  try {

    const userId = req.user?._id;

    const coupons = await CouponModel.find({
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    let filteredCoupons = coupons;

    if (userId) {

      filteredCoupons = coupons.filter(coupon => {

        const used = coupon.usedBy.find(
          u => u.userId.toString() === userId.toString()
        );

        return !used;

      });

    }

    res.json({
      success: true,
      coupons: filteredCoupons
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// block unblock coupon status

export const toggleCouponStatus = async (req, res) => {

  try {

    const coupon = await CouponModel.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    coupon.isActive = !coupon.isActive;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon status updated",
      coupon
    });

  } catch (error) {

    console.error("Toggle Coupon Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export const updateCouponUsage = async (couponCode, userId) => {

  const coupon = await CouponModel.findOne({
    code: couponCode
  });

  if (!coupon) return;

  const userUsage = coupon.usedBy.find(
    (u) => u.userId.toString() === userId.toString()
  );

  if (userUsage) {

    userUsage.count += 1;

  } else {

    coupon.usedBy.push({
      userId,
      count: 1
    });

  }

  coupon.usedCount += 1;

  await coupon.save();

};