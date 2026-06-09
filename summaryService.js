const stopWords = [
  "the", "is", "are", "was", "were", "a", "an", "and", "or", "of", "to", "in",
  "on", "for", "with", "as", "by", "from", "at", "this", "that", "these",
  "those", "be", "been", "being", "it", "its", "into", "their", "there",
  "than", "then", "also", "can", "could", "should", "would", "may", "might",
  "we", "they", "he", "she", "our", "your", "has", "have", "had"
];

const cleanText = (text) => {
  return text
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
};

const splitIntoSentences = (text) => {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 40 && sentence.length <= 450);
};

const getWords = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word));
};

const countWords = (text) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const getWordFrequency = (sentences) => {
  const frequency = {};

  sentences.forEach((sentence) => {
    getWords(sentence).forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
  });

  return frequency;
};

const scoreSentence = (sentence, index, totalSentences, frequency) => {
  const words = getWords(sentence);

  if (words.length === 0) return 0;

  let score = 0;

  words.forEach((word) => {
    score += frequency[word] || 0;
  });

  score = score / words.length;

  const lower = sentence.toLowerCase();

  if (index < totalSentences * 0.2) {
    score += 1.5;
  }

  if (
    lower.includes("objective") ||
    lower.includes("purpose") ||
    lower.includes("important") ||
    lower.includes("main") ||
    lower.includes("defined") ||
    lower.includes("refers to") ||
    lower.includes("means") ||
    lower.includes("therefore") ||
    lower.includes("because") ||
    lower.includes("advantage") ||
    lower.includes("benefit") ||
    lower.includes("challenge") ||
    lower.includes("impact") ||
    lower.includes("conclusion")
  ) {
    score += 2;
  }

  if (sentence.length >= 80 && sentence.length <= 280) {
    score += 1;
  }

  if (/\d/.test(sentence)) {
    score += 0.5;
  }

  return score;
};

export const generateSmartSummary = (text, wordLimit = 200) => {
  const finalWordLimit = Math.min(Math.max(Number(wordLimit) || 200, 100), 800);

  if (!text || text.trim().length === 0) {
    return "No readable text found in this PDF.";
  }

  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    return cleanText(text).split(/\s+/).slice(0, finalWordLimit).join(" ");
  }

  const frequency = getWordFrequency(sentences);

  const scoredSentences = sentences.map((sentence, index) => ({
    sentence,
    index,
    score: scoreSentence(sentence, index, sentences.length, frequency),
    words: countWords(sentence),
  }));

  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  let selected = [];
  let totalWords = 0;

  for (const item of topSentences) {
    if (totalWords + item.words <= finalWordLimit) {
      selected.push(item);
      totalWords += item.words;
    }

    if (totalWords >= finalWordLimit * 0.85) {
      break;
    }
  }

  if (selected.length === 0) {
    selected = topSentences.slice(0, 5);
  }

  selected = selected.sort((a, b) => a.index - b.index);

  const overviewSentences = selected.slice(0, 2).map((item) => item.sentence);

  const keyPointSentences = selected
    .slice(2, selected.length - 1)
    .map((item) => item.sentence);

  const conclusionSentence =
    selected.length > 2
      ? selected[selected.length - 1].sentence
      : selected[0]?.sentence;

  let summary = "";

  summary += "Overview:\n";
  summary +=
    overviewSentences.join(" ") ||
    "This PDF discusses the main concepts and important points from the uploaded document.";
  summary += "\n\n";

  summary += "Key Points:\n";

  if (keyPointSentences.length > 0) {
    keyPointSentences.forEach((sentence) => {
      summary += `• ${sentence}\n`;
    });
  } else {
    selected.forEach((item) => {
      summary += `• ${item.sentence}\n`;
    });
  }

  summary += "\nConclusion:\n";
  summary +=
    conclusionSentence ||
    "The document highlights the key ideas and supporting details from the uploaded PDF.";

  return summary;
};