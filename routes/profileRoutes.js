// Profile Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Song = require('../models/Song');
const { isLoggedIn } = require('../middleware/auth');

const Achievement = require('../models/Achievement');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = 'avatar-' + req.session.user.id + '-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// View profile
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    let achievements = await Achievement.findOne({ user: req.session.user.id });
    
    if (!achievements) {
      achievements = new Achievement({ user: req.session.user.id });
      await achievements.save();
    }
    
    const songCount = await Song.countDocuments({ uploadedBy: req.session.user.id });
    
    res.render('profile', { 
      user, 
      achievements, 
      songCount,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).send('Error loading profile');
  }
});

// Change password
router.post('/change-password', isLoggedIn, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.session.user.id);
    
    if (user.password !== currentPassword) {
      const achievements = await Achievement.findOne({ user: req.session.user.id });
      const songCount = await Song.countDocuments({ uploadedBy: req.session.user.id });
      return res.render('profile', { 
        user, 
        achievements, 
        songCount,
        error: 'Current password is incorrect',
        success: null
      });
    }
    
    if (newPassword.length < 6) {
      const achievements = await Achievement.findOne({ user: req.session.user.id });
      const songCount = await Song.countDocuments({ uploadedBy: req.session.user.id });
      return res.render('profile', { 
        user, 
        achievements, 
        songCount,
        error: 'New password must be at least 6 characters',
        success: null
      });
    }
    
    if (newPassword !== confirmPassword) {
      const achievements = await Achievement.findOne({ user: req.session.user.id });
      const songCount = await Song.countDocuments({ uploadedBy: req.session.user.id });
      return res.render('profile', { 
        user, 
        achievements, 
        songCount,
        error: 'New passwords do not match',
        success: null
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    const achievements = await Achievement.findOne({ user: req.session.user.id });
    const songCount = await Song.countDocuments({ uploadedBy: req.session.user.id });
    res.render('profile', { 
      user, 
      achievements, 
      songCount,
      error: null,
      success: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).send('Error changing password');
  }
});

// Upload avatar
router.post('/upload-avatar', isLoggedIn, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/profile');
    }
    
    const user = await User.findById(req.session.user.id);
    
    if (user.avatar && user.avatar !== 'default-avatar.png') {
      const oldAvatarPath = path.join(__dirname, '../public/avatars', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
    
    user.avatar = req.file.filename;
    await user.save();
    
    res.redirect('/profile');
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).send('Error uploading avatar');
  }
});

// Change display name
router.post('/change-displayname', isLoggedIn, async (req, res) => {
  try {
    const { displayName } = req.body;
    const user = await User.findById(req.session.user.id);
    
    if (!displayName || displayName.trim() === '') {
      const achievements = await Achievement.findOne({ user: req.session.user.id });
      const songCount = await Song.countDocuments({ uploadedBy: req.session.user.id });
      return res.render('profile', { 
        user, 
        achievements, 
        songCount,
        error: 'Display name cannot be empty',
        success: null
      });
    }
    
    if (displayName.length > 50) {
      const achievements = await Achievement.findOne({ user: req.session.user.id });
      const songCount = await Song.countDocuments({ uploadedBy: req.session.user.id });
      return res.render('profile', { 
        user, 
        achievements, 
        songCount,
        error: 'Display name must be less than 50 characters',
        success: null
      });
    }
    
    user.displayName = displayName.trim();
    await user.save();
    
    const achievements = await Achievement.findOne({ user: req.session.user.id });
    const songCount = await Song.countDocuments({ uploadedBy: req.session.user.id });
    res.render('profile', { 
      user, 
      achievements, 
      songCount,
      error: null,
      success: 'Display name updated successfully'
    });
  } catch (error) {
    console.error('Change display name error:', error);
    res.status(500).send('Error changing display name');
  }
});

module.exports = router;

