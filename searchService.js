const stopWords = [
  "the", "is", "are", "was", "were", "a", "an", "of", "to", "and", "in", "on",
  "for", "with", "what", "why", "how", "when", "where", "which", "who", "whom",
  "can", "could", "would", "should", "do", "does", "did", "be", "been",
  "explain", "describe", "give", "tell", "about", "this", "that", "from",
  "document", "pdf", "file", "note", "notes"
];

const cleanText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const extractKeywords = (question) => {
  return cleanText(question)
    .split(" ")
    .filter((word) => word.length > 2 && !stopWords.includes(word));
};

const splitIntoSentences = (text) => {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25);
};

const isSummaryQuestion = (question) => {
  const q = cleanText(question);

  return (
    q.includes("summary") ||
    q.includes("summarize") ||
    q.includes("main idea") ||
    q.includes("overview") ||
    q.includes("brief") ||
    q.includes("important points")
  );
};

const getWordFrequency = (text) => {
  const words = cleanText(text).split(" ");
  const frequency = {};

  words.forEach((word) => {
    if (word.length > 2 && !stopWords.includes(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  return frequency;
};

const scoreChunk = (chunkText, question, keywords) => {
  const cleanChunk = cleanText(chunkText);
  const cleanQuestion = cleanText(question);
  const frequency = getWordFrequency(chunkText);

  let score = 0;

  keywords.forEach((keyword) => {
    if (cleanChunk.includes(keyword)) {
      score += 5;
    }

    if (frequency[keyword]) {
      score += frequency[keyword] * 2;
    }
  });

  const questionWords = cleanQuestion.split(" ");

  for (let i = 0; i < questionWords.length - 1; i++) {
    const phrase = `${questionWords[i]} ${questionWords[i + 1]}`;

    if (
      phrase.length > 5 &&
      !stopWords.includes(questionWords[i]) &&
      !stopWords.includes(questionWords[i + 1]) &&
      cleanChunk.includes(phrase)
    ) {
      score += 8;
    }
  }

  return score;
};

const scoreSentence = (sentence, question, keywords) => {
  const cleanSentence = cleanText(sentence);
  const cleanQuestion = cleanText(question);

  let score = 0;

  keywords.forEach((keyword) => {
    if (cleanSentence.includes(keyword)) {
      score += 6;
    }
  });

  const questionWords = cleanQuestion.split(" ");

  for (let i = 0; i < questionWords.length - 1; i++) {
    const phrase = `${questionWords[i]} ${questionWords[i + 1]}`;

    if (phrase.length > 5 && cleanSentence.includes(phrase)) {
      score += 5;
    }
  }

  if (sentence.length > 60 && sentence.length < 350) {
    score += 2;
  }

  return score;
};

export const findRelevantChunks = (question, chunks) => {
  const keywords = extractKeywords(question);

  if (isSummaryQuestion(question)) {
    return chunks.slice(0, 5).map((chunk, index) => ({
      ...chunk,
      score: 10 - index,
    }));
  }

  if (keywords.length === 0) {
    return [];
  }

  return chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk.chunk_text, question, keywords),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

export const generateAnswerFromChunks = (question, relevantChunks) => {
  if (!relevantChunks || relevantChunks.length === 0) {
    return (
      "I could not find a clear answer from this PDF. Try asking with specific words from the document, such as a topic name, heading, or keyword."
    );
  }

  const keywords = extractKeywords(question);
  const summaryQuestion = isSummaryQuestion(question);

  let sentencePool = [];

  relevantChunks.forEach((chunk) => {
    const sentences = splitIntoSentences(chunk.chunk_text);

    sentences.forEach((sentence) => {
      sentencePool.push({
        sentence,
        score: summaryQuestion ? 1 : scoreSentence(sentence, question, keywords),
      });
    });
  });

  let selectedSentences;

  if (summaryQuestion) {
    selectedSentences = sentencePool.slice(0, 7);
  } else {
    selectedSentences = sentencePool
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }

  if (selectedSentences.length === 0) {
    selectedSentences = sentencePool.slice(0, 5);
  }

  const uniqueSentences = [];
  const seen = new Set();

  selectedSentences.forEach((item) => {
    const normalized = cleanText(item.sentence);

    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueSentences.push(item.sentence);
    }
  });

  const answer = uniqueSentences
    .map((sentence) => `• ${sentence}`)
    .join("\n");

  return `Based on the uploaded PDF, the relevant answer is:\n\n${answer}`;
};