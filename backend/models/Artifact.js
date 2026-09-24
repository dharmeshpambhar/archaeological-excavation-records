const mongoose = require('mongoose');

const artifactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Artifact name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    catalogNumber: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExcavationSite',
      required: [true, 'Artifact must belong to a site'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Pottery',
        'Tools',
        'Bones',
        'Coins',
        'Jewelry',
        'Weapons',
        'Inscriptions',
        'Textiles',
        'Architectural',
        'Organic Material',
        'Other',
      ],
    },
    material: {
      type: String,
      trim: true,
      // e.g., 'Bronze', 'Ceramic', 'Stone', 'Bone', 'Gold', 'Iron', etc.
    },
    estimatedAge: {
      type: String,
      trim: true,
      // e.g., '2500 BCE', 'circa 1200 CE', '500-600 CE'
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
    period: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Fragmentary'],
      default: 'Good',
    },
    preservationStatus: {
      type: String,
      enum: ['Stable', 'Requires Treatment', 'Under Restoration', 'Critical'],
      default: 'Stable',
    },
    culturalAffiliation: {
      type: String,
      trim: true,
    },
    dimensions: {
      length: { type: Number }, // cm
      width: { type: Number },
      height: { type: Number },
      weight: { type: Number }, // grams
    },
    description: {
      type: String,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    significance: {
      type: String,
      maxlength: [2000, 'Significance cannot exceed 2000 characters'],
    },
    discoveryLocation: {
      gridReference: { type: String, trim: true },
      depth: { type: Number }, // in meters
      layer: { type: String, trim: true },
    },
    discoveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    discoveredDate: {
      type: Date,
    },
    images: [
      {
        url: { type: String },
        caption: { type: String, default: '' },
        view: { type: String, enum: ['front', 'back', 'side', 'detail', 'other'], default: 'front' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String, trim: true }],
    storageLocation: {
      type: String,
      trim: true,
      // e.g., 'Lab Cabinet 3, Shelf B'
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate catalog number
artifactSchema.pre('save', async function (next) {
  if (!this.catalogNumber) {
    const count = await this.constructor.countDocuments();
    this.catalogNumber = `ART-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Text indexes for search
artifactSchema.index({
  name: 'text',
  description: 'text',
  material: 'text',
  tags: 'text',
});
artifactSchema.index({ category: 1, era: 1, condition: 1 });
artifactSchema.index({ site: 1 });

module.exports = mongoose.model('Artifact', artifactSchema);
