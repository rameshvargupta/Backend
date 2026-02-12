import { User } from "../models/userModel.js";

/* ================= ADD ADDRESS ================= */
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // ✅ use _id from req.user

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.addresses.push(req.body);
    await user.save();

    res.json({
      success: true,
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= GET ADDRESSES ================= */
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // ✅ use _id
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= UPDATE ADDRESS ================= */
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;   // ✅ id URL se lo
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const index = user.addresses.findIndex(
      (a) => a._id.toString() === id
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Update fields
    user.addresses[index] = {
      ...user.addresses[index]._doc,
      ...req.body,
    };

    await user.save();

    res.json({
      success: true,
      addresses: user.addresses,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ================= DELETE ADDRESS ================= */
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // ✅ use _id
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.id
    );

    await user.save();

    res.json({
      success: true,
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
