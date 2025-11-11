import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const rest = new REST().setToken(process.env.BOT_TOKEN!);

async function clearGlobalCommands() {
  try {
    console.log('Clearing all global commands...');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: []
    });

    console.log('✓ Successfully cleared all global commands!');
    console.log('Guild commands are still active. Restart your bot to see changes.');
  } catch (error) {
    console.error('Failed to clear global commands:', error);
  }
}

clearGlobalCommands();
