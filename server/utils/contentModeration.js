// Bad words list (Vietnamese)
const badWords = [
  'đ.m', 'dm', 'đĩ', 'lồn', 'cặc', 'buồi', 'địt', 'dcm', 'vcl', 'vl', 'cc', 'clgt',
  'đụ', 'đéo', 'đ**', 'đ***', 'con chó', 'ngu', 'ngốc', 'khốn', 'thằng ngu',
  'con ngu', 'đồ ngu', 'đồ khốn', 'thằng khốn', 'đồ chó', 'con chó', 'mẹ mày',
  'bố mày', 'cha mày', 'đ mẹ', 'đ cha', 'cút', 'fuck', 'shit', 'bitch', 'damn',
  'ass', 'bastard', 'idiot', 'stupid', 'dumb'
];

// Check if text contains offensive words
export const containsOffensiveWords = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase().replace(/\s/g, '');
  
  return badWords.some(word => {
    const cleanWord = word.toLowerCase().replace(/\s/g, '');
    return lowerText.includes(cleanWord);
  });
};

// Get offensive words found in text
export const getOffensiveWords = (text) => {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  const found = [];
  
  badWords.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      found.push(word);
    }
  });
  
  return found;
};

// Censor text (replace bad words with ***)
export const censorText = (text) => {
  if (!text) return text;
  
  let censored = text;
  badWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    censored = censored.replace(regex, '***');
  });
  
  return censored;
};
