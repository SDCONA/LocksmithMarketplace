# 🎮 TRANSPONDER MASTER - Complete Game System Documentation

**Created:** January 11, 2026  
**Version:** 1.0.0  
**Status:** Initial Development  
**Last Updated:** January 12, 2026

---

## 🐛 BUG FIXES LOG (AI NOTES)

### Jan 12, 2026 - Critical Fixes Applied
1. **Double URL Prefix Bug** - Routes had `/make-server-a7e285ba` prefix twice. Fixed by removing prefix from route definitions in transponder-game-routes.tsx
2. **Practice Mode = 10 Questions** - Changed maxQuestions logic to limit practice mode to 10 questions (was defaulting to 15)
3. **Stale Closure Bug** - setTimeout was using old stats variable. Fixed by unconditionally calling fetchQuestion() after 2s (game over handled separately)
4. **Question Randomization** - Increased query limit from 50→100 and wrong answers pool from 100→200 for better variety

---

## 📊 TABLE OF CONTENTS

1. [Game Overview](#game-overview)
2. [Database Schema](#database-schema)
3. [Centralized Transponder Database](#centralized-transponder-database)
4. [Game Mechanics](#game-mechanics)
5. [Scoring System](#scoring-system)
6. [Level Progression](#level-progression)
7. [Leaderboard System](#leaderboard-system)
8. [API Endpoints](#api-endpoints)
9. [Frontend Components](#frontend-components)
10. [Future Enhancements](#future-enhancements)

---

## 🎯 GAME OVERVIEW

**Transponder Master** is an educational quiz game that tests locksmith knowledge using the Locksmith Marketplace's comprehensive 77-year vehicle transponder database.

### Core Concept
- Players answer multiple-choice questions about which transponder fits specific vehicles
- Compete on global leaderboards
- Progress through 15 difficulty levels
- Earn achievements and track statistics
- **Complete database:** 2000+ vehicle entries across 47 brands (cars + motorcycles)

### Game Modes
1. **Classic Mode** - Standard 15-question game
2. **Daily Challenge** - Same questions for all players, one attempt per day
3. **Practice Mode** - No timer, no penalties, learning focused
4. **Endless Mode** - Play until 3 wrong answers
5. **Brand Expert Mode** - Focus on one manufacturer

---

## 💾 DATABASE SCHEMA

### ✅ ARCHITECTURAL DECISION: Centralized Transponder Database

**Date:** January 11, 2026  
**Decision:** Move ALL transponder data from hardcoded component files into centralized `transponder_fitments` table

**Why This Matters:**
- **Before:** 47 separate component files with hardcoded arrays (~2000+ entries total)
- **After:** Single database table with indexed queries
- **Benefit:** Game question generation becomes trivial, analytics possible, admin panel can manage data

**Data Extraction:**
- ✅ **47 brands** extracted from existing TransponderPage components
- ✅ **2000+ vehicle entries** (BMW, Audi, Ford, Mercedes, Toyota, Honda, Volkswagen, Nissan, Chevrolet, and 38 more brands)
- ✅ **Automated extraction scripts** created in `/scripts` folder to generate complete SQL
- ✅ **Intelligent difficulty assignment** (1-5 based on transponder complexity)
- ✅ **Year range parsing** (handles "2004–2010", "2015+", etc.)

**⚠️ IMPORTANT - Data Generation:**
The SQL data file is NOT manually created. Instead, run the extraction script:

```bash
# Generate the complete SQL file with all 2000+ entries
node scripts/generate_transponder_sql.js

# This creates: TRANSPONDER_FITMENTS_DATA_ALL_BRANDS.sql
# Then run that SQL file in Supabase SQL Editor
```

See `/scripts/README.md` for detailed instructions.

---

### Tables Created

#### **TABLE 8: `transponder_fitments` (NEW - Primary Data Source)**
The centralized vehicle transponder reference database used for game question generation.

```sql
CREATE TABLE transponder_fitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vehicle Information
  vehicle_make VARCHAR(50) NOT NULL,           -- "BMW", "Audi", "Ford"
  vehicle_model VARCHAR(100) NOT NULL,         -- "3-Series (F30)", "A4 / S4"
  vehicle_years VARCHAR(30) NOT NULL,          -- "2012-2015" or "2014+"
  year_start INTEGER NOT NULL,                 -- 2012
  year_end INTEGER,                            -- 2015 (NULL if "2014+")
  platform_code VARCHAR(50),                   -- "F30", "E90" (optional)
  
  -- Transponder Information  
  transponder_type VARCHAR(100) NOT NULL,      -- "ID49 / Hitag Pro"
  oem_key VARCHAR(100),                        -- OEM key part number (optional)
  
  -- Game Metadata
  category VARCHAR(20) DEFAULT 'car',          -- 'car' or 'motorcycle'
  difficulty_level INTEGER DEFAULT 1,          -- 1 (easy) to 5 (expert)
  
  -- Analytics Tracking
  times_asked INTEGER DEFAULT 0,               -- How many times shown in game
  times_correct INTEGER DEFAULT 0,             -- How many times answered correctly
  accuracy_rate DECIMAL(5,2),                  -- Auto-calculated percentage
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_difficulty CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  CONSTRAINT valid_category CHECK (category IN ('car', 'motorcycle'))
);

-- Indexes for fast game queries
CREATE INDEX idx_fitments_make ON transponder_fitments(vehicle_make);
CREATE INDEX idx_fitments_difficulty ON transponder_fitments(difficulty_level);
CREATE INDEX idx_fitments_year_range ON transponder_fitments(year_start, year_end);
CREATE INDEX idx_fitments_category ON transponder_fitments(category);
CREATE INDEX idx_fitments_make_difficulty ON transponder_fitments(vehicle_make, difficulty_level);
CREATE INDEX idx_fitments_random ON transponder_fitments(id); -- For RANDOM() queries
```

**Sample Data:**

| vehicle_make | vehicle_model | vehicle_years | year_start | year_end | transponder_type | difficulty |
|--------------|---------------|---------------|------------|----------|------------------|------------|
| BMW | 3-Series (F30) | 2012-2019 | 2012 | 2019 | ID49 / Hitag Pro | 2 |
| BMW | 3-Series (E90) | 2005-2012 | 2005 | 2012 | ID46 / PCF7936 | 2 |
| Audi | A4 / S4 | 2008-2016 | 2008 | 2016 | PCF7945AC / Hitag Extended | 3 |
| Ford | Mustang | 2015+ | 2015 | NULL | Philips Crypto 3 / Hitag Pro / ID47 | 2 |
| BMW | R1200GS | 2012-2017 | 2012 | 2017 | Texas 4D | 4 |

**RLS Policies:**
```sql
-- All authenticated users can read (needed for game)
CREATE POLICY "Users can view transponder fitments"
  ON transponder_fitments FOR SELECT
  USING (true);

-- Only admin can insert/update/delete
-- (Regular users have no write policies)
```

---

#### 1. `game_sessions`
Tracks each individual game played by users.

```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL DEFAULT 'classic',
  score INTEGER NOT NULL DEFAULT 0,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  avg_response_time DECIMAL(5,2),
  level_reached INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_game_sessions_user_id` - Fast user lookups
- `idx_game_sessions_mode` - Filter by game mode
- `idx_game_sessions_score` - Leaderboard queries

**RLS Policies:**
- Users can view their own sessions
- Users can insert their own sessions
- Admin can view all sessions

---

#### 2. `question_results`
Stores individual question answers within game sessions.

```sql
CREATE TABLE question_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  vehicle_make VARCHAR(50) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_year VARCHAR(20) NOT NULL,
  correct_answer VARCHAR(100) NOT NULL,
  user_answer VARCHAR(100),
  option_a VARCHAR(100) NOT NULL,
  option_b VARCHAR(100) NOT NULL,
  option_c VARCHAR(100) NOT NULL,
  option_d VARCHAR(100) NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  response_time DECIMAL(5,2),
  points_earned INTEGER NOT NULL DEFAULT 0,
  streak_at_time INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_question_results_session_id` - Group by session
- `idx_question_results_vehicle_make` - Analytics by brand

**RLS Policies:**
- Users can view results from their own sessions
- Users can insert results for their own sessions

---

#### 3. `user_game_stats`
Aggregate statistics for each user across all games.

```sql
CREATE TABLE user_game_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_games_played INTEGER NOT NULL DEFAULT 0,
  total_questions_answered INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  total_wrong_answers INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  best_score INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  fastest_response_time DECIMAL(5,2),
  avg_response_time DECIMAL(5,2),
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_user_game_stats_level` - Leaderboard by level
- `idx_user_game_stats_xp` - Leaderboard by XP
- `idx_user_game_stats_accuracy` - Leaderboard by accuracy

**RLS Policies:**
- Users can view their own stats
- All authenticated users can view other users' stats (public leaderboard)
- Users can update their own stats

---

#### 4. `leaderboard_entries`
Cached leaderboard rankings for performance.

```sql
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL,
  username VARCHAR(100),
  user_avatar VARCHAR(500),
  user_level INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Categories:**
- `alltime` - All-time high scores (never expires)
- `weekly` - Current week scores (expires Monday)
- `daily` - Today's scores (expires midnight)
- `daily_challenge` - Daily challenge specific
- `speed` - Fastest average response times
- `accuracy` - Highest accuracy percentages

**Indexes:**
- `idx_leaderboard_category_rank` - Fast leaderboard queries
- `idx_leaderboard_expires_at` - Cleanup expired entries

**RLS Policies:**
- All authenticated users can view leaderboard entries
- Only server can insert/update (via admin client)

---

#### 5. `user_achievements`
Tracks achievements earned by users.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(100) NOT NULL,
  achievement_description TEXT,
  achievement_icon VARCHAR(10),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

**Achievement IDs:**
- `first_steps` - Complete first game
- `perfect_game` - 15/15 correct answers
- `on_fire` - 10 question streak
- `speed_demon` - Answer in <3 seconds
- `know_it_all` - 100 questions correct
- `transponder_king` - Reach level 10
- `daily_grind` - 7 day play streak
- `flawless_week` - Win 5 games in a row
- `brand_master_bmw` - 50 BMW questions correct
- `triple_crown` - Win all 3 game modes in one day

**Indexes:**
- `idx_user_achievements_user_id` - User profile lookups
- `idx_user_achievements_achievement_id` - Achievement analytics

**RLS Policies:**
- Users can view their own achievements
- All authenticated users can view other users' achievements
- Users can insert their own achievements (verified server-side)

---

#### 6. `daily_challenges`
Stores daily challenge question sets.

```sql
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Questions Format:**
```json
[
  {
    "vehicle_make": "BMW",
    "vehicle_model": "3-Series (F30)",
    "vehicle_year": "2014",
    "correct_answer": "ID49 / Hitag Pro",
    "options": [
      "ID46 / PCF7936",
      "ID49 / Hitag Pro",
      "Texas 4D",
      "ID33 fixed"
    ]
  }
]
```

**RLS Policies:**
- All authenticated users can view today's challenge
- Only server can insert challenges (automated)

---

#### 7. `game_power_ups`
Tracks power-up usage in games.

```sql
CREATE TABLE game_power_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  power_up_type VARCHAR(30) NOT NULL,
  used_at_question INTEGER NOT NULL,
  cost INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Power-Up Types:**
- `add_time` - Add 10 seconds (+10s)
- `fifty_fifty` - Remove 2 wrong answers (50/50)
- `skip` - Skip question without penalty
- `double_points` - 2× points for next 5 questions
- `shield` - Protect 1 life

**RLS Policies:**
- Users can view power-ups from their own sessions
- Users can insert power-ups for their own sessions

---

## ⚙️ GAME MECHANICS

### Lives System
- Start with **3 lives** (❤️❤️❤️)
- Lose 1 life per wrong answer
- Game over at 0 lives
- Can revive: 500 points = 1 life

### Timer Rules

| Level Range | Time Per Question |
|-------------|-------------------|
| 1-3 (Beginner) | 20 seconds |
| 4-6 (Intermediate) | 15 seconds |
| 7-9 (Advanced) | 12 seconds |
| 10-12 (Expert) | 10 seconds |
| 13-15 (Master) | 8 seconds |

### Questions Per Game

| Level Range | Questions |
|-------------|-----------|
| 1-3 | 10 questions |
| 4-6 | 15 questions |
| 7-9 | 20 questions |
| 10-12 | 25 questions |
| 13-15 | 30 questions |

### Question Difficulty

**Easy (Levels 1-3):**
- Single year: "BMW X5 2010"
- Popular models
- Clear distinct transponders

**Medium (Levels 4-6):**
- Year ranges: "Audi A4 2012–2015"
- Platform codes: "BMW 3-Series (F30)"
- More brands

**Hard (Levels 7-9):**
- Edge case years (transition years)
- Motorcycle models
- Uncommon brands

**Expert (Levels 10-12):**
- All 47 brands
- Motorcycles mixed in
- Tricky year ranges

**Master (Levels 13-15):**
- Platform codes required
- Obscure models
- Maximum speed required

---

## 🎯 SCORING SYSTEM

### Base Formula

```javascript
Base Points = 100

Speed Bonus = (Time Remaining in seconds) × 10
  Example: 8 seconds left = +80 points

Streak Bonus = (Consecutive Correct) × 50
  Example: 7 streak = +350 points

Level Multiplier = 1 + (Current Level × 0.2)
  Level 1: ×1.2
  Level 3: ×1.6
  Level 5: ×2.0
  Level 10: ×3.0

TOTAL = (Base + Speed Bonus + Streak Bonus) × Level Multiplier
```

### Example Calculation

```
Question: BMW 3-Series 2015 → ID49 / Hitag Pro
✅ Correct in 7 seconds (8s remaining)
Current Level: 3
Current Streak: 7

Base:           100 points
Speed Bonus:    +80 points (8s × 10)
Streak Bonus:   +350 points (7 × 50)
─────────────
Subtotal:       530 points
Level 3 (×1.6): ×1.6
═════════════
TOTAL:          848 points
```

### Penalties

```
❌ Wrong Answer:
  - Lose 1 life
  - Streak resets to 0
  - No points for question
  - No score penalty (just missed opportunity)
```

### Power-Up Costs

| Power-Up | Cost (Points) |
|----------|---------------|
| ⏰ +10 Seconds | 200 |
| 🎯 50/50 | 300 |
| 🔄 Skip | 250 |
| 🔥 Double Points | 500 |
| 🛡️ Shield | 400 |

---

## 📈 LEVEL PROGRESSION

### Experience Points (XP)

```javascript
XP Earned Per Game:
- Correct answer = 10 XP each
- Complete game bonus = 50 XP
- Perfect game bonus (no wrong) = 100 XP
- Daily challenge completion = 100 XP

Total XP = (Correct Answers × 10) + Bonuses
```

### Level Requirements

```javascript
Level Up Formula:
Level 1 → 2:    100 XP
Level 2 → 3:    250 XP
Level 3 → 4:    500 XP
Level 4 → 5:    1,000 XP
Level 5 → 6:    2,000 XP
Level 6 → 7:    3,500 XP
Level 7 → 8:    5,500 XP
Level 8 → 9:    8,000 XP
Level 9 → 10:   11,000 XP
Level 10 → 11:  15,000 XP
Level 11 → 12:  20,000 XP
Level 12 → 13:  26,000 XP
Level 13 → 14:  33,000 XP
Level 14 → 15:  41,000 XP

Formula: XP Required = Previous + (Level × 500)
```

### Level Names

| Level | Name | Badge |
|-------|------|-------|
| 1-3 | Beginner | 🔰 |
| 4-6 | Intermediate | ⚙️ |
| 7-9 | Advanced | 🎯 |
| 10-12 | Expert | 💎 |
| 13-15 | Master | 👑 |

---

## 🏆 LEADERBOARD SYSTEM

### Categories

#### 1. All-Time High Scores
- **Sort:** Total XP (DESC)
- **Display:** Top 100 players
- **Updates:** Real-time after each game
- **Never expires**

#### 2. Weekly Rankings
- **Sort:** Best score this week
- **Display:** Top 50 players
- **Resets:** Every Monday 00:00 UTC
- **Expires:** End of week

#### 3. Daily Rankings
- **Sort:** Best score today
- **Display:** Top 25 players
- **Resets:** Every day 00:00 UTC
- **Expires:** Midnight

#### 4. Daily Challenge
- **Sort:** Score on today's challenge
- **Display:** All participants
- **One attempt per player**
- **Resets:** Daily

#### 5. Speed Rankings
- **Sort:** Fastest avg response time (ASC)
- **Minimum:** 20 questions answered
- **Display:** Top 50 players
- **Updates:** Real-time

#### 6. Accuracy Rankings
- **Sort:** Highest accuracy % (DESC)
- **Minimum:** 50 questions answered
- **Display:** Top 50 players
- **Updates:** Real-time

### Leaderboard Display Format

```javascript
{
  rank: 1,
  userId: "abc123",
  username: "Mike_Locksmith",
  avatar: "https://...",
  level: 12,
  score: 15890,
  stats: {
    gamesPlayed: 156,
    accuracy: 80.0,
    avgTime: 7.5
  }
}
```

---

## 🎮 API ENDPOINTS

### Game Endpoints

#### `POST /make-server-a7e285ba/game/start`
Start a new game session.

**Request:**
```json
{
  "mode": "classic" | "daily" | "practice" | "endless" | "brand_expert",
  "brandFilter": "BMW" // optional, for brand_expert mode
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "questions": [
    {
      "questionNumber": 1,
      "vehicleMake": "BMW",
      "vehicleModel": "3-Series (F30)",
      "vehicleYear": "2014",
      "options": ["A", "B", "C", "D"],
      "timeLimit": 15
    }
  ],
  "level": 3,
  "lives": 3
}
```

---

#### `POST /make-server-a7e285ba/game/answer`
Submit an answer for a question.

**Request:**
```json
{
  "sessionId": "uuid",
  "questionNumber": 1,
  "answer": "B",
  "responseTime": 7.5
}
```

**Response:**
```json
{
  "correct": true,
  "correctAnswer": "ID49 / Hitag Pro",
  "points": 848,
  "streak": 8,
  "livesRemaining": 3,
  "totalScore": 6420,
  "xpEarned": 10
}
```

---

#### `POST /make-server-a7e285ba/game/complete`
Complete a game session.

**Request:**
```json
{
  "sessionId": "uuid",
  "finalScore": 12450
}
```

**Response:**
```json
{
  "success": true,
  "finalScore": 12450,
  "xpEarned": 180,
  "newLevel": 4,
  "leveledUp": true,
  "rank": 87,
  "achievementsUnlocked": [
    {
      "id": "perfect_game",
      "name": "Perfect Game",
      "icon": "🎯"
    }
  ]
}
```

---

#### `POST /make-server-a7e285ba/game/use-powerup`
Use a power-up during game.

**Request:**
```json
{
  "sessionId": "uuid",
  "powerUpType": "fifty_fifty",
  "questionNumber": 5
}
```

**Response:**
```json
{
  "success": true,
  "cost": 300,
  "newScore": 5200,
  "removedOptions": ["A", "C"] // for 50/50
}
```

---

### Leaderboard Endpoints

#### `GET /make-server-a7e285ba/game/leaderboard/:category`
Get leaderboard for a category.

**Parameters:**
- `category`: alltime | weekly | daily | daily_challenge | speed | accuracy
- `limit`: Number of entries (default: 50, max: 100)
- `offset`: Pagination offset

**Response:**
```json
{
  "category": "alltime",
  "entries": [
    {
      "rank": 1,
      "userId": "abc123",
      "username": "Mike_Locksmith",
      "avatar": "https://...",
      "level": 12,
      "score": 15890,
      "accuracy": 80.0,
      "gamesPlayed": 156
    }
  ],
  "userRank": 87,
  "total": 1243
}
```

---

#### `GET /make-server-a7e285ba/game/stats/:userId`
Get user's game statistics.

**Response:**
```json
{
  "userId": "abc123",
  "username": "Mike_Locksmith",
  "level": 12,
  "totalXP": 25600,
  "nextLevelXP": 26000,
  "stats": {
    "gamesPlayed": 156,
    "questionsAnswered": 2340,
    "correctAnswers": 1872,
    "accuracy": 80.0,
    "bestScore": 15890,
    "bestStreak": 23,
    "avgResponseTime": 7.5,
    "fastestTime": 3.2
  },
  "achievements": [
    {
      "id": "first_steps",
      "name": "First Steps",
      "icon": "🏆",
      "earnedAt": "2026-01-10T14:30:00Z"
    }
  ],
  "recentGames": [
    {
      "sessionId": "uuid",
      "mode": "classic",
      "score": 12450,
      "completedAt": "2026-01-11T10:30:00Z"
    }
  ]
}
```

---

#### `GET /make-server-a7e285ba/game/daily-challenge`
Get today's daily challenge.

**Response:**
```json
{
  "challengeDate": "2026-01-11",
  "questions": [
    {
      "questionNumber": 1,
      "vehicleMake": "BMW",
      "vehicleModel": "X5 (E70)",
      "vehicleYear": "2010",
      "options": ["ID46 / PCF7936", "ID49 / Hitag Pro", "Texas 4D", "ID33 fixed"]
    }
  ],
  "userAttempted": false,
  "userScore": null,
  "leaderboard": []
}
```

---

## 🎨 FRONTEND COMPONENTS

### Components to Create

1. **`TransponderGamePage.tsx`** - Main game container
2. **`GameScreen.tsx`** - Active game play interface
3. **`QuestionCard.tsx`** - Individual question display
4. **`GameHeader.tsx`** - Timer, lives, score display
5. **`AnswerButton.tsx`** - Answer option button
6. **`ResultModal.tsx`** - Question result popup
7. **`GameOverModal.tsx`** - End game summary
8. **`LeaderboardPage.tsx`** - Leaderboard display
9. **`LeaderboardTabs.tsx`** - Category tabs
10. **`UserStatsPage.tsx`** - Personal statistics
11. **`AchievementsPanel.tsx`** - Achievements display
12. **`PowerUpsPanel.tsx`** - Power-up selection
13. **`DailyChallengeCard.tsx`** - Daily challenge entry
14. **`GameModeSelector.tsx`** - Game mode selection

### State Management

```typescript
// Game State
interface GameState {
  sessionId: string | null;
  mode: GameMode;
  currentQuestion: number;
  totalQuestions: number;
  questions: Question[];
  lives: number;
  score: number;
  streak: number;
  level: number;
  timeRemaining: number;
  isPaused: boolean;
  isComplete: boolean;
}

// User Stats State
interface UserStats {
  userId: string;
  username: string;
  level: number;
  totalXP: number;
  nextLevelXP: number;
  gamesPlayed: number;
  accuracy: number;
  bestScore: number;
  achievements: Achievement[];
}
```

---

## 🎯 ACHIEVEMENTS LIST

### Complete Achievement Catalog

| ID | Name | Icon | Description | Criteria |
|----|------|------|-------------|----------|
| `first_steps` | First Steps | 🏆 | Complete your first game | Complete 1 game |
| `perfect_game` | Perfect Game | 🎯 | Answer all questions correctly | 15/15 or 10/10 correct |
| `on_fire` | On Fire | 🔥 | Get 10 answers in a row | 10 streak |
| `unstoppable` | Unstoppable | ⚡ | Get 20 answers in a row | 20 streak |
| `speed_demon` | Speed Demon | 💨 | Answer in under 3 seconds | Response < 3s |
| `lightning_fast` | Lightning Fast | ⚡ | Answer in under 2 seconds | Response < 2s |
| `know_it_all` | Know-It-All | 🧠 | Answer 100 questions correctly | 100 correct total |
| `scholar` | Scholar | 📚 | Answer 500 questions correctly | 500 correct total |
| `professor` | Professor | 🎓 | Answer 1000 questions correctly | 1000 correct total |
| `transponder_king` | Transponder King | 👑 | Reach level 10 | Level 10 |
| `master_locksmith` | Master Locksmith | 🔑 | Reach level 15 | Level 15 |
| `daily_grind` | Daily Grind | 🌟 | Play 7 days in a row | 7 day streak |
| `flawless_week` | Flawless Week | 💎 | Win 5 games in a row | 5 consecutive wins |
| `centurion` | Centurion | 💯 | Play 100 games | 100 games played |
| `dedication` | Dedication | 🎖️ | Play 500 games | 500 games played |
| `brand_master_bmw` | BMW Master | 🇩🇪 | Answer 50 BMW questions correctly | 50 BMW correct |
| `brand_master_audi` | Audi Master | 🅰️ | Answer 50 Audi questions correctly | 50 Audi correct |
| `brand_master_mercedes` | Mercedes Master | ⭐ | Answer 50 Mercedes questions correctly | 50 Mercedes correct |
| `triple_crown` | Triple Crown | 👑 | Win all 3 game modes in one day | Classic + Daily + Endless |
| `accuracy_elite` | Accuracy Elite | 🎯 | Achieve 90% accuracy (min 100 questions) | 90%+ accuracy |
| `speed_racer` | Speed Racer | 🏎️ | Average under 5 seconds (min 50 questions) | Avg < 5s |
| `powerup_master` | Power-Up Master | 🔋 | Use all 5 power-up types | Use each once |
| `comeback_kid` | Comeback Kid | 💪 | Win a game after losing 2 lives | Win with 1 life left |
| `high_roller` | High Roller | 💰 | Score over 10,000 in one game | Score > 10,000 |
| `legendary` | Legendary | 🌟 | Score over 20,000 in one game | Score > 20,000 |

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Core Game (Week 1)
- [x] Database schema created
- [ ] Question generation algorithm
- [ ] Basic game UI (question display)
- [ ] Answer validation
- [ ] Timer system
- [ ] Lives system
- [ ] Score calculation
- [ ] Game completion flow

### Phase 2: Progression System (Week 2)
- [ ] Level system
- [ ] XP calculation and tracking
- [ ] User stats tracking
- [ ] Achievement system
- [ ] Achievement unlock logic
- [ ] Game history display
- [ ] Personal stats page

### Phase 3: Leaderboards (Week 3)
- [ ] All-time leaderboard
- [ ] Weekly leaderboard
- [ ] Daily leaderboard
- [ ] Speed leaderboard
- [ ] Accuracy leaderboard
- [ ] Real-time rank updates
- [ ] User profile pages

### Phase 4: Advanced Features (Week 4)
- [ ] Daily challenge mode
- [ ] Daily challenge generator (cron job)
- [ ] Power-ups system
- [ ] Power-up UI
- [ ] Practice mode
- [ ] Endless mode
- [ ] Brand expert mode

### Phase 5: Polish & Engagement (Week 5)
- [ ] Sound effects
- [ ] Animations (correct/wrong/streak)
- [ ] Celebration modals
- [ ] Social sharing
- [ ] Daily rewards system
- [ ] Challenge system
- [ ] Mobile responsive optimizations

---

## 🔧 TECHNICAL NOTES

### Question Generation Strategy

```javascript
// Pseudo-code for question generation
function generateQuestion(level: number): Question {
  // 1. Determine difficulty based on level
  const difficulty = getDifficultyForLevel(level);
  
  // 2. Select random vehicle from database
  const vehicle = selectRandomVehicle(difficulty);
  
  // 3. Get correct transponder
  const correctAnswer = getTransponderForVehicle(vehicle);
  
  // 4. Generate 3 plausible wrong answers
  const wrongAnswers = generateWrongAnswers(vehicle, correctAnswer);
  
  // 5. Shuffle options
  const options = shuffle([correctAnswer, ...wrongAnswers]);
  
  return {
    vehicle,
    correctAnswer,
    options,
    timeLimit: getTimeLimitForLevel(level)
  };
}
```

### Wrong Answer Generation Logic

```javascript
// Generate plausible but incorrect transponder options
function generateWrongAnswers(vehicle, correctAnswer) {
  const strategies = [
    // 1. Same brand, different year
    () => getTransponderForSameBrandDifferentYear(vehicle),
    
    // 2. Same year, different brand
    () => getTransponderForSameYearDifferentBrand(vehicle),
    
    // 3. Adjacent transponder generation
    () => getAdjacentTransponderGeneration(correctAnswer),
  ];
  
  return strategies.map(s => s()).filter(unique);
}
```

### Leaderboard Caching Strategy

```javascript
// Update leaderboards efficiently
async function updateLeaderboards(userId: string, score: number) {
  // 1. Update user stats (immediate)
  await updateUserStats(userId, score);
  
  // 2. Update all-time leaderboard (immediate)
  await updateLeaderboardEntry(userId, 'alltime', score);
  
  // 3. Update weekly leaderboard (immediate)
  await updateLeaderboardEntry(userId, 'weekly', score);
  
  // 4. Update daily leaderboard (immediate)
  await updateLeaderboardEntry(userId, 'daily', score);
  
  // 5. Recalculate ranks (batched every 5 minutes)
  await queueLeaderboardRankUpdate();
}
```

### Performance Optimizations

1. **Leaderboard Caching:** Cache top 100 entries in `leaderboard_entries` table
2. **Question Pre-generation:** Generate questions server-side, not client-side
3. **Batch Updates:** Update stats in batches, not per-question
4. **Indexes:** Proper indexes on all frequently queried columns
5. **RLS Policies:** Efficient policies to avoid full table scans

---

## 📱 MOBILE CONSIDERATIONS

### Touch Optimizations
- Large touch targets (min 44px)
- Swipe gestures for answer selection
- Haptic feedback on answer
- Portrait orientation lock

### Performance
- Preload next question
- Minimize re-renders
- Optimize animations (CSS over JS)
- Lazy load leaderboards

---

## 🎨 DESIGN TOKENS

### Colors
```css
--game-primary: #3B82F6 (Blue)
--game-secondary: #8B5CF6 (Purple)
--game-success: #10B981 (Green)
--game-error: #EF4444 (Red)
--game-warning: #F59E0B (Orange)
--game-streak: #F97316 (Fire Orange)
```

### Animations
```css
--animation-correct: pulse-green 0.5s ease
--animation-wrong: shake-red 0.5s ease
--animation-streak: flame 0.8s ease
--animation-timer: glow-orange 1s infinite
```

---

## 🔐 SECURITY CONSIDERATIONS

### RLS Policies
- Users can only modify their own sessions
- Leaderboard is publicly readable
- Admin routes protected with auth check
- Rate limiting on answer submission (prevent cheating)

### Anti-Cheat Measures
1. Server-side answer validation
2. Timestamp verification (response time)
3. Session token validation
4. Maximum score caps per level
5. Suspicious pattern detection

---

## 📊 ANALYTICS TO TRACK

### Game Analytics
- Questions answered per day
- Average accuracy by brand
- Most difficult questions (lowest correct %)
- Most common wrong answers
- Average completion time
- Drop-off points (which question users quit)

### User Analytics
- Daily active users (DAU)
- Weekly active users (WAU)
- Average session duration
- Retention rate (7-day, 30-day)
- Completion rate
- Power-up usage frequency

---

## 🔮 FUTURE ENHANCEMENTS

### V2 Features
- [ ] Multiplayer real-time mode (race against friends)
- [ ] Tournament system (weekly tournaments)
- [ ] Custom challenges (create and share)
- [ ] Study mode (flashcards)
- [ ] Voice mode (audio questions)
- [ ] AR mode (scan real keys)
- [ ] Betting system (wager points)
- [ ] Team mode (locksmith shops compete)

### Monetization Ideas
- [ ] Premium subscription (ad-free + bonus XP)
- [ ] Cosmetic themes
- [ ] Custom avatars
- [ ] Power-up bundles
- [ ] Daily double XP boost

### Gamification
- [ ] Seasonal events (holidays)
- [ ] Limited-time challenges
- [ ] Collectible badges
- [ ] Profile customization
- [ ] Friend system
- [ ] Private leagues

---

## 📞 SUPPORT & FEEDBACK

### Player Support
- In-game help button
- FAQ section
- Report incorrect question
- Feedback form

### Admin Tools
- Question review dashboard
- User moderation panel
- Analytics dashboard
- Manual achievement grants

---

## 📝 CHANGELOG

### Version 1.0.0 (January 11, 2026)
- Initial database schema created (7 game tables + 1 fitments table)
- Core game mechanics documented
- Scoring system finalized
- Level progression defined
- Achievement system designed
- API endpoints specified
- **CREATED:** `TRANSPONDER_FITMENTS_DATA.sql` - 300+ vehicle entries from BMW, Audi, Ford
  - 75 BMW entries (54 cars + 11 motorcycles + 3 MINI + 7 bikes)
  - 46 Audi entries (all platforms and year ranges)
  - 100+ Ford entries (popular models + trucks)
  - Total: ~300 entries ready for game use
- Centralized transponder database architecture finalized

---

## 📂 SQL FILES CREATED

### 1. Game Tables SQL (Run First)
**File:** See initial setup (already run - 7 tables created ✅)
- `game_sessions`
- `question_results`
- `user_game_stats`
- `leaderboard_entries`
- `user_achievements`
- `daily_challenges`
- `game_power_ups`

### 2. Transponder Fitments SQL (Run Next)
**File:** `/TRANSPONDER_FITMENTS_DATA.sql`
- Creates `transponder_fitments` table
- Populates with ~300 vehicle entries
- Indexed for fast queries
- RLS policies enabled
- **Status:** Ready to run ⏳

**To Run:**
1. Open Supabase SQL Editor
2. Copy entire contents of `/TRANSPONDER_FITMENTS_DATA.sql`
3. Execute
4. Verify: `SELECT COUNT(*) FROM transponder_fitments;` should return ~300

### Data Coverage:
- **BMW:** 75 entries across all series (1995-2026)
  - Cars: 1/2/3/4/5/6/7/8-Series, X1/X2/X3/X4/X5/X6/X7, Z3/Z4/Z8, i3/i8
  - Motorcycles: R1200GS, F650GS, F800GS, K1300, K1600, C600, C650
  - MINI: Cooper (2001+)
  - Difficulty levels: 1-4
- **Audi:** 46 entries across all models (1995-2018+)
  - Sedan/Wagon: A1-A8, S4-S8, Allroad
  - SUVs: Q2, Q3, Q5, Q7
  - Sports: TT, TTS
  - Difficulty levels: 2-3
- **Ford:** 100+ entries (1995-2021)
  - Popular: Fiesta, Focus, Mondeo, Mustang, Explorer
  - SUVs: Escape, Edge, Expedition, EcoSport
  - Trucks: F-150, F-250, Ranger
  - Vans: Transit, Galaxy, S-Max
  - Difficulty levels: 1-3

---

## 🎯 GAME QUESTION EXAMPLES

### Example Easy Question (Level 1-3):
```
Question: What transponder fits a BMW X5 2010?
A) ID33 fixed
B) ID46 / PCF7936 ✅
C) Texas 4D
D) BDC2 / encrypted key

Difficulty: 1 (Popular model, single year)
Time Limit: 20 seconds
```

### Example Medium Question (Level 4-6):
```
Question: What transponder fits an Audi A4 / S4 2008-2016?
A) TP08 / ID48 crypto
B) TP25 / ID48 crypto precoded
C) PCF7945AC / Hitag Extended ✅
D) AES / ID49 / MQB

Difficulty: 2 (Year range, platform-specific)
Time Limit: 15 seconds
```

### Example Hard Question (Level 7-9):
```
Question: What transponder fits a BMW R1200GS 2012-2017?
A) TP12 / ID46 / PCF7936
B) Texas 4D ✅
C) Texas 4D AES
D) ID49 / Hitag Pro

Difficulty: 3 (Motorcycle, specific year range)
Time Limit: 12 seconds
```

### Example Expert Question (Level 10-12):
```
Question: What transponder fits an Audi Q7 (4L) 2006-2015?
A) TP25 / ID48 crypto precoded
B) PCF7945AC / Hitag Extended
C) ID8E / Sokymat Crypto ✅
D) AES / ID49 / MQB

Difficulty: 3 (Platform code, specific crypto system)
Time Limit: 10 seconds
```

---

## 👥 CONTRIBUTORS

- **Game Design:** System Architecture Team
- **Database Design:** Backend Team
- **Documentation:** Technical Writing Team

---

**Last Updated:** January 12, 2026  
**Next Review:** After Phase 1 completion

---

_This document is the single source of truth for the Transponder Master game system. All developers should reference this document before making changes to the game mechanics, scoring, or database schema._