// Song Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const Song = require('../models/Song');
const Achievement = require('../models/Achievement');
const { isLoggedIn } = require('../middleware/auth');

// Helper function to check and unlock allAchievements
async function checkAllAchievements(achievements) {
  const ach = achievements.achievements;
  if (!ach.allAchievements && 
      ach.firstPlaylist && ach.firstSong && ach.firstPost && 
      ach.firstDelete && ach.firstPostDelete && ach.firstLike && 
      ach.firstReply && ach.tenSongs && ach.fiveMinutes && 
      ach.firstRating && ach.firstFiveStar && ach.firstOneStar) {
    ach.allAchievements = true;
    await achievements.save();
    return 'Master Achiever|Unlock all achievements';
  }
  return null;
}

// Setup GridFS for storing files in MongoDB
let gfs;
let gridfsBucket;

mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
  
  gfs = gridfsBucket;
});

// Setup multer to store files in memory temporarily
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed (mp3, wav, ogg, m4a)'));
    }
  }
});

// List user's songs only
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const { search, artist } = req.query;
    let query = { uploadedBy: req.session.user.id };
    
    // Search songs
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
      query.uploadedBy = req.session.user.id;
    }
    
    if (artist) {
      query.artist = { $regex: artist, $options: 'i' };
    }
    
    const songs = await Song.find(query).populate('uploadedBy', 'username displayName').sort({ uploadedAt: -1 });
    res.render('songs', { songs, search: search || '', artist: artist || '', user: req.session.user, achievement: req.query.achievement || null });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).send('Error fetching songs');
  }
});

// Browse all users songs
router.get('/browse', isLoggedIn, async (req, res) => {
  try {
    const { search, artist } = req.query;
    let query = {};
    
    // Search songs
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (artist) {
      query.artist = { $regex: artist, $options: 'i' };
    }
    
    const songs = await Song.find(query).populate('uploadedBy', 'username displayName').sort({ uploadedAt: -1 });
    res.render('browseSongs', { songs, search: search || '', artist: artist || '', user: req.session.user });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).send('Error fetching songs');
  }
});

// Rate a song
router.post('/rate/:id', isLoggedIn, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).send('Song not found');
    }
    
    // Users can't rate their own songs
    if (song.uploadedBy.toString() === req.session.user.id) {
      return res.status(403).send('You cannot rate your own songs');
    }
    
    const { rating } = req.body;
    const ratingNum = parseInt(rating);
    
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).send('Invalid rating');
    }
    
    // Check if user already rated
    const existingRating = song.ratings.find(r => r.user.toString() === req.session.user.id);
    
    if (existingRating) {
      existingRating.rating = ratingNum;
    } else {
      song.ratings.push({ user: req.session.user.id, rating: ratingNum });
    }
    
    // Calculate average rating
    const totalRating = song.ratings.reduce((sum, r) => sum + r.rating, 0);
    song.averageRating = (totalRating / song.ratings.length).toFixed(1);
    
    await song.save();
    
    // Check achievements
    let achievements = await Achievement.findOne({ user: req.session.user.id });
    if (!achievements) {
      achievements = new Achievement({ user: req.session.user.id });
    }
    
    let unlockedAchievement = null;
    
    if (!achievements.achievements.firstRating && !existingRating) {
      achievements.achievements.firstRating = true;
      unlockedAchievement = 'Music Critic|Rate a song for the first time';
    }
    
    if (ratingNum === 5 && !achievements.achievements.firstFiveStar) {
      achievements.achievements.firstFiveStar = true;
      unlockedAchievement = 'Five Star Fan|Give a 5 star rating';
    }
    
    if (ratingNum === 1 && !achievements.achievements.firstOneStar) {
      achievements.achievements.firstOneStar = true;
      unlockedAchievement = 'Honest Critic|Give a 1 star rating';
    }
    
    await achievements.save();
    
    const allAchievementsUnlocked = await checkAllAchievements(achievements);
    if (allAchievementsUnlocked) {
      return res.redirect('/songs/browse?achievement=' + encodeURIComponent(allAchievementsUnlocked));
    }
    
    if (unlockedAchievement) {
      return res.redirect('/songs/browse?achievement=' + encodeURIComponent(unlockedAchievement));
    }
    res.redirect('/songs/browse');
  } catch (error) {
    console.error('Rate song error:', error);
    res.status(500).send('Error rating song');
  }
});

// Track listening time
router.post('/track-listening', isLoggedIn, async (req, res) => {
  try {
    const { seconds } = req.body;
    
    let achievements = await Achievement.findOne({ user: req.session.user.id });
    if (!achievements) {
      achievements = new Achievement({ user: req.session.user.id });
    }
    
    achievements.totalListeningTime += parseInt(seconds) || 0;
    
    let unlockedAchievement = null;
    
    if (achievements.totalListeningTime >= 300 && !achievements.achievements.fiveMinutes) {
      achievements.achievements.fiveMinutes = true;
      unlockedAchievement = 'Music Enthusiast|Listen to music for 5 minutes';
    }
    
    await achievements.save();
    
    const allAchievementsUnlocked = await checkAllAchievements(achievements);
    if (allAchievementsUnlocked) {
      return res.json({ success: true, achievement: allAchievementsUnlocked });
    }
    
    res.json({ success: true, achievement: unlockedAchievement });
  } catch (error) {
    console.error('Track listening error:', error);
    res.json({ success: false });
  }
});

