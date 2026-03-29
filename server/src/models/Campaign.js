import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stats: {
    totalLeads: { type: Number, default: 0 },
    withEmail: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Index for performance
campaignSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model('Campaign', campaignSchema);
