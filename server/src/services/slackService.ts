import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface SlackResponse {
  ok: boolean;
  error?: string;
}

export const sendToSlack = async (message: string): Promise<boolean> => {
  try {
    if (!process.env.SLACK_WEBHOOK_URL) {
      throw new Error('Slack webhook URL is not configured');
    }

    const response = await axios.post<SlackResponse>(
      process.env.SLACK_WEBHOOK_URL,
      { text: message },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.status === 200;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error sending to Slack:', error.response?.data || error.message);
    } else {
      console.error('Error sending to Slack:', error);
    }
    throw new Error('Failed to send message to Slack');
  }
}; 