// Upload form
router.get('/upload', isLoggedIn, (req, res) => {
  res.render('uploadSong', { error: null, user: req.session.user });
});

// Upload song
router.post('/upload', isLoggedIn, upload.single('songFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.render('uploadSong', { error: 'Please select a music file' });
    }
    
    const { title, artist } = req.body;
    
    // Validation
    if (!title || !artist) {
      return res.render('uploadSong', { error: 'Title and Artist are required' });
    }
    
    // Upload file to GridFS
    const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });
    
    uploadStream.end(req.file.buffer);
    
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });
    
    // Create new song with GridFS file ID
    const newSong = new Song({
      title,
      artist,
      album: '',
      genre: '',
      year: null,
      duration: '',
      filename: uploadStream.id.toString(),
      uploadedBy: req.session.user.id
    });
    
    await newSong.save();
    
    let achievements = await Achievement.findOne({ user: req.session.user.id });
    if (!achievements) {
      achievements = new Achievement({ user: req.session.user.id });
    }
    
    let unlockedAchievement = null;
    
    if (!achievements.achievements.firstSong) {
      achievements.achievements.firstSong = true;
      unlockedAchievement = 'First Upload|Upload your first song';
    }
    
    const songCount = await Song.countDocuments({ uploadedBy: req.session.user.id });
    if (songCount >= 10 && !achievements.achievements.tenSongs) {
      achievements.achievements.tenSongs = true;
      unlockedAchievement = 'Music Collector|Upload 10 songs';
    }
    
    await achievements.save();
    
    const allAchievementsUnlocked = await checkAllAchievements(achievements);
    if (allAchievementsUnlocked) {
      return res.redirect('/songs?achievement=' + encodeURIComponent(allAchievementsUnlocked));
    }
    
    if (unlockedAchievement) {
      return res.redirect('/songs?achievement=' + encodeURIComponent(unlockedAchievement));
    }
    res.redirect('/songs');
  } catch (error) {
    console.error('Upload error:', error);
    res.render('uploadSong', { error: 'Upload failed. Please try again.', user: req.session.user });
  }
});

// Edit form
router.get('/edit/:id', isLoggedIn, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).send('Song not found');
    }
    
    // Check if user owns the song
    if (song.uploadedBy.toString() !== req.session.user.id) {
      return res.status(403).send('You can only edit your own songs');
    }
    
    res.render('editSong', { song, error: null, user: req.session.user });
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).send('Error fetching song');
  }
});

// Update song
router.post('/edit/:id', isLoggedIn, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).send('Song not found');
    }
    
    // Check if user owns the song
    if (song.uploadedBy.toString() !== req.session.user.id) {
      return res.status(403).send('You can only edit your own songs');
    }
    
    const { title, artist } = req.body;
    
    // Validation
    if (!title || !artist) {
      return res.render('editSong', { song, error: 'Title and Artist are required', user: req.session.user });
    }
    
    // Update song
    song.title = title;
    song.artist = artist;
    song.album = '';
    song.genre = '';
    song.year = null;
    song.duration = '';
    
    await song.save();
    res.redirect('/songs');
  } catch (error) {
    console.error('Update error:', error);
    const song = await Song.findById(req.params.id);
    res.render('editSong', { song, error: 'Update failed. Please try again.', user: req.session.user });
  }
});

// Delete
router.post('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).send('Song not found');
    }
    
    // Check if user owns the song
    if (song.uploadedBy.toString() !== req.session.user.id) {
      return res.status(403).send('You can only delete your own songs');
    }
    
    // Delete file from GridFS
    try {
      await gridfsBucket.delete(new mongoose.Types.ObjectId(song.filename));
    } catch (err) {
      console.error('Error deleting file from GridFS:', err);
    }
    
    // Delete from database
    await Song.findByIdAndDelete(req.params.id);
    
    let achievements = await Achievement.findOne({ user: req.session.user.id });
    if (!achievements) {
      achievements = new Achievement({ user: req.session.user.id });
    }
    
    let unlockedAchievement = null;
    
    if (!achievements.achievements.firstDelete) {
      achievements.achievements.firstDelete = true;
      unlockedAchievement = 'Song Manager|Delete a song';
      await achievements.save();
    }
    
    if (unlockedAchievement) {
      return res.redirect('/songs?achievement=' + encodeURIComponent(unlockedAchievement));
    }
    res.redirect('/songs');
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).send('Error deleting song');
  }
});

// Stream audio file from GridFS
router.get('/stream/:fileId', isLoggedIn, async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    
    // Get file info
    const files = await gridfsBucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).send('File not found');
    }
    
    const file = files[0];
    
    // Set headers
    res.set('Content-Type', file.contentType);
    res.set('Content-Length', file.length);
    res.set('Accept-Ranges', 'bytes');
    
    // Stream the file
    const downloadStream = gridfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
    
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).send('Error streaming audio');
  }
});

module.exports = router;

