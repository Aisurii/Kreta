# Discord Bot - Complete Project Plan

## Project Overview
Building a comprehensive, innovative Discord bot in TypeScript with extensive features including moderation, economy, leveling, games, music, and unique social features.

## Technology Stack
- **Language**: TypeScript (user prefers over Python for performance)
- **Discord Library**: discord.js v14
- **Database**: PostgreSQL with Prisma ORM
- **Runtime**: Node.js
- **Code Quality**: ESLint + Prettier

## Development Philosophy
- **Approach**: Incremental - Core first, then features one by one
- **Code Style**: Clean code with strategic comments, modular organization
- **Communication**: Show completed modules, check in after major features
- **Decision Making**: Choose best approach when clear, ask when close call
- **Priority**: Functionality first, optimization during but not blocking
- **Testing**: Optional, test what makes sense
- **Dependencies**: Ask before adding, explain why

---

## PHASE 1: Core Foundation + Basic Moderation
**Status**: In Progress

### Core Components
1. Project initialization (package.json, tsconfig, dependencies)
2. Bot client setup with discord.js
3. Command handler (slash + prefix fallback)
4. Event system
5. Database setup (Prisma + PostgreSQL)
6. Logging utility (winston)
7. Configuration system
8. Error handling

### Basic Moderation
- Commands: kick, ban, unban, mute, unmute, warn, warnings, modlogs, purge
- Logging all actions to database
- DM notifications
- Permission system (admin/mod/user tiers, expandable to custom roles later)
- Rich embeds

### AI Moderation (Basic)
- Toxic language detection
- Spam detection
- "Margin of joke" setting (strictness 1-10)
- Server-specific sensitivity
- Log flagged messages (detection only, no auto-action yet)

---

## FUTURE PHASES (Approved Features)

### Economy System
**Server-specific economy**
- Custom currency names per server
- Earning methods:
  - Messages
  - Voice time
  - Daily rewards
  - Gambling
  - Jobs
- Spending options:
  - Roles
  - Custom perks
  - Items
  - Profile customization
- User-to-user trading
- Balance, inventory, shop commands

### Leveling/XP System
- Gain XP from: messages, voice, reactions, events
- Level-based role rewards (auto-assign)
- Prestige system (reset with bonuses)
- Leaderboards (daily/weekly/all-time)
- XP boosters/multipliers
- Custom XP rates per server

### Games (Multiple Categories)
- **Casino**: Blackjack, poker, slots, roulette, coinflip
- **RPG/Battle**: Fight monsters, collect items, level up characters
- **Trivia**: Multiple categories, difficulty levels
- **Word Games**: Hangman, word scramble, typing speed
- **Image Games**: Guess the image, meme generator
- **Social Games**: Truth or dare, would you rather, ship calculator
- **Economy Games**: Stock market sim, shops, item trading
- **Idle/Clicker**: Passive income generation
- **Multiplayer Battles**: PvP duels, tournaments
- Integration with economy (bet currency)
- Achievement system

### Music System
- Sources: YouTube, Spotify, SoundCloud, direct links
- Queue management
- Playlists and favorites
- DJ role controls
- Lyrics display
- NO audio effects/filters (user declined)

### Advanced Moderation
- Auto-detect toxic messages, spam, raids
- Smart warning system learning user behavior
- Customizable automod rules per server
- Advanced logging with search/filters
- Temporary mutes/bans with auto-expire
- Case management (track warnings, appeals)
- Raid protection modes
- **EVENTUAL**: Customizable punishment progression (not priority)

### Utility & Automation
- Welcome/goodbye messages (custom per server)
- Auto-roles (on join, reaction roles, level-based)
- Scheduled announcements/reminders
- Ticket system for support
- Custom commands (admin-created)
- Embed builder
- Tag/snippet system
- **NO auto-purge old messages** (user declined)

### Social Features
- User profiles (bio, badges, stats)
- Reputation/karma system
- Server analytics (most active users, peak times, growth)
- Birthday tracking/celebrations
- Custom user titles/flairs

### Voice Features
- Voice XP tracking
- Voice channel stats/analytics
- TTS commands (text-to-speech)

---

## INNOVATIVE FEATURES (High Priority)

### Dynamic Events System
**THIS IS A KEY DIFFERENTIATOR**
- Event triggers: Time-based, activity-based, random, admin-triggered
- Event types to explore:
  - Boss Raids: Server teams up to defeat boss, earn rewards
  - Treasure Hunts: Clues posted, first to solve wins
  - Competitions: Most XP/currency in timeframe
  - Trivia Tournaments: Bracket-style
  - Scavenger Hunts: React to messages, complete tasks
  - Server vs Server: Multi-server competitions
- User needs to answer: specific event types they want

### Social Graph Visualization
**UNIQUE FEATURE**
- Generate image showing user interaction patterns
- Stats: "most replied to", "best friends", "server clusters"
- Privacy controls (opt-in/opt-out)

### Content Curation System
**VERY UNIQUE - "FREAKY/DUMB MESSAGE" TRACKING**
- AI analyzes sentiment/content type
- Categories: Freaky, Dumb, Wholesome, Funny, Controversial, Deep, Chaotic
- Display: Weekly digest, leaderboards, searchable archive
- User reactions to nominate messages
- Server-specific content highlights

### "Margin of Joke" System
**INNOVATIVE MODERATION**
- Slider/setting for AI moderation strictness
- Server admins define acceptable banter vs toxicity
- Train on server-specific context over time
- Whitelist certain words/phrases okay in context
- Learning system adapts to server culture

