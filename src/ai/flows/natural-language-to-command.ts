// src/ai/flows/natural-language-to-command.ts
'use server';
/**
 * @fileOverview Converts natural language commands to terminal commands.
 *
 * - naturalLanguageToCommand - A function that converts natural language to a command.
 * - NaturalLanguageToCommandInput - The input type for the naturalLanguageToCommand function.
 * - NaturalLanguageToCommandOutput - The return type for the naturalLanguageToCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageToCommandInputSchema = z.object({
  naturalLanguage: z
    .string()
    .describe('The natural language command to convert to a terminal command.'),
});
export type NaturalLanguageToCommandInput = z.infer<typeof NaturalLanguageToCommandInputSchema>;

const NaturalLanguageToCommandOutputSchema = z.object({
  command: z.string().describe('The terminal command to execute.'),
});
export type NaturalLanguageToCommandOutput = z.infer<typeof NaturalLanguageToCommandOutputSchema>;

export async function naturalLanguageToCommand(input: NaturalLanguageToCommandInput): Promise<NaturalLanguageToCommandOutput> {
  return naturalLanguageToCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageToCommandPrompt',
  input: {schema: NaturalLanguageToCommandInputSchema},
  output: {schema: NaturalLanguageToCommandOutputSchema},
  prompt: `You are a command line expert. Convert the following natural language command to a terminal command.

Natural Language Command: {{{naturalLanguage}}}

Terminal Command: `,
});

const naturalLanguageToCommandFlow = ai.defineFlow(
  {
    name: 'naturalLanguageToCommandFlow',
    inputSchema: NaturalLanguageToCommandInputSchema,
    outputSchema: NaturalLanguageToCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
