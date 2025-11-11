# Features Backlog - To Implement After Phase 1

## Priority Order (TBD with User)
After Phase 1 (Core + Basic Moderation), user will decide which to tackle next.

---

## Economy System
**Complexity**: High
**Dependencies**: Core, Database

### Commands
- `/balance [user]` - Check balance
- `/daily` - Claim daily reward
- `/weekly` - Claim weekly reward
- `/pay <user> <amount>` - Transfer currency
- `/leaderboard economy` - Top richest users
- `/shop` - View items for sale
- `/buy <item>` - Purchase item
- `/inventory [user]` - View owned items
- `/use <item>` - Use an item
- `/trade <user>` - Initiate trade
- `/work` - Do job for money
- `/crime` - Risk/reward money earning
- `/rob <user>` - Steal from another user
- `/gamble <amount>` - Various gambling games
- `/deposit <amount>` - Move cash to bank
- `/withdraw <amount>` - Move bank to cash

### Features
- Server-specific economy (separate per guild)
- Custom currency names per server
- Configurable earn rates
- Shop system with admin-definable items
- Item effects (XP boost, role grants, cosmetics)
- Trading system between users
- Transaction logging
- Anti-cheat measures
- Cooldown system
- Success/fail rates configurable

### Database Schema
```prisma
UserEconomy {
  userId, guildId
  balance, bank
  inventory (JSON)
  lastDaily, lastWeekly, lastWork
  stats (lifetimeEarned, lifetimeSpent)
}

EconomyItem {
  id, guildId
  name, description, price
  type (role, boost, cosmetic, consumable)
  effect (JSON)
  stock (unlimited or limited)
}

Transaction {
  id, guildId, userId
  type (earn, spend, transfer)
  amount, reason
  timestamp
}
```

---

## Leveling / XP System
**Complexity**: Medium
**Dependencies**: Core, Database

### Commands
- `/rank [user]` - Show user's rank card
- `/leaderboard xp` - Top users by XP
- `/levels` - Show level roles/rewards
- `/setxp <user> <amount>` - Admin: Set user XP
- `/resetlevels` - Admin: Reset all levels
- `/levelroles add <role> <level>` - Admin: Add level reward
- `/levelroles remove <role>` - Admin: Remove level reward

### Features
- XP from messages (15-25 per message, 60s cooldown)
- XP from voice time (10-20 per minute)
- XP from reactions (configurable)
- Customizable XP formula per server
- Level-up announcements (with on/off toggle)
- Role rewards at milestones
- Prestige system (reset for bonuses)
- XP multipliers (events, boosts, purchased)
- Leaderboards (daily/weekly/all-time)
- Beautiful rank cards with customization
- Import from MEE6/Tatsu (migration tool)

### Database Schema
```prisma
UserLevel {
  userId, guildId
  xp, level, prestige
  totalMessages, totalVoiceMinutes
  lastXpGain
  multiplier
  cardBackground, cardColor
}

LevelRole {
  guildId, roleId, level
}

XpSettings {
  guildId
  xpPerMessage, xpPerVoiceMinute
  cooldown
  formula (JSON)
  levelUpChannel
  announceLevelUp
}
```

---

## Games System
**Complexity**: Very High
**Dependencies**: Economy (for betting)

### Casino Games
- `/blackjack <bet>` - Play blackjack
- `/slots <bet>` - Slot machine
- `/coinflip <bet> <choice>` - Flip coin
- `/roulette <bet> <choice>` - Roulette wheel
- `/dice <bet>` - Dice game
- `/poker` - Multi-player poker

### RPG System
- `/adventure` - Start adventure
- `/battle <monster>` - Fight monsters
- `/inventory rpg` - View RPG items/equipment
- `/equip <item>` - Equip item
- `/craft <item>` - Craft items
- `/quest` - View available quests
- `/dungeon` - Enter dungeon (party-based)
- `/boss` - Server-wide boss battles
- Character stats, equipment, progression

### Trivia Games
- `/trivia [category] [difficulty]` - Start trivia
- Multiple categories
- Difficulty levels
- Leaderboards

### Word Games
- `/hangman` - Start hangman
- `/unscramble` - Unscramble words
- `/typerace` - Typing speed competition

### Social Games
- `/truthordare [user]`
- `/wouldyourather`
- `/ship <user1> <user2>` - Ship calculator
- `/8ball <question>` - Magic 8 ball