---

## EVENTUAL FEATURES (Lower Priority)

### AI Companion
- Context-aware chatbot
- Learns server inside jokes/culture
- NOT CHOSEN YET - too far out

### Cross-Server Alliance
- Multiple servers form alliances
- Share economies/events
- Needs more discussion

### Progressive Unlocks
- Server unlocks bot features as community grows
- Gamification of server growth

### Voice AI
- Transcription
- Summaries of voice discussions
- May be complex

### Workflow Builder
- Visual interface for automation flows
- Very complex, far future

---

## DASHBOARD PLANS

### Developer Dashboard (Priority 1)
- For bot owner (user) to manage bot
- Monitor all servers
- View analytics
- Manage global settings

### Server Admin Dashboard (Priority 2 - Way Later)
- For server owners who add bot
- Configure bot settings for their server
- View server-specific analytics
- Toggle features on/off

---

## CONFIGURATION & CUSTOMIZATION

### Server Admin Controls
- Toggle entire feature categories (disable games, economy, etc.)
- Custom currency names
- Custom XP rates and level requirements
- Language/locale support (consider multi-language)
- Permission customization (simple now, expandable)

### Command System
- **ONLY**: Slash commands (/command)
- NO prefix commands - user decided against them
- Modern, clean approach with Discord's native UI

---

## TECHNICAL ARCHITECTURE

### Current Phase: Standard
- Single bot process
- Monolithic but modular structure

### Future Consideration: Advanced
- If bot scales, consider:
  - Microservices architecture
  - Separate API server
  - Web dashboard backend
  - Caching layers (Redis)
  - Queue systems for heavy tasks
  - Bot sharding for multiple servers

### Folder Structure
```
project-root/
├── src/
│   ├── core/              # Core bot functionality
│   │   ├── client.ts      # Bot client setup
│   │   ├── commandHandler.ts
│   │   ├── eventHandler.ts
│   │   └── ...
│   ├── commands/          # All command modules
│   │   ├── moderation/    # Moderation commands
│   │   ├── economy/       # Economy commands (future)
│   │   ├── leveling/      # Level/XP commands (future)
│   │   ├── games/         # Game commands (future)
│   │   ├── music/         # Music commands (future)
│   │   └── utility/       # Utility commands (future)
│   ├── events/            # Discord event handlers
│   │   ├── messageCreate.ts
│   │   ├── guildMemberAdd.ts
│   │   └── ...
│   ├── database/          # Database layer
│   │   ├── schema.prisma  # Prisma schema
│   │   └── client.ts      # DB connection
│   ├── utils/             # Utility functions
│   │   ├── logger.ts      # Winston logger
│   │   ├── embed.ts       # Embed builders
│   │   └── ...
│   ├── types/             # TypeScript types
│   │   └── ...
│   ├── config/            # Configuration
│   │   └── constants.ts
│   └── index.ts           # Entry point
├── .env                   # Environment variables
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── .claude/               # Claude notes (this folder)
    ├── PROJECT_PLAN.md
    ├── DEV_NOTES.md
    ├── FEATURES_BACKLOG.md
    └── CURRENT_PHASE.md
```

---

## EXTERNAL INTEGRATIONS (TBD)
User asked about integrations - need to discuss:
- Weather APIs
- Crypto prices
- Gaming stats (Steam, Riot, etc.)
- Social media (Twitter, Reddit)
- AI services (for companion feature later)

---

## QUESTIONS TO ASK LATER

### Dynamic Events
- Specific event types they want prioritized
- How rewards should work
- Server vs Server mechanics

### Games
- Priority order of game types
- How deep should RPG system be
- Multiplayer game specifics

### Content Curation
- Exact categories for message curation
- How should AI classify messages
- Privacy/opt-out considerations

### Social Graph
- What specific metrics to show
- How to visualize (what library)
- Update frequency

---

## NOTES & DECISIONS

### Why PostgreSQL over MongoDB?
- Relational data (users, guilds, logs) benefits from SQL
- Complex queries for analytics
- Prisma provides excellent TypeScript support
- Better for transactional data (economy system)

### Why Slash Commands Primary?
- Discord's future direction
- Better UX (built-in UI, autocomplete)
- Type safety
- Prefix as fallback for users who prefer it

### Why Prisma ORM?
- Type-safe database queries
- Excellent TypeScript integration
- Auto-generates types from schema
- Easy migrations
- Great developer experience

### Permission System Evolution
- Start simple: Admin, Mod, User
- Database design allows expansion to custom roles
- Can add per-command permission overrides later

---

## USER PREFERENCES SUMMARY

**Development Style**
- Focus on functionality first
- Keep optimization in mind but don't block on it
- Clean code with strategic comments
- Modular, well-organized structure
- Show completed modules, not step-by-step

**Communication**
- Check in after big features
- Don't explain unless asked
- Provide suggestions/ideas freely
- Ask about dependencies with explanation

**Decision Making**
- Pick best approach when clear advantage
- Ask when it's a close call
- Always explain reasoning

**Code Quality**
- Clean, readable code
- Not overly concerned about verbose vs concise
- NO unoptimized code
- Proper modularization
- Clear folder organization

---

## CURRENT STATUS
- Phase: Planning Complete
- Next: Begin Phase 1 implementation
- Starting with: Project setup and core foundation
