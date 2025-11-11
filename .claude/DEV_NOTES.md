# Development Notes & Technical Decisions

## Architecture Decisions

### Command Handler Design
**Decision**: Slash commands ONLY (no prefix commands)
**Reasoning**:
- Slash commands are Discord's future (better UX, autocomplete, type safety)
- Cleaner codebase without dual-system complexity
- User explicitly decided against prefix commands
- Modern, professional approach

**Implementation**:
- Base Command class with `execute()` method
- SlashCommandBuilder for registering slash commands
- No message parsing needed
- Simpler, more maintainable code

### Database Architecture

**Choice**: PostgreSQL with Prisma ORM

**Why PostgreSQL over others**:
- SQLite: Too limited for production, no concurrent writes
- MongoDB: Overkill for our relational data structure
- MySQL: PostgreSQL has better JSON support, more features
- PostgreSQL: Best balance of features, performance, reliability

**Why Prisma**:
- Type-safe database client (TypeScript first-class)
- Auto-generates types from schema
- Excellent migration system
- Developer experience is top-tier
- `prisma studio` for visual database management

**Schema Design Philosophy**:
- Normalized for core data (users, guilds)
- Denormalized where performance matters (leaderboards)
- Use JSON columns for flexible config per server
- Soft deletes for audit trail (don't actually delete mod logs)

### Permission System

**Phase 1**: Simple three-tier system
- Admin (administrator permission)
- Moderator (configurable role per server)
- User (everyone)

**Future Expansion** (database ready for):
- Custom role-based permissions
- Per-command permission overrides
- Permission groups/presets
- Hierarchy system

**Implementation**:
```typescript
// Database schema includes:
- Guild.modRoleId (which role is "mod")
- Guild.adminRoleId (which role is "admin", fallback to Discord admin)
- CommandPermissions table (future: per-command overrides)
```

### Event System Architecture

**Design**: Event-driven with handler registration
```typescript
// Each event in separate file
// events/messageCreate.ts
export default {
  name: 'messageCreate',
  once: false,
  execute: async (message) => { ... }
}
```

**Benefits**:
- Easy to add new event handlers
- Clean separation of concerns
- Can enable/disable handlers per server
- Allows for event middleware (logging, rate limiting)

### Logging Strategy

**Library**: Winston

**Log Levels**:
- `error`: Critical failures, exceptions
- `warn`: Recoverable issues, deprecated usage
- `info`: Important events (bot started, command executed)
- `debug`: Detailed information for troubleshooting
- `verbose`: Everything (database queries, API calls)

**Log Destinations**:
- Console (colored, formatted)
- File: `logs/error.log` (errors only)
- File: `logs/combined.log` (everything)
- Future: Database table for critical errors
- Future: Discord webhook for prod errors

### Configuration Management

**Approach**: Multi-layer config
1. `.env` - Secrets (bot token, database URL)
2. `config/constants.ts` - Default values, bot-wide settings
3. Database `Guild` table - Per-server configuration
4. Database `Settings` table - Flexible key-value storage

**Example**:
```typescript
// .env
BOT_TOKEN=...
DATABASE_URL=...
NODE_ENV=development

// config/constants.ts
export const DEFAULT_PREFIX = '!';
export const EMBED_COLOR = '#5865F2';

// Database per guild
{
  guildId: '...',
  prefix: '?',  // Override default
  modLogChannelId: '...',
  ...
}
```

---

## Code Organization Patterns

### Command Structure
Each command is a class/object with:
- `data`: SlashCommandBuilder (name, description, options)
- `aliases`: Array of prefix command aliases
- `permissions`: Required permission level
- `execute()`: Main command logic
- `autocomplete()`: Optional autocomplete handler

### Error Handling Strategy
- Never let errors crash the bot
- Try-catch around all command executions
- Log errors with context (user, guild, command)
- User-friendly error messages (don't expose internals)
- DM bot owner on critical errors (optional)

### Database Query Patterns
- Always use transactions for multi-step operations
- Batch queries where possible (avoid N+1)
- Use `include` carefully (don't over-fetch)
- Cache frequently accessed data (guild configs)
- Optimize indexes for common queries

---

## TypeScript Configuration

### Compiler Options
```json
{
  "strict": true,              // Maximum type safety
  "esModuleInterop": true,     // Better module compatibility
  "skipLibCheck": true,        // Faster compilation
  "resolveJsonModule": true,   // Import JSON files
  "outDir": "dist",            // Output directory
  "rootDir": "src",            // Source directory
  "target": "ES2022",          // Modern JavaScript
  "module": "commonjs",        // Node.js compatibility
}
```

### Type Safety Goals
- No `any` types (use `unknown` if needed)
- Strict null checks
- Interface over type where appropriate
- Discriminated unions for complex types
- Utility types (Partial, Pick, Omit) for DRY

---

## Moderation System Design

### Action Logging
Every mod action stores:
- Action type (warn, kick, ban, mute, etc.)
- Moderator (who did it)
- Target user (who it was done to)
- Reason
- Timestamp
- Evidence (message links, attachments)
- Case number (auto-increment per guild)
- Duration (for temporary actions)
- Status (active, expired, revoked)

### Warning System
- Warnings never expire (permanent record)
- Configurable thresholds for auto-actions (future)
- Appeals system (future)
- Warning categories (spam, toxicity, etc.)

### AI Moderation Architecture

**Phase 1** (Basic Detection):
- Use external API (Perspective API, or similar)
- Simple keyword matching for obvious cases
- Store flagged messages for review
- No auto-action, only logging

**Future Phases**:
- Machine learning model trained on server data
- Context-aware detection
- False positive learning
- Auto-action for clear violations
- "Margin of joke" affects threshold

**"Margin of Joke" Implementation**:
```typescript
// Guild setting: toxicityThreshold (0-100)
// 0 = extremely strict, 100 = very lenient
// Default: 70

// AI returns toxicity score 0-100
// Action taken if: score > threshold

// Server-specific overrides:
// - Whitelisted phrases (stored in DB)
// - Trusted users (lower threshold)
// - Specific channels (e.g., NSFW has higher threshold)
```

---

## Economy System Architecture (Future)

### Currency Storage
```prisma
model UserEconomy {
  userId    String
  guildId   String
  balance   Int      @default(0)
  bank      Int      @default(0)
  inventory Json     @default("[]")
  // ... more fields
}
```

### Transaction Logging
- Every currency change logged
- Prevents cheating/duplication
- Allows rollback if needed
- Analytics on economy health

### Anti-Cheat Measures
- Rate limiting on earn commands
- Cooldowns per user per command
- Detect impossible balances
- Monitor for exploits

---

## Leveling System Architecture (Future)

### XP Calculation
```typescript
// Base XP per message: 15-25 (random to prevent spam)
// Cooldown: 60 seconds per user
// Voice XP: 10-20 per minute (must be unmuted)

// Multipliers:
// - Boost multiplier (if server is boosted)
// - Event multiplier (during special events)
// - Role multiplier (premium roles)
// - Personal multiplier (purchased with currency)
```

### Level Calculation
```typescript
// XP needed for level N: 5 * (N ^ 2) + 50 * N + 100
// Makes leveling progressively harder
// Can be customized per server
```

### Role Rewards
- Auto-assign role at specific level
- Configurable per server
- Multiple roles at different milestones
- Remove lower tier role when higher earned (optional)

---

## Performance Considerations

### Caching Strategy
- Guild configs cached in memory (Redis in future)
- User XP cached during active sessions
- Leaderboards regenerated every X minutes
- Command cooldowns in memory

### Rate Limiting
- Per-user command cooldowns
- Global rate limit for expensive operations
- API request pooling
- Batch database updates

### Optimization Priorities
1. **Now**: Don't write obviously slow code
2. **After MVP**: Profile and optimize hot paths
3. **At Scale**: Implement caching, sharding, microservices

---

## Testing Strategy

### What to Test
- Critical paths (mod actions, economy transactions)
- Database operations (ensure no data loss)
- Permission checks (security critical)
- Command parsing
- Not testing: Simple getters, obvious logic

### Testing Tools (when implemented)
- Jest for unit tests
- Integration tests for database
- Mock Discord client for command tests

---

## Security Considerations

### Input Validation
- Sanitize all user input
- Validate IDs (user, channel, role)
- Prevent SQL injection (Prisma handles this)
- Rate limit to prevent abuse

### Permission Checks
- Always verify before mod actions
- Check bot has required permissions
- Prevent privilege escalation
- Audit log all sensitive operations

### Token Security
- Never commit .env file
- .gitignore includes secrets
- Use environment variables
- Rotate tokens periodically

---

## Dependency Management

### Core Dependencies
- `discord.js` (^14.x) - Discord API wrapper
- `@prisma/client` - Database ORM
- `dotenv` - Environment variables
- `winston` - Logging
- `typescript` - Type safety

### Additional Dependencies (as needed)
- AI moderation API SDK (TBD which service)
- Music libraries (when implementing music)
- Image processing (for social graph)
- Graph visualization (for social graph)
- Web framework (for dashboard) - Express or Fastify
- Always ask user before adding

---

## Development Workflow

### Branch Strategy
- No git setup yet, but when created:
- `main` - Production ready
- `develop` - Active development
- `feature/*` - New features
- `fix/*` - Bug fixes

### Deployment
- Not configured yet
- Future: Docker container
- Future: CI/CD pipeline
- Future: Automated tests on PR

---

## Known Technical Debt
(Track things to revisit later)

- [ ] None yet - clean slate!

---

## Performance Benchmarks
(Track as we build)

- [ ] Bot startup time: TBD
- [ ] Average command response: TBD
- [ ] Database query time: TBD
- [ ] Memory usage: TBD

---

## API Rate Limits to Remember

### Discord API
- 50 requests per second per bot
- 10,000 per 10 minutes per bot globally
- Message content requires privileged intent
- Slash commands auto-handled by Discord

### Database
- PostgreSQL can handle thousands of queries/sec
- We'll be nowhere near limits initially
- Monitor slow queries

---

## Future Technical Considerations

### When to Scale Up
- Signs we need microservices:
  - Bot serving 1000+ servers
  - Response times degrading
  - Single point of failure concerns
  - Need to scale components independently

### Sharding
- Discord.js supports sharding built-in
- Needed when bot reaches 2500 servers
- Splits bot across multiple processes
- Implement when necessary, not premature

### Monitoring
- Future: Prometheus + Grafana
- Track: Uptime, command usage, error rates
- Alerts for critical issues
- Analytics dashboard

---

## Notes to Self

- User wants to check in after major features - do that
- Don't over-explain, just build
- Ask about dependencies with reasoning
- Clean, modular code is priority
- Focus on functionality first
- Keep optimization in mind but don't block on it
- Show completed modules, not incremental progress
- Suggest ideas freely
- Pick best approach when clear, ask when close

## Remember
- User doesn't like Python (slow)
- User wants detailed notes (this file)
- User wants TODO comments in code
- User wants modular structure with clear folders
- User is open to suggestions