### Idle/Clicker Game
- `/farm` - Passive income farming game
- `/upgrade` - Upgrade farm
- `/harvest` - Collect resources

### PvP System
- `/duel <user>` - Challenge to duel
- `/tournament create` - Create tournament
- Turn-based combat system
- Betting on matches

### Database Schema
```prisma
// Casino: Use economy transactions
// RPG: Separate character system
RpgCharacter {
  userId, guildId
  class, level, xp
  health, attack, defense, speed
  inventory (JSON)
  equipment (JSON)
  stats, achievements
}

RpgItem, RpgMonster, RpgQuest...
// Trivia: Use external API + cache
// Games are complex, will need many tables
```

---

## Music System
**Complexity**: High
**Dependencies**: External libraries (@discordjs/voice, play-dl or similar)

### Commands
- `/play <song>` - Play song
- `/pause` - Pause playback
- `/resume` - Resume playback
- `/skip` - Skip song
- `/stop` - Stop and clear queue
- `/queue` - View queue
- `/nowplaying` - Current song info
- `/volume <0-100>` - Adjust volume
- `/loop [song|queue|off]` - Loop settings
- `/shuffle` - Shuffle queue
- `/remove <position>` - Remove from queue
- `/move <from> <to>` - Move song in queue
- `/seek <timestamp>` - Seek to timestamp
- `/lyrics [song]` - Show lyrics
- `/playlist save <name>` - Save current queue
- `/playlist load <name>` - Load saved playlist
- `/favorites add` - Add to favorites
- `/favorites list` - View favorites

### Features
- Multi-source support (YouTube, Spotify, SoundCloud)
- DJ role system
- Vote skip option
- 24/7 mode
- Queue persistence
- Playlists per user
- Favorites system
- Lyrics fetching
- NO audio filters (user declined)

### Need to Ask User
- Which music library to use (play-dl, discord-player, ytdl-core)
- Max queue length per server
- Voting thresholds for skip

---

## Advanced Moderation
**Complexity**: High
**Dependencies**: Basic moderation, AI APIs

### Additional Commands
- `/automod configure` - Setup automod rules
- `/automod toggle <rule>` - Enable/disable rule
- `/raid` - Enable raid mode
- `/tempban <user> <duration>` - Temporary ban
- `/tempmute <user> <duration>` - Timed mute
- `/slowmode <duration>` - Set slowmode
- `/lockdown [channel]` - Lock channel
- `/unlock [channel]` - Unlock channel
- `/case <number>` - View case details
- `/case edit <number> <reason>` - Edit case
- `/history <user>` - Full mod history
- `/appeal <case>` - Submit appeal (future)

### AI Moderation Features
- Toxic language detection (Perspective API or similar)
- Spam detection (repetition, caps, emoji spam)
- Raid detection (mass joins, coordinated spam)
- Phishing link detection
- NSFW content detection
- Smart context analysis
- Learning system (flag false positives)
- Server-specific training over time

### "Margin of Joke" Implementation
- Per-server strictness setting (0-10)
- Whitelisted phrases per server
- Trusted user bypass
- Channel-specific thresholds
- Context learning

### Automod Rules (Configurable)
- Mass mention (>X mentions)
- Spam (repeated messages)
- Caps lock (>X% caps)
- Emoji spam
- Link spam
- Invite link spam
- Zalgo text
- Banned words/regex
- Actions: delete, warn, mute, kick, ban

### Database Schema
```prisma
AutomodRule {
  guildId, type
  enabled, threshold
  action (delete, warn, mute, kick, ban)
  exceptions (channels, roles, users)
}

FlaggedMessage {
  messageId, guildId, userId
  content, reason
  score, timestamp
  actionTaken
  falsePositive (can mark)
}

ModCase {
  caseNumber, guildId
  type, targetId, moderatorId
  reason, evidence
  timestamp, duration
  status (active, expired, appealed)
}
```

---

## Utility & Automation
**Complexity**: Medium
**Dependencies**: Core

### Welcome/Goodbye System
- `/welcome set <channel>` - Set welcome channel
- `/welcome message <text>` - Custom welcome message
- `/welcome test` - Test welcome
- `/goodbye set <channel>` - Set goodbye channel
- `/goodbye message <text>` - Custom goodbye
- Embed builder for fancy messages
- Variable support (username, server name, member count, etc.)

