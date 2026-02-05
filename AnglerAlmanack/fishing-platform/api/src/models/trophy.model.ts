import { Schema, model } from 'mongoose';

const trophySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dateCaught: {
    type: Date,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  length: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Trophy = model('Trophy', trophySchema);

export default Trophy;