# Bot Setup Guide

## Phase 1 Complete! 🎉

The bot foundation is complete with:
- ✅ Core bot framework
- ✅ Command & event systems
- ✅ Database integration (Prisma + PostgreSQL)
- ✅ Logging system (Winston)
- ✅ Permission system
- ✅ **9 Moderation Commands**

---

## Prerequisites

Before running the bot, ensure you have:

1. **Node.js 18+** installed ([Download](https://nodejs.org/))
2. **PostgreSQL** database running
   - **Option A:** Local PostgreSQL installation
   - **Option B:** Free cloud database ([ElephantSQL](https://www.elephantsql.com/), [Supabase](https://supabase.com/), etc.)
   - **Option C:** For testing only, you can use SQLite (see instructions below)
3. **Discord Bot Token** ([Discord Developer Portal](https://discord.com/developers/applications))

---

## Step 1: Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This installs all required packages (discord.js, prisma, winston, etc.)

---

## Step 2: Create Discord Bot Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section:
   - Click "Add Bot"
   - **Copy the bot token** (you'll need this for `.env`)
   - Under "Privileged Gateway Intents", enable:
     - ✅ Server Members Intent
     - ✅ Message Content Intent
4. Go to "OAuth2" section and copy the **Client ID**
5. Go to "OAuth2" > "URL Generator":
   - Scopes: Select `bot` and `applications.commands`
   - Bot Permissions: Select `Administrator` (for testing) or specific permissions:
     - Kick Members
     - Ban Members
     - Moderate Members (for timeouts)
     - Manage Messages
     - Read Messages/View Channels
     - Send Messages
     - Embed Links
   - Copy the generated URL and open it to invite the bot to your server

---

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```env
   # Discord
   BOT_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here

   # Database (PostgreSQL example)
   DATABASE_URL=postgresql://username:password@localhost:5432/discord_bot

   # OR for SQLite (development only)
   # DATABASE_URL=file:./dev.db

   # Environment
   NODE_ENV=development

   # Logging
   LOG_LEVEL=info

   # Optional: Guild ID for faster command registration during testing
   DEV_GUILD_ID=your_test_server_id_here
   ```

### Using SQLite for Testing (Optional)

If you don't want to set up PostgreSQL, you can use SQLite for testing:

1. In `.env`, set: `DATABASE_URL=file:./dev.db`
2. In `prisma/schema.prisma`, change line 7 from:
   ```prisma
   provider = "postgresql"
   ```
   to:
   ```prisma
   provider = "sqlite"
   ```

---

## Step 4: Setup Database

Run Prisma migrations to create the database tables:

```bash
npm run prisma:generate
npm run prisma:migrate
```

You should see output confirming the tables were created.

**Optional:** View your database with Prisma Studio:
```bash
npm run prisma:studio
```
This opens a web UI at http://localhost:5555 to view/edit database records.

---

## Step 5: Run the Bot

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm run build
npm start
```

---

## Step 6: Verify Bot is Running

You should see in the console:
```
✓ Connected to database
✓ Bot is online as YourBot#1234
✓ Serving 1 guild(s)
✓ 10 command(s) loaded
✓ Bot is fully ready!
```

In Discord, you should see:
- Bot appears online
- Bot's status shows "Playing with slash commands" (or similar)
- Type `/` and you should see your bot's commands appear

---

## Available Commands

### General
- `/ping` - Test the bot's latency

### Moderation (Requires Moderator role or Admin)
- `/kick <user> [reason]` - Kick a user from the server
- `/ban <user> [reason] [delete_days]` - Ban a user
- `/unban <user_id> [reason]` - Unban a user by ID
- `/mute <user> <duration> [reason]` - Mute a user (e.g., 10m, 2h, 1d)
- `/unmute <user> [reason]` - Unmute a user
- `/warn <user> <reason>` - Warn a user
- `/warnings <user>` - View a user's warning history
- `/modlogs [user] [type] [case]` - View moderation logs
- `/purge <amount> [user] [reason]` - Bulk delete messages (1-100)

---

## Configuring the Bot

### Setting Up Mod Log Channel

To receive moderation logs in a channel:

1. Get the channel ID (Right-click channel > Copy ID - requires Developer Mode enabled in Discord settings)
2. Update the database:

**Option A: Using Prisma Studio:**
```bash
npm run prisma:studio
```
- Open `guilds` table
- Find your guild ID
- Set `modLogChannelId` to your channel ID

**Option B: Using SQL (if you know your database):**
```sql
UPDATE guilds
SET "modLogChannelId" = 'your_channel_id_here'
WHERE id = 'your_guild_id_here';
```

### Setting Mod/Admin Roles

Same process as above, but set `modRoleId` and/or `adminRoleId` fields.

**Note:** Users with Discord's Administrator permission always have access regardless of these settings.

---

## Testing the Bot

1. **Test Basic Functionality:**
   ```
   /ping
   ```
   Should respond with latency info.

2. **Test Moderation (on a test user, not yourself!):**
   ```
   /warn @TestUser Testing warnings
   /warnings @TestUser
   /mute @TestUser 5m Test timeout
   /unmute @TestUser
   /kick @TestUser Testing kick
   /ban @TestUser Testing ban
   /unban <user_id> Testing unban
   ```

3. **Test Message Purge:**
   ```
   /purge 10
   /purge 5 @SpecificUser
   ```

4. **Check Mod Logs:**
   ```
   /modlogs
   /modlogs user:@TestUser
   /modlogs case:1
   ```

---

## Troubleshooting

### Bot doesn't respond to commands
- Make sure bot has proper permissions in the server
- Check the console for errors
- Verify `BOT_TOKEN` and `CLIENT_ID` in `.env`
- Try re-inviting the bot with the correct permissions
- Wait a few minutes for commands to register (or use `DEV_GUILD_ID` for instant registration)

### Database connection errors
- Verify `DATABASE_URL` is correct in `.env`
- Make sure PostgreSQL is running (if using PostgreSQL)
- Check database credentials

### Permission errors
- Bot needs proper Discord permissions (see Step 2)
- Check bot's role position in server settings (must be above roles it needs to moderate)

### Commands not showing up
- Commands can take up to 1 hour to register globally
- Use `DEV_GUILD_ID` in `.env` for instant registration in a test server
- Restart the bot after adding `DEV_GUILD_ID`

### TypeScript/Build errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Make sure you're using Node.js 18 or higher

---

## Development Commands

```bash
# Run bot in development with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format
npm run format:check

# Database commands
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Create/run migrations
npm run prisma:studio     # Open database GUI
npm run prisma:push       # Push schema changes without migrations
```

---

## What's Next?

After Phase 1 is tested and working, we'll discuss which feature to build next:
- **Economy System** - Virtual currency, shops, trading
- **Leveling/XP System** - User progression, role rewards
- **Games** - Casino, RPG, trivia, word games
- **Music Player** - Play music in voice channels
- **Utility/Automation** - Welcomes, autoroles, tickets, custom commands
- **Dynamic Events** - Server-wide events and competitions
- **Social Features** - Profiles, analytics, birthdays

---

## Getting Help

If you encounter issues:
1. Check the console output for error messages
2. Check `logs/error.log` for detailed error logs
3. Verify all steps in this guide were followed
4. Ensure all environment variables are correct
5. Try restarting the bot

For development questions, refer to:
- [discord.js Documentation](https://discord.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

## Notes

- The bot uses **slash commands only** (no prefix commands like `!help`)
- Moderation actions send DMs to affected users (if they have DMs open)
- All moderation actions are logged to database with case numbers
- Messages older than 14 days cannot be bulk deleted (Discord limitation)
- Maximum mute duration is 28 days (Discord limitation)

---

Happy botting! 🤖
