import { config } from 'dotenv';
// Load environment variables from .env.local
config({ path: '.env.local' });

import '@/ai/flows/natural-language-to-command.ts';
