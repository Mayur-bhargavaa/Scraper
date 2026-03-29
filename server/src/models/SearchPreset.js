import mongoose from 'mongoose';

const searchPresetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  keyword: { type: String, required: true },
  location: { type: String, required: true },
  radius: { type: Number, default: 10 },
  mode: { type: String, enum: ['scraper', 'api'], default: 'scraper' },
  schedule: {
    type: String,
    enum: ['none', 'daily', 'weekly'],
    default: 'none',
  },
  cronExpression: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastRunAt: { type: Date, default: null },
}, {
  timestamps: true,
});

searchPresetSchema.index({ userId: 1 });
searchPresetSchema.index({ isActive: 1, schedule: 1 });

const SearchPreset = mongoose.model('SearchPreset', searchPresetSchema);
export default SearchPreset;
