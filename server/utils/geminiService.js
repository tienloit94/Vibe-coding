// Google Gemini AI Service
// Free API - Get key from: https://makersuite.google.com/app/apikey

let GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;

// Set API key
export const setGeminiApiKey = (apiKey) => {
  GEMINI_API_KEY = apiKey;
};

// Get API key
export const getGeminiApiKey = () => {
  return GEMINI_API_KEY;
};

// Generate AI response using Gemini
export const generateGeminiResponse = async (userMessage) => {
  if (!GEMINI_API_KEY) {
    return 'Xin lỗi, tôi chưa được cấu hình API key. Vui lòng liên hệ quản trị viên để cập nhật API key.';
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bạn là một trợ lý ảo thân thiện, vui vẻ và hữu ích. Hãy trả lời câu hỏi sau một cách ngắn gọn (tối đa 100 từ): ${userMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.error) {
      console.error('Gemini API error:', data.error);
      return 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.';
    } else {
      return 'Xin lỗi, tôi không thể tạo phản hồi lúc này.';
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Xin lỗi, tôi gặp lỗi kết nối. Vui lòng thử lại sau.';
  }
};
