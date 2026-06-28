/**
 * Client for NVIDIA AI integrations using the Minimax M3 model.
 */

const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export async function generateChatCompletion(
  messages: { role: string; content: string }[],
  options: { temperature?: number; max_tokens?: number; top_p?: number } = {}
) {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not defined in environment variables.');
  }

  const payload = {
    model: 'minimaxai/minimax-m3',
    messages,
    max_tokens: options.max_tokens ?? 1024,
    temperature: options.temperature ?? 0.7,
    top_p: options.top_p ?? 1,
    stream: false,
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[NVIDIA API Error]', errorText);
    throw new Error(`NVIDIA API responded with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}
