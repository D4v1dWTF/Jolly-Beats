// Forum Routes
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Song = require('../models/Song');
const Achievement = require('../models/Achievement');
const { isLoggedIn } = require('../middleware/auth');

// List all posts
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username displayName')
      .populate('song', 'title artist')
      .populate('likes', 'username displayName')
      .populate('replies.author', 'username displayName')
      .sort({ createdAt: -1 });
    
    const songs = await Song.find().sort({ title: 1 });
    
    res.render('forum', { posts, songs, error: null, user: req.session.user, achievement: req.query.achievement || null });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Error fetching posts');
  }
});

// Create new post
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    const { content, songId } = req.body;
    
    // Validation
    if (!content || content.trim() === '') {
      const posts = await Post.find()
        .populate('author', 'username')
        .populate('song', 'title artist')
        .sort({ createdAt: -1 });
      const songs = await Song.find().sort({ title: 1 });
      return res.render('forum', { posts, songs, error: 'Post content is required' });
    }
    
    if (content.length > 500) {
      const posts = await Post.find()
        .populate('author', 'username')
        .populate('song', 'title artist')
        .sort({ createdAt: -1 });
      const songs = await Song.find().sort({ title: 1 });
      return res.render('forum', { posts, songs, error: 'Post content must be less than 500 characters' });
    }
    
    // Create new post
    const newPost = new Post({
      content,
      author: req.session.user.id,
      song: songId || null
    });
    
    await newPost.save();
    
    let achievements = await Achievement.findOne({ user: req.session.user.id });
    if (!achievements) {
      achievements = new Achievement({ user: req.session.user.id });
    }
    
    let unlockedAchievement = null;
    
    if (!achievements.achievements.firstPost) {
      achievements.achievements.firstPost = true;
      unlockedAchievement = 'Forum Member|Post your first message';
      await achievements.save();
    }
    
    if (unlockedAchievement) {
      return res.redirect('/forum?achievement=' + encodeURIComponent(unlockedAchievement));
    }
    res.redirect('/forum');
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).send('Error creating post');
  }
});

// Delete post
router.post('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send('Post not found');
    }
    
    // Check if user owns the post
    if (post.author.toString() !== req.session.user.id) {
      return res.status(403).send('You can only delete your own posts');
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    let achievements = await Achievement.findOne({ user: req.session.user.id });
    if (!achievements) {
      achievements = new Achievement({ user: req.session.user.id });
    }
    
    let unlockedAchievement = null;
    
    if (!achievements.achievements.firstPostDelete) {
      achievements.achievements.firstPostDelete = true;
      unlockedAchievement = 'Content Moderator|Delete a forum post';
      await achievements.save();
    }
    
    if (unlockedAchievement) {
      return res.redirect('/forum?achievement=' + encodeURIComponent(unlockedAchievement));
    }
    res.redirect('/forum');
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).send('Error deleting post');
  }
});

// Like post
router.post('/like/:id', isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send('Post not found');
    }
    
    const userId = req.session.user.id;
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    
    await post.save();
    
    let achievements = await Achievement.findOne({ user: req.session.user.id });
    if (!achievements) {
      achievements = new Achievement({ user: req.session.user.id });
    }
    
    let unlockedAchievement = null;
    
    if (!achievements.achievements.firstLike && likeIndex === -1) {
      achievements.achievements.firstLike = true;
      unlockedAchievement = 'Supporter|Like a forum post';
      await achievements.save();
    }
    
    if (unlockedAchievement) {
      return res.redirect('/forum?achievement=' + encodeURIComponent(unlockedAchievement));
    }
    res.redirect('/forum');
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).send('Error liking post');
  }
});

// Reply to post
router.post('/reply/:id', isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send('Post not found');
    }
    
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.redirect('/forum');
    }
    
    if (content.length > 300) {
      return res.redirect('/forum');
    }
    
    post.replies.push({
      content,
      author: req.session.user.id
    });
    
    await post.save();
    
    let achievements = await Achievement.findOne({ user: req.session.user.id });
    if (!achievements) {
      achievements = new Achievement({ user: req.session.user.id });
    }
    
    let unlockedAchievement = null;
    
    if (!achievements.achievements.firstReply) {
      achievements.achievements.firstReply = true;
      unlockedAchievement = 'Conversationalist|Reply to a forum post';
      await achievements.save();
    }
    
    if (unlockedAchievement) {
      return res.redirect('/forum?achievement=' + encodeURIComponent(unlockedAchievement));
    }
    res.redirect('/forum');
  } catch (error) {
    console.error('Reply post error:', error);
    res.status(500).send('Error replying to post');
  }
});

module.exports = router;

