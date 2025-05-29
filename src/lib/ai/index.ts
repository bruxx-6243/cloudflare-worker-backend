import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import { z } from 'zod';

const TransactionIntentSchema = z.object({
	intent: z.literal('transfer'),
	amount: z.number().positive(),
	currency: z.string().optional().default('USD'),
	recipient: z.string(),
});

const model = 'claude-opus-4-20250514';

export async function parseTransactionIntent(message: string) {
	const response = await generateText({
		model: anthropic(model),
		prompt: `Parse the following message to extract a transaction intent. 
              If the intent is to transfer money, extract the amount (in numbers), currency (default to USD if not specified), 
              and recipient name. Return a JSON object with these fields or an empty object if no transaction intent is found. 
              Message: "${message}"
            `,
		system: 'You are a banking assistant that understands multiple languages. Extract transaction details accurately.',
	});

	try {
		const intent = TransactionIntentSchema.parse(JSON.parse(response.text));
		return { text: '', intent };
	} catch {
		return { text: response.text, intent: null };
	}
}

export async function askAI(prompt: string): Promise<string> {
	const response = await streamText({
		model: anthropic(model),
		prompt,
	});

	let fullText = '';
	for await (const chunk of response.textStream) {
		fullText += chunk;
	}
	return fullText;
}
