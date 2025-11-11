# Current Phase: Phase 1 - Core Foundation + Basic Moderation

**Status**: Starting
**Started**: 2025-11-11
**Target Completion**: TBD

---

## Phase 1 Goals

Build the foundation of the bot with essential core systems and basic moderation commands.

### Core Foundation
- ✅ Planning complete
- ⬜ Project initialization
- ⬜ TypeScript configuration
- ⬜ Bot client setup
- ⬜ Command handler system
- ⬜ Event handler system
- ⬜ Database setup (Prisma + PostgreSQL)
- ⬜ Logging system (Winston)
- ⬜ Configuration system
- ⬜ Error handling

### Basic Moderation Commands
- ⬜ `/kick` - Kick user
- ⬜ `/ban` - Ban user
- ⬜ `/unban` - Unban user
- ⬜ `/mute` - Timeout user
- ⬜ `/unmute` - Remove timeout
- ⬜ `/warn` - Warn user
- ⬜ `/warnings` - View warnings
- ⬜ `/modlogs` - View mod logs
- ⬜ `/purge` - Bulk delete messages

### AI Moderation (Basic)
- ⬜ Toxic language detection
- ⬜ Spam detection
- ⬜ "Margin of joke" setting
- ⬜ Message logging/flagging

---

## Current Task
Starting project initialization

---

## Implementation Steps

### 1. Project Initialization
- [ ] Create package.json
- [ ] Install dependencies (discord.js, prisma, dotenv, winston, typescript)
- [ ] Setup TypeScript configuration
- [ ] Setup ESLint and Prettier
- [ ] Create .gitignore
- [ ] Create .env.example
- [ ] Setup folder structure

### 2. Core Bot Setup
- [ ] Create bot client (src/core/client.ts)
- [ ] Setup event handler (src/core/eventHandler.ts)
- [ ] Setup command handler (src/core/commandHandler.ts)
- [ ] Create logger utility (src/utils/logger.ts)
- [ ] Create main entry point (src/index.ts)
- [ ] Test bot connection

### 3. Database Setup
- [ ] Initialize Prisma
- [ ] Define database schema (Guild, User, ModLog, etc.)
- [ ] Create migrations
- [ ] Setup database client
- [ ] Test database connection

### 4. Command System
- [ ] Create base command interface/class
- [ ] Setup slash command registration
- [ ] Create command loader
- [ ] Test with ping command

### 5. Event System
- [ ] Create base event interface
- [ ] Setup event loader
- [ ] Implement messageCreate event
- [ ] Implement ready event
- [ ] Implement guildCreate event

### 6. Moderation Commands (One by One)
- [ ] Create moderation command base
- [ ] Implement permission checks
- [ ] Create embed builders for mod actions
- [ ] Implement kick command
- [ ] Implement ban command
- [ ] Implement unban command
- [ ] Implement mute command
- [ ] Implement unmute command
- [ ] Implement warn command
- [ ] Implement warnings command
- [ ] Implement modlogs command
- [ ] Implement purge command

### 7. Moderation Logging
- [ ] Create modlog entry on action
- [ ] Setup log channel per server
- [ ] Send embed to log channel
- [ ] DM user when action taken
- [ ] Store all actions in database

### 8. AI Moderation (Basic)
- [ ] Research and select AI moderation API
- [ ] Setup API integration
- [ ] Create message scanning
- [ ] Implement "margin of joke" threshold
- [ ] Log flagged messages
- [ ] Create review system

### 9. Testing & Polish
- [ ] Test all commands
- [ ] Test permission system
- [ ] Test error handling
- [ ] Test database operations
- [ ] Verify logging works
- [ ] Check for edge cases

---

## Dependencies to Install

### Core Dependencies
```bash
npm install discord.js @discordjs/rest @discordjs/builders
npm install @prisma/client
npm install dotenv
npm install winston
```

### Dev Dependencies
```bash
npm install -D typescript @types/node
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint prettier eslint-config-prettier
npm install -D prisma
npm install -D ts-node nodemon
```

---

## File Structure to Create

