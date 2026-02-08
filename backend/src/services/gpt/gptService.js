import { Groq } from 'groq-sdk';

let groq = null;

function getGroqClient() {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groq;
}

export async function rewriteTextWithTone(text, tone) {
  const client = getGroqClient();
  const messages = [
    {
      role: 'user',
      content: `Rewrite the following text in a ${tone} tone. Keep the core message but adjust the style, word choice, and phrasing to match the ${tone} tone perfectly. Only return the rewritten text, no explanations.
Text to convert: "${text}"`
    }
  ];

  const chatCompletion = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages,
    temperature: 1,
    max_completion_tokens: 1000,
    top_p: 1,
    stream: false, 
    reasoning_effort: 'medium',
    stop: null,
  });

  return chatCompletion.choices[0]?.message?.content?.trim() || '';
}
