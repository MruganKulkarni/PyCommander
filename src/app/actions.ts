'use server';

import { naturalLanguageToCommand } from '@/ai/flows/natural-language-to-command';

export async function getCommandFromNaturalLanguage(
  prevState: any,
  prompt: string
) {
  if (!prompt) {
    return { command: null, error: 'Prompt cannot be empty.' };
  }
  try {
    const result = await naturalLanguageToCommand({ naturalLanguage: prompt });
    if (!result.command) {
      return { command: null, error: 'AI could not determine a command.' };
    }
    return { command: result.command, error: null };
  } catch (e: any) {
    console.error('AI Error:', e);
    return { command: null, error: e.message || 'Failed to get command from AI.' };
  }
}
