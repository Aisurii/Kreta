# Kreta Discord Bot

A comprehensive, feature-rich Discord bot built with TypeScript and discord.js v14.

## Features

### Phase 1 (Current)
- Core bot framework with slash commands
- Basic moderation system (kick, ban, mute, warn, etc.)
- AI-powered message moderation with configurable sensitivity
- Comprehensive logging system
- Permission management

### Future Phases
- Economy system with server-specific currencies
- Leveling and XP system
- Extensive games library (casino, RPG, trivia, etc.)
- Music player
- Dynamic server events
- Social features and analytics
- And much more...

## Setup

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL database (or SQLite for development)
- Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. **Clone the repository** (or you're already here!)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your bot token, client ID, and database URL
   ```bash
   cp .env.example .env
   ```

4. **Setup database**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Run the bot**:
   - Development (with auto-reload):
     ```bash
     npm run dev
     ```
   - Production:
     ```bash
     npm run build
     npm start
     ```

## Development

### Available Scripts

- `npm run dev` - Run bot in development mode with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled bot
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:push` - Push schema changes to database

### Project Structure

```
src/
├── core/           # Core bot functionality (client, handlers)
├── commands/       # Slash command modules
│   ├── moderation/ # Moderation commands
│   └── general/    # General utility commands
├── events/         # Discord event handlers
├── database/       # Database schema and client
├── utils/          # Utility functions and helpers
├── types/          # TypeScript type definitions
├── config/         # Configuration constants
└── index.ts        # Application entry point
```

## Creating the Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - Server Members Intent
   - Message Content Intent
5. Copy the bot token and add it to your `.env` file
6. Go to "OAuth2" > "URL Generator"
7. Select scopes: `bot` and `applications.commands`
8. Select bot permissions (Administrator for testing, or specific permissions)
9. Copy the generated URL and open it in your browser to invite the bot

## Support

For issues or questions, please open an issue on the repository.

## License

MIT
