const mongoose = require('mongoose');

const excavationSiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
      maxlength: [200, 'Site name cannot exceed 200 characters'],
    },
    siteCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    location: {
      country: { type: String, trim: true },
      region: { type: String, trim: true },
      city: { type: String, trim: true },
      address: { type: String, trim: true },
      coordinates: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
    },
    period: {
      type: String,
      trim: true,
      // e.g., 'Bronze Age', 'Roman Period', 'Medieval', etc.
    },
    era: {
      type: String,
      enum: [
        'Prehistoric',
        'Ancient',
        'Classical',
        'Medieval',
        'Early Modern',
        'Modern',
        'Unknown',
      ],
      default: 'Unknown',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Ongoing', 'Completed', 'On Hold', 'Planned'],
      default: 'Planned',
    },
    coverImage: {
      type: String,
      default: '',
    },
    photos: [
      {
        url: { type: String },
        caption: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamMembers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, default: 'Field Assistant' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    totalDepth: {
      type: Number, // in meters
      default: 0,
    },
    areaSize: {
      type: Number, // in square meters
      default: 0,
    },
    tags: [{ type: String, trim: true }],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: artifact count
excavationSiteSchema.virtual('artifactCount', {
  ref: 'Artifact',
  localField: '_id',
  foreignField: 'site',
  count: true,
});

// Virtual: log count
excavationSiteSchema.virtual('logCount', {
  ref: 'ExcavationLog',
  localField: '_id',
  foreignField: 'site',
  count: true,
});

// Auto-generate site code before save
excavationSiteSchema.pre('save', async function (next) {
  if (!this.siteCode) {
    const prefix = this.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const count = await this.constructor.countDocuments();
    this.siteCode = `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes
excavationSiteSchema.index({ name: 'text', description: 'text', tags: 'text' });
excavationSiteSchema.index({ status: 1, era: 1 });
excavationSiteSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('ExcavationSite', excavationSiteSchema);