```
G:/Kreta/
├── src/
│   ├── core/
│   │   ├── client.ts              # Bot client setup
│   │   ├── commandHandler.ts      # Command loading/execution
│   │   ├── eventHandler.ts        # Event loading
│   │   └── registry.ts            # Slash command registration
│   ├── commands/
│   │   ├── moderation/
│   │   │   ├── kick.ts
│   │   │   ├── ban.ts
│   │   │   ├── unban.ts
│   │   │   ├── mute.ts
│   │   │   ├── unmute.ts
│   │   │   ├── warn.ts
│   │   │   ├── warnings.ts
│   │   │   ├── modlogs.ts
│   │   │   └── purge.ts
│   │   └── general/
│   │       └── ping.ts            # Test command
│   ├── events/
│   │   ├── ready.ts               # Bot ready event
│   │   ├── messageCreate.ts       # Message handler
│   │   ├── guildCreate.ts         # New guild join
│   │   └── interactionCreate.ts   # Slash command handler
│   ├── database/
│   │   ├── schema.prisma          # Database schema
│   │   └── client.ts              # Database connection
│   ├── utils/
│   │   ├── logger.ts              # Winston logger
│   │   ├── embed.ts               # Embed builders
│   │   ├── permissions.ts         # Permission checks
│   │   └── constants.ts           # Constants
│   ├── types/
│   │   ├── command.ts             # Command interface
│   │   └── index.ts               # Export all types
│   ├── config/
│   │   └── constants.ts           # Configuration values
│   └── index.ts                   # Entry point
├── prisma/
│   ├── schema.prisma              # Prisma schema (linked)
│   └── migrations/                # Database migrations
├── logs/                          # Log files (generated)
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Example env file
├── .gitignore
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── README.md                      # Basic readme
```

---

## Database Schema (Phase 1)

```prisma
model Guild {
  id                String   @id
  modLogChannelId   String?
  modRoleId         String?
  adminRoleId       String?
  toxicityThreshold Int      @default(70)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model User {
  id        String   @id
  username  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ModLog {
  id           Int      @id @default(autoincrement())
  guildId      String
  caseNumber   Int
  type         String   // warn, kick, ban, mute, unmute, unban
  targetId     String
  moderatorId  String
  reason       String
  evidence     String?
  timestamp    DateTime @default(now())
  duration     Int?     // For temporary actions (in seconds)
  status       String   @default("active") // active, expired, revoked

  @@unique([guildId, caseNumber])
  @@index([guildId, targetId])
}

model Warning {
  id          Int      @id @default(autoincrement())
  guildId     String
  userId      String
  moderatorId String
  reason      String
  timestamp   DateTime @default(now())

  @@index([guildId, userId])
}

model FlaggedMessage {
  id         Int      @id @default(autoincrement())
  messageId  String   @unique
  guildId    String
  userId     String
  content    String
  reason     String   // toxicity, spam, etc.
  score      Float    // AI confidence score
  timestamp  DateTime @default(now())
  reviewed   Boolean  @default(false)
  actionTaken String? // null, deleted, warned, banned, etc.

  @@index([guildId, reviewed])
}
```

---

## Environment Variables Needed

```env
# Discord
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/discord_bot

# Environment
NODE_ENV=development

# Logging
LOG_LEVEL=info

# AI Moderation (if using external API)
MODERATION_API_KEY=your_api_key_here
```

---

## Next Steps After Phase 1

Once Phase 1 is complete:
1. Demo the bot to user
2. Show all moderation commands working
3. Check in with user
4. Discuss which feature to build next:
   - Economy
   - Leveling/XP
   - Games
   - Music
   - Advanced moderation
   - Utility/automation
   - Or something else

---

## Notes

- User wants check-ins after major features
- Don't over-explain during development
- Ask before adding dependencies
- Keep code clean and modular
- Focus on functionality first
- Optimization important but not blocking

---

## Blockers / Issues

None currently

---

## Questions for User

Will ask when relevant:
- Which AI moderation API to use (need to research options first)
- PostgreSQL connection details (or use SQLite for development?)
- Any specific servers to test in?

---

## Progress Log

### 2025-11-11
- ✅ Completed planning phase
- ✅ Created comprehensive documentation files
- ⬜ Starting project initialization next
