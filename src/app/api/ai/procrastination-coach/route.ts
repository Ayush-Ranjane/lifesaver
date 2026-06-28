import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken } from '@/lib/firebase/admin';
import { generateChatCompletion } from '@/lib/ai/nvidiaClient';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    await verifyIdToken(token);

    const { taskTitle, answers } = await req.json();

    if (!taskTitle || !Array.isArray(answers) || answers.length !== 3) {
      return NextResponse.json({ message: 'taskTitle and 3 answers are required' }, { status: 400 });
    }

    const prompt = `You are a highly empathetic productivity coach. The user is procrastinating on a task: "${taskTitle}".
They answered the following 3 questions to understand why they are procrastinating:
1. Why are you avoiding this? Answer: "${answers[0]}"
2. What is the worst that could happen if you do it? Answer: "${answers[1]}"
3. What is one tiny step you could take right now? Answer: "${answers[2]}"

Based on their answers, provide a short, empathetic validation, 3 actionable and very specific micro-steps (including their tiny step), and a short encouraging closing statement.

Respond ONLY in valid JSON matching this schema:
{
  "validation": "A sentence validating their feelings.",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "closing": "A short encouraging sentence."
}
`;

    const aiResponse = await generateChatCompletion([
      { role: "system", content: "You are a helpful JSON-producing assistant." },
      { role: "user", content: prompt }
    ], { temperature: 0.7 });

    const content = aiResponse.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response.");
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('[POST /api/ai/procrastination-coach]', error);
    return NextResponse.json({ message: 'Coaching generation failed' }, { status: 500 });
  }
}