### Auto-Roles
- `/autorole add <role>` - Give role on join
- `/autorole remove <role>` - Remove from auto-assign
- `/reactionrole create` - Setup reaction roles
- `/reactionrole add <message> <emoji> <role>`
- Level-based autoroles (from leveling system)

### Reminders & Announcements
- `/remind <time> <message>` - Set reminder
- `/reminders list` - View reminders
- `/reminders delete <id>` - Cancel reminder
- `/announce schedule <channel> <time> <message>`
- Recurring announcements

### Ticket System
- `/ticket create [reason]` - Open support ticket
- `/ticket close [reason]` - Close ticket
- `/ticket add <user>` - Add user to ticket
- `/ticket remove <user>` - Remove from ticket
- Transcript saving
- Category-based tickets

### Custom Commands
- `/customcommand create <name> <response>`
- `/customcommand edit <name> <response>`
- `/customcommand delete <name>`
- `/customcommand list`
- Variable support
- Embed support

### Tag System
- `/tag create <name> <content>`
- `/tag <name>` - Show tag
- `/tag edit <name> <content>`
- `/tag delete <name>`
- `/tag list` - All tags

---

## Social Features
**Complexity**: Medium
**Dependencies**: Leveling system

### User Profiles
- `/profile [user]` - View profile
- `/setbio <text>` - Set bio
- `/badges [user]` - View earned badges
- Profile customization (colors, backgrounds)
- Stats display (messages, voice time, server join date)

### Reputation System
- `/rep <user> [reason]` - Give reputation (once per day)
- `/repleaderboard` - Top reputation
- Reputation tied to trust level

### Birthday System
- `/birthday set <date>` - Set birthday
- `/birthday list` - Upcoming birthdays
- Auto-announcement on birthday
- Birthday role (automatic)

### Server Analytics
- `/stats server` - Server statistics
- `/stats user <user>` - User statistics
- Most active users
- Message/voice trends
- Growth charts
- Peak activity times

---

## Dynamic Events System ⭐
**Complexity**: Very High
**Dependencies**: Economy, Leveling, possibly Games
**THIS IS A KEY DIFFERENTIATOR**

### Need to Discuss With User
- Which event types to prioritize
- How events trigger
- Reward system
- Server vs Server mechanics

### Potential Event Types
1. **Boss Raids** - Server teams up to defeat boss
2. **Treasure Hunts** - Follow clues to find treasure
3. **XP Competitions** - Most XP in timeframe wins
4. **Trivia Tournaments** - Bracket-style trivia
5. **Scavenger Hunts** - Complete tasks around server
6. **Economy Events** - Double XP, sale prices, etc.
7. **Server vs Server** - Multi-server competitions

### Commands
- `/event current` - View active event
- `/event join` - Join event
- `/event leaderboard` - Event standings
- `/event history` - Past events
- `/event create` - Admin: Create custom event
- `/event rewards` - View event rewards

### Database Schema
```prisma
Event {
  id, guildId
  type, status (scheduled, active, completed)
  startTime, endTime
  config (JSON - event-specific settings)
  rewards (JSON)
}

EventParticipant {
  eventId, userId
  score, rank
  rewards (JSON)
}
```

---

## Social Graph Visualization ⭐
**Complexity**: High
**Dependencies**: Message tracking
**UNIQUE FEATURE**

### Need to Research
- Graphing library (d3.js, chart.js, or generate image with canvas)
- Privacy implications
- Performance with large servers

### Commands
- `/socialgraph` - Generate server social graph
- `/connections <user>` - User's connections
- `/serverstats social` - Social metrics

### Features
- Visual graph showing who talks to who
- Metrics: Most replied to, best friends, clusters
- Privacy: Opt-in/opt-out per user
- Anonymized version for server owners
- Update frequency (daily/weekly to avoid spam)

### Database Schema
```prisma
MessageInteraction {
  guildId, userId, targetUserId
  count, lastInteraction
}

SocialGraphCache {
  guildId
  graph (JSON)
  lastGenerated
}
```

---

## Content Curation System ⭐
**Complexity**: Very High
**Dependencies**: AI API
**VERY UNIQUE - "FREAKY/DUMB MESSAGE" TRACKING**

### Need to Discuss With User
- Exact categories they want
- How AI should classify
- Display format
- Voting/nomination system

### Potential Categories
- Freaky
- Dumb
- Wholesome
- Funny
- Controversial
- Deep/Philosophical
- Chaotic
- Out of Context

