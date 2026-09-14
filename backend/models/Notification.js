const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'artifact_added',
        'site_created',
        'site_updated',
        'log_added',
        'comment_added',
        'team_joined',
        'status_changed',
        'artifact_updated',
        'user_mentioned',
      ],
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // frontend route to navigate to
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // any extra data
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
