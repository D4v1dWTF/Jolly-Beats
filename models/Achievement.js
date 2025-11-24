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
    tenSongs: { type: Boolean, default: false },
    fiveMinutes: { type: Boolean, default: false },
    firstRating: { type: Boolean, default: false },
    firstFiveStar: { type: Boolean, default: false },
    firstOneStar: { type: Boolean, default: false },
    allAchievements: { type: Boolean, default: false }
  },
  totalListeningTime: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);

