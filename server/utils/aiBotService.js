// Simple AI chatbot responses
const responses = {
  greetings: [
    'Xin chào! Tôi là trợ lý ảo của bạn. Tôi có thể giúp gì cho bạn?',
    'Chào bạn! Rất vui được trò chuyện cùng bạn!',
    'Hi! Tôi đang ở đây để chat với bạn. Bạn có muốn nói chuyện về điều gì không?',
  ],
  
  datetime: [
    'Hôm nay là ngày {date}. Lịch âm tôi không thể tra cứu chính xác, bạn có thể search Google "lịch âm hôm nay" nhé!',
    'Bây giờ là {time}. Ngày dương lịch: {date}. Để biết lịch âm chính xác, bạn nên dùng ứng dụng lịch vạn niên nhé!',
  ],
  
  time: [
    'Bây giờ là {time}.',
    'Hiện tại là {time} đấy bạn!',
  ],
  
  date: [
    'Hôm nay là {date}.',
    'Ngày hôm nay: {date}',
  ],
  
  lonely: [
    'Tôi hiểu bạn đang cảm thấy cô đơn. Đừng lo, tôi luôn ở đây để lắng nghe bạn!',
    'Cô đơn là cảm giác bình thường thôi. Hãy chia sẻ với tôi những gì bạn đang nghĩ nhé!',
    'Tôi sẽ ở bên cạnh bạn. Chúng ta có thể trò chuyện về bất cứ điều gì bạn muốn!',
  ],
  
  love: [
    'Tình yêu là một điều tuyệt vời! Bạn có muốn kể cho tôi nghe về nó không?',
    'Aww, có ai đó đang yêu rồi à? Kể cho tôi nghe câu chuyện của bạn đi!',
    'Tình yêu làm cho cuộc sống thêm ý nghĩa. Bạn cảm thấy thế nào?',
  ],
  
  sad: [
    'Tôi thấy bạn đang buồn. Hãy chia sẻ với tôi, nói ra sẽ nhẹ lòng hơn đấy!',
    'Đừng quá buồn nhé! Mọi chuyện rồi sẽ ổn thôi. Tôi đang ở đây lắng nghe bạn.',
    'Tôi hiểu cảm giác của bạn. Có điều gì tôi có thể giúp bạn cảm thấy tốt hơn không?',
  ],
  
  funny: [
    'Haha, bạn thật vui tính! 😄',
    'Bạn biết làm người khác cười đấy! Keep it up! 😊',
    'Tôi thích sự hài hước của bạn! 😆',
  ],
  
  help: [
    'Tôi có thể trò chuyện với bạn về nhiều chủ đề: tình yêu, cuộc sống, sở thích... Bạn muốn nói về điều gì?',
    'Tôi ở đây để lắng nghe và chia sẻ cùng bạn. Hãy nói cho tôi biết bạn đang nghĩ gì nhé!',
    'Bạn có thể chia sẻ bất cứ điều gì với tôi. Tôi sẽ cố gắng hiểu và đồng cảm với bạn!',
  ],
  
  ask: [
    'Bạn đang hỏi tôi à? Tôi là AI đơn giản nên có thể không trả lời được tất cả câu hỏi phức tạp. Nhưng hãy thử hỏi tôi về thời gian, ngày tháng hoặc chia sẻ cảm xúc của bạn nhé!',
    'Câu hỏi hay đấy! Nhưng tôi chỉ là AI bot đơn giản. Tôi có thể cho bạn biết thời gian, ngày tháng, hoặc trò chuyện về cảm xúc. Bạn muốn nói chuyện về điều gì?',
  ],
  
  default: [
    'Thật thú vị! Hãy kể cho tôi thêm về điều đó nhé!',
    'Tôi hiểu rồi. Bạn còn muốn chia sẻ gì nữa không?',
    'Hmm, nghe có vẻ hay đấy. Bạn nghĩ sao về điều này?',
    'Tôi đang lắng nghe. Hãy tiếp tục chia sẻ với tôi nhé!',
    'Cảm ơn bạn đã chia sẻ. Tôi rất vui được trò chuyện với bạn!',
  ],
};

// Detect intent from message
const detectIntent = (message) => {
  const msg = message.toLowerCase();
  
  // Greetings
  if (msg.match(/^(hi|hello|xin chào|chào|hey|hế lô)/i)) {
    return 'greetings';
  }
  
  // Date and Time questions
  if (msg.match(/(ngày|tháng|năm|lịch|hôm nay|bây giờ|mấy giờ|thời gian|date|calendar|âm lịch|dương lịch)/i)) {
    // Check if asking for both date and time or lunar calendar
    if (msg.match(/(lịch âm|âm lịch|lunar)/i) || msg.match(/(ngày.*tháng|hôm nay)/i)) {
      return 'datetime';
    }
    // Just time
    if (msg.match(/(giờ|mấy giờ|bây giờ|time|what time)/i)) {
      return 'time';
    }
    // Just date
    return 'date';
  }
  
  // Questions (trả lời đi, etc)
  if (msg.match(/(trả lời|reply|answer|đi|nào|\?)/i) && msg.length < 20) {
    return 'ask';
  }
  
  // Lonely
  if (msg.match(/(cô đơn|một mình|buồn chán|không có ai|nhớ|cô độc)/i)) {
    return 'lonely';
  }
  
  // Love
  if (msg.match(/(yêu|thích|crush|tình cảm|tỏ tình|dating)/i)) {
    return 'love';
  }
  
  // Sad
  if (msg.match(/(buồn|khóc|tệ|tồi tệ|stress|áp lực|mệt mỏi)/i)) {
    return 'sad';
  }
  
  // Funny
  if (msg.match(/(haha|hehe|lol|:D|😂|😄|😆|vui|funny)/i)) {
    return 'funny';
  }
  
  // Help
  if (msg.match(/(giúp|help|làm gì|tư vấn|hỏi|advice)/i)) {
    return 'help';
  }
  
  return 'default';
};

// Generate AI response
export const generateAIResponse = (userMessage) => {
  const intent = detectIntent(userMessage);
  const possibleResponses = responses[intent] || responses.default;
  
  // Random response
  const randomIndex = Math.floor(Math.random() * possibleResponses.length);
  let response = possibleResponses[randomIndex];
  
  // Replace placeholders with actual date/time
  if (intent === 'datetime' || intent === 'date' || intent === 'time') {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    response = response.replace('{date}', dateStr);
    response = response.replace('{time}', timeStr);
  }
  
  return response;
};

// AI Bot user ID (will be created in seed script)
export const AI_BOT_ID = '507f1f77bcf86cd799439011'; // MongoDB ObjectId placeholder
