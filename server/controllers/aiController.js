import { setOpenAIApiKey, getOpenAIApiKey } from '../utils/openaiService.js';

// Update AI API Key
export const updateAIKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ message: 'API key is required' });
    }
    
    // Set the API key in memory
    setOpenAIApiKey(apiKey);
    
    res.json({ 
      message: 'API key updated successfully',
      hasKey: true 
    });
  } catch (error) {
    console.error('Error updating AI key:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if AI key is configured
export const checkAIKey = async (req, res) => {
  try {
    const hasKey = !!getOpenAIApiKey();
    
    res.json({ hasKey });
  } catch (error) {
    console.error('Error checking AI key:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
