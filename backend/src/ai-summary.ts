import  'dotenv/config'
import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

interface ErrorLog{
    service: string;
    message: string;
    timeStamp: string;
}

export async function generateRootCauseSummary(service: string, errors: ErrorLog[]): Promise<string> {
    const errorList = errors.map((e,i) => `${i+1}. ${e.message}`).join("\n");

    const prompt = `You are an SRE Assistant. The following errors occured in the "${service}" service withing the last 60 seconds:\n\n${errorList}\n\n2-3 sentences, summarize the likely root cause and suggest what the engineer should check first`;

    const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        max_completion_tokens: 200,
        messages: [{role: 'user', content: prompt}]
    });

    return response.choices[0]?.message?.content ?? 'unable to create summary.';
}