// OpenAI (ChatGPT) AI Service
// Get API key from: https://platform.openai.com/api-keys

let OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;

// Set API key
export const setOpenAIApiKey = (apiKey) => {
  OPENAI_API_KEY = apiKey;
};

// Get API key
export const getOpenAIApiKey = () => {
  return OPENAI_API_KEY;
};

// Generate AI response using OpenAI ChatGPT
export const generateOpenAIResponse = async (userMessage) => {
  if (!OPENAI_API_KEY) {
    return 'Xin lỗi, tôi chưa được cấu hình API key. Vui lòng liên hệ quản trị viên để cập nhật API key.';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Bạn là một trợ lý ảo thân thiện, vui vẻ và hữu ích. Hãy trả lời câu hỏi một cách ngắn gọn (tối đa 100 từ).'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else if (data.error) {
      console.error('OpenAI API error:', data.error);
      if (data.error.code === 'invalid_api_key') {
        return 'Xin lỗi, API key không hợp lệ. Vui lòng kiểm tra lại API key.';
      } else if (data.error.code === 'insufficient_quota') {
        return 'Xin lỗi, API key đã hết quota. Vui lòng kiểm tra billing của bạn.';
      }
      return 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.';
    } else {
      return 'Xin lỗi, tôi không thể tạo phản hồi lúc này.';
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'Xin lỗi, tôi gặp lỗi kết nối. Vui lòng thử lại sau.';
  }
};
