import { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';
import { Todo } from '../types/todo';

dotenv.config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || '',
});

export const summarizeTodos = async (todos: Todo[]): Promise<string> => {
  try {
    const prompt = `Please provide a concise summary of the following todo items. For each item, include its key points and any important details:\n${todos
      .map((todo) => `- ${todo.title}: ${todo.description}`)
      .join('\n')}\n\nSummary:`;

    const response = await cohere.generate({
      prompt: prompt,
      maxTokens: 200,
      temperature: 0.7,
      k: 0,
      stopSequences: [],
      returnLikelihoods: 'NONE',
      model: 'command'
    });

    return response.generations[0].text.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}; 