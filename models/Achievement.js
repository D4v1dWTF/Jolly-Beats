// Achievement Model
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievements: {
    firstPlaylist: { type: Boolean, default: false },
    firstSong: { type: Boolean, default: false },
    firstPost: { type: Boolean, default: false },
    firstDelete: { type: Boolean, default: false },
    firstPostDelete: { type: Boolean, default: false },
    firstLike: { type: Boolean, default: false },
    firstReply: { type: Boolean, default: false },
    tenSongs: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);

