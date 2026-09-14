const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      expertise: user.expertise,
      institution: user.institution,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
      city: user.city,
      state: user.state,
      country: user.country,
      emergencyContact: user.emergencyContact,
      degree: user.degree,
      university: user.university,
      graduationYear: user.graduationYear,
      fieldOfStudy: user.fieldOfStudy,
      occupation: user.occupation,
      specialization: user.specialization,
      yearsOfExperience: user.yearsOfExperience,
      researchId: user.researchId,
      createdAt: user.createdAt,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const defaultAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&h=250&fit=crop&crop=face';

  // New registrations strictly default to Viewer role (not Leader or anything else)
  const user = await User.create({
    name,
    email,
    password,
    role: 'Viewer',
    avatar: req.body.avatar || defaultAvatar,
  });
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account is deactivated. Please contact administrator.');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'avatar', 'dob', 'gender', 'bio',
    'phone', 'address', 'city', 'state', 'country', 'emergencyContact',
    'degree', 'university', 'graduationYear', 'fieldOfStudy',
    'occupation', 'specialization', 'institution', 'expertise', 'yearsOfExperience', 'researchId'
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({ success: true, user });
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error('No user found with that email');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // In production, send email. For dev, return token.
  res.json({
    success: true,
    message: 'Password reset token generated. Check server logs in development.',
    resetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update avatar
// @route   PUT /api/auth/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  let avatarUrl = '';

  if (req.file) {
    avatarUrl = `/uploads/avatars/${req.file.filename}`;
  } else if (req.body.avatarUrl) {
    avatarUrl = req.body.avatarUrl;
  } else if (req.body.avatar) {
    avatarUrl = req.body.avatar;
  }

  if (!avatarUrl) {
    res.status(400);
    throw new Error('Please upload an image file or provide an avatar image');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  );

  res.json({ success: true, avatar: user.avatar, user });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateAvatar,
};
