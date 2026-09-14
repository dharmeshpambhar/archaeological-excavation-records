const mongoose = require('mongoose');

const excavationLogSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExcavationSite',
      required: [true, 'Log must belong to a site'],
    },
    title: {
      type: String,
      required: [true, 'Log title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Log date is required'],
      default: Date.now,
    },
    content: {
      type: String, // Rich text HTML content
      required: [true, 'Log content is required'],
    },
    weather: {
      condition: {
        type: String,
        enum: ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Stormy', 'Foggy', 'Hot', 'Cold'],
      },
      temperature: { type: Number }, // Celsius
      humidity: { type: Number }, // percentage
      notes: { type: String, trim: true },
    },
    teamPresent: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String },
      },
    ],
    depth: {
      from: { type: Number, default: 0 }, // meters
      to: { type: Number, default: 0 },
      layer: { type: String, trim: true },
      description: { type: String, trim: true },
    },
    findings: {
      type: String, // summary of findings that day
      trim: true,
    },
    attachments: [
      {
        url: { type: String },
        filename: { type: String },
        fileType: { type: String, enum: ['image', 'document', 'sketch'] },
        caption: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

excavationLogSchema.index({ site: 1, date: -1 });
excavationLogSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('ExcavationLog', excavationLogSchema);
