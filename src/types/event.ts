import { ClientEvents } from 'discord.js';

// Event interface that all events must implement
export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
  // Event name (must be a valid Discord.js event)
  name: K;

  // Whether this event should only run once
  once?: boolean;

  // Event handler function
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}
