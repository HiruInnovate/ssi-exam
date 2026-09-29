import OpenAI from 'openai';
import { requireAuth } from '@/lib/auth';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const { prompt, context } = await req.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });
    }

    const systemMessage = `You are an expert academic coordinator and professional administrative assistant for Study Smart Innovations. 
Your task is to craft a highly engaging, visually structured email to students based on the admin's instructions.
Target students context: ${context || 'General Students'}.

CRITICAL FORMATTING RULES:
1. You MUST return STRICTLY valid HTML. DO NOT wrap the output in markdown code blocks (\`\`\`html). DO NOT include <html>, <head>, or <body> tags. Just provide the raw inner HTML elements.
2. Structure the email beautifully using <p> tags with inline styles like <p style="margin-bottom: 16px; line-height: 1.6;">.
3. You MUST use bullet points <ul> and <li> whenever listing items, instructions, or features to make the email scannable.
4. Emphasize important words or phrases using <strong> tags.
5. Incorporate relevant emojis naturally throughout the text to make the email warm and modern.
6. Break up sections clearly—use <h3 style="color: #333; margin-top: 24px;"> for subtitles if necessary, or use a subtle <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 24px 0;" />.
7. Maintain an extremely professional, grammatically perfect, yet encouraging tone.
8. Address the student generically (e.g., "Hello {{name}}," or "Dear Student," if a name placeholder isn't asked for).`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    let draftedHtml = aiResponse.choices[0].message.content.trim();
    
    // Fallback: Remove potential markdown wrappers explicitly
    draftedHtml = draftedHtml.replace(/^```(html)?\s*/gi, '');
    draftedHtml = draftedHtml.replace(/```\s*$/g, '');

    return new Response(JSON.stringify({ success: true, draft: draftedHtml }), { status: 200 });

  } catch (error) {
    console.error('Draft API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
