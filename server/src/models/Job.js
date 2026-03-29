import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
  keyword: { type: String, required: true },
  location: { type: String, required: true },
  radius: { type: Number, default: 10 },
  mode: { type: String, enum: ['scraper', 'api'], default: 'scraper' },
  status: {
    type: String,
    enum: ['pending', 'running', 'enriching', 'scoring', 'completed', 'failed'],
    default: 'pending',
  },
  totalFound: { type: Number, default: 0 },
  totalProcessed: { type: Number, default: 0 },
  totalEnriched: { type: Number, default: 0 },
  totalDuplicates: { type: Number, default: 0 },
  errorMessage: { type: String, default: '' },
  bullJobId: { type: String, default: '' },
  completedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ status: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;