### Commands
- `/highlight nominate <message_link> <category>`
- `/highlight top <category> [timeframe]`
- `/highlight random <category>`
- `/highlight digest` - Weekly best-of
- `/highlight search <query>`

### Features
- AI analyzes message sentiment/content
- Users can nominate via reactions
- Leaderboard per category
- Weekly digest compilation
- Searchable archive
- Privacy settings

### Database Schema
```prisma
HighlightMessage {
  messageId, guildId, userId
  content, categories (array)
  aiScore, userVotes
  timestamp
}

HighlightVote {
  messageId, userId, category
}
```

---

## Voice Features
**Complexity**: Medium (except Voice AI which is very high)

### Voice XP
- Track time in voice channels
- Award XP per minute
- Must be unmuted
- AFK detection

### Voice Stats
- `/voicestats [user]` - Time in voice
- Per-channel breakdowns
- Leaderboards

### TTS Commands
- `/tts <message>` - Text to speech in voice channel
- Language support
- Rate limiting to prevent abuse

### Voice AI (Far Future)
- Transcription of voice conversations
- Summaries generated
- Very complex, needs research

---

## Developer Dashboard
**Complexity**: Very High
**Dependencies**: Web framework (Express/Fastify), Authentication

### For Bot Owner (User)
- View all servers bot is in
- Global analytics
- Error logs
- Server list with stats
- Manage bot globally
- View database health
- Monitor API usage

### Tech Stack
- Backend: Express.js or Fastify
- Frontend: React or Vue (or server-rendered HTML)
- Auth: OAuth2 or JWT
- Real-time: WebSockets for live updates

---

## Server Admin Dashboard (Much Later)
**Complexity**: Very High
**Dependencies**: Developer dashboard

### For Server Owners
- Configure bot for their server
- Toggle features
- View server analytics
- Manage economy items
- Configure automod
- View mod logs
- Customize messages
- Set permissions

---

## AI Companion (Not Chosen Yet)
**Complexity**: Very High
**Dependencies**: AI API (OpenAI, Anthropic)
**Status**: Mentioned but too far out

### Concept
- Context-aware chatbot
- Learns server inside jokes
- Responds naturally
- Remembers conversations
- Personality per server

### Concerns
- Very expensive (API costs)
- Complex to implement well
- Privacy considerations
- Requires careful prompt engineering

---

## Other Ideas to Explore

### Progressive Unlocks
- Server unlocks bot features as it grows
- Gamification of server growth
- Milestones (member count, message count, etc.)
- Rewards for server growth

### Cross-Server Alliance
- Multiple servers form alliances
- Shared economy/events
- Cross-server leaderboards
- Needs multi-server coordination

### Workflow Builder
- Visual interface for automation
- Like Zapier but for Discord
- Very complex
- Far future

### Voice AI
- Transcription
- Meeting summaries
- Complex and expensive

---

## Questions to Ask User Later

### Dynamic Events
- [ ] Which event types to prioritize?
- [ ] How should rewards work?
- [ ] Server vs Server mechanics?
- [ ] Event frequency?

### Games
- [ ] Priority order of game types?
- [ ] How deep should RPG system be?
- [ ] Multiplayer game details?

### Content Curation
- [ ] Exact categories?
- [ ] AI classification method?
- [ ] Privacy/opt-out?

### Social Graph
- [ ] What metrics to show?
- [ ] Visualization style?
- [ ] Update frequency?

### Music
- [ ] Which library to use?
- [ ] Max queue length?
- [ ] Vote skip thresholds?

### External Integrations
- [ ] Weather API?
- [ ] Crypto prices?
- [ ] Gaming stats (Steam, Riot)?
- [ ] Social media (Twitter, Reddit)?
- [ ] AI service for companion?

---

## Implementation Order (Recommended)
After Phase 1, suggest this order:
1. **Leveling/XP** - Foundation for progression
2. **Economy** - Needed for games
3. **Utility/Automation** - High value, lower complexity
4. **Games** - Build on economy
5. **Advanced Moderation** - Enhance phase 1
6. **Music** - Standalone, can be parallel
7. **Dynamic Events** - Requires economy + leveling
8. **Social Features** - Enhancement layer
9. **Social Graph** - Requires data collection over time
10. **Content Curation** - Requires AI + data
11. **Dashboards** - Quality of life
12. **AI Companion** - If ever

But ultimately, user decides after Phase 1!
