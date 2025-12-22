import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
  },
  messageType: {
    type: String,
    enum: ['text', 'file'],
    default: 'text',
  },
  fileUrl: {
    type: String,
  },
  fileName: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('GroupMessage', groupMessageSchema);
