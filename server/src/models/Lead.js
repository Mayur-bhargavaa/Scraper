import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  category: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  email: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  workingHours: { type: mongoose.Schema.Types.Mixed, default: null },
  mapsLink: { type: String, default: '' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  
  // Social Links
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  twitter: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  
  // Lead scoring
  score: { type: Number, default: 0 },
  tags: [{ type: String, enum: ['High Potential', 'Premium', 'Cold'] }],
  
  // Enrichment status
  emailEnriched: { type: Boolean, default: false },
  scored: { type: Boolean, default: false },
  
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

// Indexes for fast queries & deduplication
leadSchema.index({ userId: 1, createdAt: -1 });
leadSchema.index({ jobId: 1 });
leadSchema.index({ phone: 1, userId: 1 });
leadSchema.index({ website: 1, userId: 1 });
leadSchema.index({ businessName: 1, userId: 1 });
leadSchema.index({ score: -1 });
leadSchema.index({ tags: 1 });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
