import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Create AI Bot if not exists
export const createAIBot = async () => {
  try {
    // Check if AI bot already exists
    const existingBot = await User.findOne({ email: 'aibot@chatapp.com' });
    
    if (existingBot) {
      console.log('✅ AI Bot already exists');
      return existingBot;
    }

    // Create AI bot user
    const hashedPassword = await bcrypt.hash('aibot123456', 10);
    
    const aiBot = await User.create({
      name: '🤖 AI Assistant',
      email: 'aibot@chatapp.com',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=AI+Bot&background=6366f1&color=fff&size=200',
      bio: 'Tôi là trợ lý ảo, luôn sẵn sàng trò chuyện với bạn! 💬',
      isAIBot: true,
      isOnline: true, // Always online
    });

    console.log('✅ AI Bot created successfully');
    return aiBot;
  } catch (error) {
    console.error('Error creating AI bot:', error);
  }
};
