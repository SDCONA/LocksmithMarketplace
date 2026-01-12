# 🔐 TRANSPONDER MASTER - User Authentication & Progress Persistence

**Created:** January 12, 2026  
**Status:** Analysis Document - Not Yet Implemented  
**Purpose:** Document current auth state and plan for user login integration

---

## ❌ **CURRENT STATUS: ANONYMOUS-ONLY (No Authentication Required)**

---

## 📊 **HOW IT WORKS RIGHT NOW:**

### **1. ANYONE CAN PLAY (No Login Required)**
- ✅ **Zero authentication checks** in all 11 game routes
- ✅ Game uses `publicAnonKey` (not user access tokens)
- ✅ No `getUser()` calls or Authorization validation
- ✅ Completely open access

---

### **2. PROGRESS SAVING: CURRENTLY BROKEN**

#### **Backend (Lines 318-337 in `/supabase/functions/server/transponder-game-routes.tsx`):**
```javascript
app.post('/game/save-session', async (c) => {
  // For now, just return success WITHOUT PERSISTING
  // TODO: Use game_sessions table for authenticated users
  
  return c.json({
    success: true,
    sessionId,
    message: 'Game session saved successfully'  // ⚠️ LIE - nothing saved!
  });
});
```

**Translation:** The backend **pretends** to save but actually does **NOTHING**.

#### **Frontend (`/components/TransponderMasterGame.tsx`):**
```javascript
// Calls /game/save-session after each game
// Gets "success: true" response
// ⚠️ But data goes into the void - NOT saved to database!
```

---

### **3. WHAT DATA IS SAVED vs LOST**

| Data Type | Saved? | Where? | Notes |
|-----------|--------|--------|-------|
| **Question Statistics** | ✅ **YES** | `transponder_fitments` table (times_asked, times_correct, accuracy_rate) | Crowd-sourced analytics |
| **User Game Sessions** | ❌ **NO** | Not persisted (TODO comment in code) | Lost after game ends |
| **User Stats** | ❌ **NO** | `user_game_stats` table is empty | No progression tracking |
| **Leaderboards** | ❌ **NO** | Returns empty array `[]` | No competitive ranking |
| **Achievements** | ❌ **NO** | Not tracked | No badges/rewards |
| **Power-up Usage** | ❌ **NO** | Not tracked | Cosmetic only |
| **Question Results** | ❌ **NO** | Not tracked | No answer history |

---

## 🏗️ **THE ARCHITECTURE GAP**

### **What Exists:**
1. ✅ **8 Database Tables** - All created in Supabase
   - `game_sessions`
   - `question_results`
   - `user_game_stats`
   - `leaderboard_entries`
   - `user_achievements`
   - `daily_challenges`
   - `game_power_ups`
   - `transponder_fitments`
2. ✅ **Complete API Routes** - 11 endpoints ready
3. ✅ **Frontend Game** - Fully functional UI
4. ✅ **Question Database** - 2000+ vehicles ready

### **What's Missing:**
1. ❌ **Authentication Integration** - No user login check
2. ❌ **User Linking** - No `user_id` passed to backend
3. ❌ **Session Persistence** - Route returns fake success
4. ❌ **Leaderboard Population** - Empty implementation
5. ❌ **Stats Tracking** - No user progress saved

---

## 💡 **HOW IT SHOULD WORK (Design Intent)**

### **SCENARIO A: LOGGED-IN USERS**

#### **Frontend Flow:**
```javascript
// 1. User is logged in to Locksmith Marketplace
const { data: { session } } = await supabase.auth.getSession();
const userAccessToken = session?.access_token;

// 2. Play game and send real user token
fetch('/game/save-session', {
  headers: {
    'Authorization': `Bearer ${userAccessToken}` // ← Real user token (not publicAnonKey)
  },
  body: JSON.stringify({
    score: 12450,
    mode: 'classic',
    questionsAnswered: 15,
    correctAnswers: 12,
    bestStreak: 8,
    level: 5
  })
});
```

#### **Backend Flow:**
```javascript
app.post('/game/save-session', async (c) => {
  // 1. Validate user authentication
  const token = c.req.header('Authorization')?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (!user) {
    return c.json({ error: 'Unauthorized - please log in' }, 401);
  }

  // 2. Save game session to database
  const { data: session } = await supabase
    .from('game_sessions')
    .insert({
      user_id: user.id,  // ← Links to auth.users
      mode: 'classic',
      score: 12450,
      questions_answered: 15,
      correct_answers: 12,
      best_streak: 8,
      level_reached: 5,
      completed: true,
      xp_earned: 180,
      completed_at: new Date().toISOString()
    })
    .select()
    .single();

  // 3. Update user aggregate stats
  await updateUserGameStats(user.id, session);

  // 4. Update leaderboards
  await updateLeaderboards(user.id, session.score);

  // 5. Check and award achievements
  const achievements = await checkAchievements(user.id, session);

  // 6. Return complete response
  return c.json({
    success: true,
    sessionId: session.id,
    xpEarned: 180,
    newLevel: 5,
    leveledUp: true,
    rank: 87,
    achievementsUnlocked: achievements
  });
});
```

**Result:** 
- ✅ Full progression saved permanently
- ✅ Stats tracked across all games
- ✅ Appears on global leaderboards
- ✅ Achievements unlocked
- ✅ Can continue from any device
- ✅ Compete with friends

---

### **SCENARIO B: ANONYMOUS USERS (No Account)**

Two possible approaches:

#### **Option A: Browser-Only Storage (LocalStorage)**

**Frontend:**
```javascript
// Save to browser's localStorage
const saveGameLocally = (stats) => {
  const localStats = JSON.parse(localStorage.getItem('transponderGame_stats') || '{}');
  
  localStats.gamesPlayed = (localStats.gamesPlayed || 0) + 1;
  localStats.bestScore = Math.max(localStats.bestScore || 0, stats.score);
  localStats.totalXP = (localStats.totalXP || 0) + stats.xp;
  localStats.recentGames = [
    stats,
    ...(localStats.recentGames || []).slice(0, 9)
  ];
  
  localStorage.setItem('transponderGame_stats', JSON.stringify(localStats));
};

// Display personal bests
const displayLocalStats = () => {
  const stats = JSON.parse(localStorage.getItem('transponderGame_stats') || '{}');
  console.log('Your Best Score:', stats.bestScore);
  console.log('Games Played:', stats.gamesPlayed);
};
```

**Pros:**
- ✅ No server storage needed
- ✅ Instant access
- ✅ Works offline

**Cons:**
- ❌ Lost when browser cache cleared
- ❌ Lost when switching devices
- ❌ Cannot appear on global leaderboards
- ❌ No cross-device sync
- ❌ Easy to manipulate (cheat)

---

#### **Option B: Guest Mode with Temporary Token**

**Frontend:**
```javascript
// Generate or retrieve guest token
let guestToken = localStorage.getItem('transponderGame_guestToken');
if (!guestToken) {
  guestToken = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('transponderGame_guestToken', guestToken);
}

// Send guest token to backend
fetch('/game/save-session', {
  headers: {
    'X-Guest-Token': guestToken  // Custom header for guests
  },
  body: JSON.stringify({ /* game stats */ })
});
```

**Backend:**
```javascript
app.post('/game/save-session', async (c) => {
  const userToken = c.req.header('Authorization')?.split(' ')[1];
  const guestToken = c.req.header('X-Guest-Token');
  
  if (userToken) {
    // LOGGED-IN USER FLOW (full persistence)
    const { data: { user } } = await supabase.auth.getUser(userToken);
    // ... save with user_id
  } else if (guestToken) {
    // GUEST USER FLOW (limited persistence)
    await supabase.from('game_sessions').insert({
      guest_session_id: guestToken,  // ← Instead of user_id
      score: 12450,
      // ... other fields
      // NOTE: No user_id means:
      // - No achievements
      // - No global leaderboard
      // - No stats aggregation
    });
    
    return c.json({
      success: true,
      message: 'Guest session saved',
      notice: 'Sign up to unlock leaderboards and achievements!'
    });
  } else {
    return c.json({ error: 'No authentication provided' }, 401);
  }
});
```

**Pros:**
- ✅ Can view "your recent games" across page refreshes
- ✅ Encourages sign-up ("Sign up to save progress!")
- ✅ Simple to implement

**Cons:**
- ❌ Still lost on cache clear
- ❌ Can't compete on global leaderboards (too easy to cheat)
- ❌ No achievements
- ❌ Database fills with orphaned guest sessions

---

## 🎯 **CURRENT STATE SUMMARY**

```
┌─────────────────────────────────────────────┐
│         TRANSPONDER MASTER GAME             │
├─────────────────────────────────────────────┤
│                                             │
│  🟢 WORKING:                                │
│  • Question generation                      │
│  • Answer validation                        │
│  • Real-time scoring                        │
│  • Streak tracking (during session)         │
│  • 5 game modes                             │
│  • Power-ups UI (cosmetic only)             │
│  • Question analytics (crowd-sourced)       │
│                                             │
│  🔴 NOT WORKING:                            │
│  • User login/signup                        │
│  • Progress persistence                     │
│  • Leaderboards (empty)                     │
│  • Achievements                             │
│  • Level progression across sessions        │
│  • User stats tracking                      │
│  • Daily challenges                         │
│                                             │
│  📝 CURRENT EXPERIENCE:                     │
│  Anyone can play → Game resets on refresh   │
│  → No high score tracking                   │
│  → Purely educational practice tool         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔍 **WHY THIS DESIGN?**

**Phase 1 (CURRENT):** Get game mechanics working
- ✅ Focus on core gameplay loop
- ✅ Test question difficulty balancing
- ✅ Validate scoring system
- ✅ No auth complexity
- **Status:** COMPLETE

**Phase 2 (PLANNED):** Add persistence
- ⏳ Integrate with existing user system
- ⏳ Link to Locksmith Marketplace accounts
- ⏳ Enable competitive features
- ⏳ Track long-term engagement
- **Status:** NOT STARTED

---

## 📌 **IMPLEMENTATION CHECKLIST (Phase 2)**

### **Step 1: Decide Authentication Policy**
- [ ] **Decision:** Allow anonymous play? (Yes/No)
- [ ] **Decision:** Save guest sessions? (Yes/No)
- [ ] **Decision:** Require login for leaderboards? (Recommended: Yes)
- [ ] **Decision:** Show "Sign up to save progress" prompt? (Recommended: Yes)

### **Step 2: Update Backend Routes**

#### **Add Auth Helper Function:**
```javascript
// Helper: Get user from token (returns null if not logged in)
async function getUserFromToken(c) {
  const token = c.req.header('Authorization')?.split(' ')[1];
  if (!token || token === publicAnonKey) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  
  return user;
}
```

#### **Protected Routes (Require Login):**
```javascript
// /game/save-session - Save game progress
app.post('/game/save-session', async (c) => {
  const user = await getUserFromToken(c);
  if (!user) {
    return c.json({ 
      error: 'Login required to save progress',
      guestMode: true 
    }, 401);
  }
  
  // ... save session with user.id
});

// /game/stats/:userId - Get user stats
app.get('/game/stats/:userId', async (c) => {
  const user = await getUserFromToken(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // ... return user stats
});

// /game/achievements/:userId - Get achievements
app.get('/game/achievements/:userId', async (c) => {
  const user = await getUserFromToken(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // ... return achievements
});
```

#### **Public Routes (No Login Required):**
```javascript
// /game/question - Get random question (anyone can play)
app.get('/game/question', async (c) => {
  // No auth check - public access
  // ... generate question
});

// /game/answer - Submit answer (anyone can play)
app.post('/game/answer', async (c) => {
  // No auth check - public access
  // Updates question statistics only
  // ... validate answer
});

// /game/leaderboard - View leaderboard (public)
app.get('/game/leaderboard', async (c) => {
  // No auth check - anyone can view
  // ... return top scores
});
```

### **Step 3: Update Frontend**

#### **Check User Session on Game Load:**
```javascript
// In TransponderMasterGame.tsx
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [userToken, setUserToken] = useState<string | null>(null);

useEffect(() => {
  checkUserSession();
}, []);

const checkUserSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    setIsLoggedIn(true);
    setUserToken(session.access_token);
  }
};
```

#### **Use User Token in API Calls:**
```javascript
// Save session with user token
const saveGameSession = async (stats) => {
  const token = isLoggedIn ? userToken : publicAnonKey;
  
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/game/save-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(stats)
    }
  );
  
  if (response.status === 401) {
    // User not logged in
    showSignUpPrompt();
  }
};
```

#### **Show Sign-Up Prompt:**
```javascript
const showSignUpPrompt = () => {
  // Display modal after game ends
  return (
    <div className="signup-prompt">
      <h3>🏆 Great Game!</h3>
      <p>Sign up to:</p>
      <ul>
        <li>✅ Save your progress</li>
        <li>🏆 Compete on leaderboards</li>
        <li>🎖️ Unlock achievements</li>
        <li>📈 Track your stats</li>
      </ul>
      <Button onClick={navigateToSignUp}>Sign Up Now</Button>
      <Button variant="ghost" onClick={continueAsGuest}>Continue as Guest</Button>
    </div>
  );
};
```

### **Step 4: Implement Persistence Logic**

#### **Save Game Session:**
```javascript
app.post('/game/save-session', async (c) => {
  const user = await getUserFromToken(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  const { mode, score, questionsAnswered, correctAnswers, bestStreak, level } = await c.req.json();
  
  // 1. Insert game session
  const { data: session, error } = await supabase
    .from('game_sessions')
    .insert({
      user_id: user.id,
      mode,
      score,
      questions_answered: questionsAnswered,
      correct_answers: correctAnswers,
      wrong_answers: questionsAnswered - correctAnswers,
      best_streak: bestStreak,
      avg_response_time: null, // TODO: track
      level_reached: level,
      completed: true,
      xp_earned: correctAnswers * 10 + (questionsAnswered === correctAnswers ? 100 : 0),
      completed_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // 2. Update user stats
  await updateUserStats(user.id, session);
  
  // 3. Update leaderboards
  await updateLeaderboards(user.id, session);
  
  // 4. Check achievements
  const achievements = await checkAndAwardAchievements(user.id, session);
  
  return c.json({
    success: true,
    sessionId: session.id,
    xpEarned: session.xp_earned,
    achievementsUnlocked: achievements
  });
});
```

#### **Update User Stats:**
```javascript
async function updateUserStats(userId: string, session: any) {
  // Get current stats or create new
  const { data: stats } = await supabase
    .from('user_game_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (!stats) {
    // Create new stats
    await supabase.from('user_game_stats').insert({
      user_id: userId,
      total_games_played: 1,
      total_questions_answered: session.questions_answered,
      total_correct_answers: session.correct_answers,
      total_wrong_answers: session.wrong_answers,
      accuracy_percentage: (session.correct_answers / session.questions_answered) * 100,
      best_score: session.score,
      best_streak: session.best_streak,
      current_level: session.level_reached,
      total_xp: session.xp_earned,
      last_played_at: new Date().toISOString()
    });
  } else {
    // Update existing stats
    await supabase
      .from('user_game_stats')
      .update({
        total_games_played: stats.total_games_played + 1,
        total_questions_answered: stats.total_questions_answered + session.questions_answered,
        total_correct_answers: stats.total_correct_answers + session.correct_answers,
        total_wrong_answers: stats.total_wrong_answers + session.wrong_answers,
        accuracy_percentage: ((stats.total_correct_answers + session.correct_answers) / 
                             (stats.total_questions_answered + session.questions_answered)) * 100,
        best_score: Math.max(stats.best_score, session.score),
        best_streak: Math.max(stats.best_streak, session.best_streak),
        current_level: Math.max(stats.current_level, session.level_reached),
        total_xp: stats.total_xp + session.xp_earned,
        last_played_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }
}
```

#### **Update Leaderboards:**
```javascript
async function updateLeaderboards(userId: string, session: any) {
  // Get user info
  const { data: user } = await supabase.auth.admin.getUserById(userId);
  
  // All-time leaderboard
  await supabase
    .from('leaderboard_entries')
    .upsert({
      user_id: userId,
      category: 'alltime',
      score: session.score,
      username: user.user_metadata?.username || user.email?.split('@')[0],
      user_level: session.level_reached,
      achieved_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,category',
      ignoreDuplicates: false
    });
  
  // Weekly leaderboard
  const weekExpiry = getNextMonday();
  await supabase.from('leaderboard_entries').upsert({
    user_id: userId,
    category: 'weekly',
    score: session.score,
    username: user.user_metadata?.username || user.email?.split('@')[0],
    user_level: session.level_reached,
    expires_at: weekExpiry,
    achieved_at: new Date().toISOString()
  });
  
  // Daily leaderboard
  const dayExpiry = getTomorrow();
  await supabase.from('leaderboard_entries').upsert({
    user_id: userId,
    category: 'daily',
    score: session.score,
    username: user.user_metadata?.username || user.email?.split('@')[0],
    user_level: session.level_reached,
    expires_at: dayExpiry,
    achieved_at: new Date().toISOString()
  });
}
```

#### **Award Achievements:**
```javascript
async function checkAndAwardAchievements(userId: string, session: any) {
  const achievements = [];
  
  // Check various achievement conditions
  const { data: stats } = await supabase
    .from('user_game_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // First Steps - Complete first game
  if (stats.total_games_played === 1) {
    await awardAchievement(userId, 'first_steps', 'First Steps', '🏆');
    achievements.push({ id: 'first_steps', name: 'First Steps', icon: '🏆' });
  }
  
  // Perfect Game - All correct
  if (session.correct_answers === session.questions_answered && session.questions_answered >= 10) {
    await awardAchievement(userId, 'perfect_game', 'Perfect Game', '🎯');
    achievements.push({ id: 'perfect_game', name: 'Perfect Game', icon: '🎯' });
  }
  
  // On Fire - 10 streak
  if (session.best_streak >= 10) {
    await awardAchievement(userId, 'on_fire', 'On Fire', '🔥');
    achievements.push({ id: 'on_fire', name: 'On Fire', icon: '🔥' });
  }
  
  // ... more achievement checks
  
  return achievements;
}

async function awardAchievement(userId: string, achievementId: string, name: string, icon: string) {
  await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
      achievement_name: name,
      achievement_icon: icon
    })
    .onConflict('user_id,achievement_id')
    .ignoreDuplicates();
}
```

### **Step 5: Testing Checklist**
- [ ] Test logged-in user saves session
- [ ] Test anonymous user gets prompt
- [ ] Test leaderboard updates correctly
- [ ] Test achievements unlock
- [ ] Test stats aggregation
- [ ] Test RLS policies (users can only see their own data)
- [ ] Test guest mode (if implemented)

---

## 🚨 **SECURITY CONSIDERATIONS**

### **RLS Policies to Enable:**

```sql
-- game_sessions: Users can only view/insert their own sessions
CREATE POLICY "Users view own sessions"
  ON game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- user_game_stats: Users can view own, all can view others (public)
CREATE POLICY "Users view own stats"
  ON user_game_stats FOR SELECT
  USING (auth.uid() = user_id OR true); -- Public leaderboard

CREATE POLICY "Users update own stats"
  ON user_game_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- leaderboard_entries: Public read, server write only
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  USING (true);

-- user_achievements: Users view own, all can view others
CREATE POLICY "Anyone can view achievements"
  ON user_achievements FOR SELECT
  USING (true);
```

### **Anti-Cheat Measures:**
1. ✅ Server-side answer validation (already implemented)
2. ✅ Timestamp verification for response times
3. ⏳ Rate limiting (add later)
4. ⏳ Max score caps per level
5. ⏳ Suspicious pattern detection (e.g., perfect scores every time)

---

## 🎯 **RECOMMENDED APPROACH**

### **Phase 2A: Basic Persistence (Week 1)**
1. Add auth check to `/game/save-session`
2. Actually save to `game_sessions` table
3. Show "Login to save progress" prompt for guests
4. Keep game playable without login

### **Phase 2B: Stats & Leaderboards (Week 2)**
1. Implement `updateUserStats()` function
2. Implement `updateLeaderboards()` function
3. Build leaderboard UI
4. Add personal stats page

### **Phase 2C: Achievements (Week 3)**
1. Implement achievement detection
2. Build achievement unlock animations
3. Add achievements page
4. Social sharing integration

### **Phase 2D: Advanced Features (Week 4)**
1. Daily challenges (require login)
2. Friend challenges
3. Team competitions
4. Analytics dashboard

---

## 📊 **CURRENT FILES TO MODIFY**

### **Backend:**
- `/supabase/functions/server/transponder-game-routes.tsx`
  - Lines 318-337: Implement real save logic
  - Lines 342-350: Implement real leaderboard query
  - Add new routes: `/game/stats/:userId`, `/game/achievements/:userId`

### **Frontend:**
- `/components/TransponderMasterGame.tsx`
  - Add session check on load
  - Use user token instead of publicAnonKey
  - Add sign-up prompt modal
  - Display achievements on unlock

### **Database:**
- Enable RLS policies (currently disabled)
- Add indexes for leaderboard queries

---

## 📝 **QUESTIONS TO ANSWER BEFORE IMPLEMENTING**

1. **Should anonymous users be able to play at all?**
   - Recommendation: YES (low barrier to entry)
   
2. **Should we save guest sessions to database?**
   - Recommendation: NO (localStorage only, encourage sign-up)
   
3. **Should leaderboards show guest scores?**
   - Recommendation: NO (too easy to cheat)
   
4. **Should we prompt for sign-up after every game?**
   - Recommendation: After 3rd game, then every 5 games
   
5. **Should we require email verification?**
   - Recommendation: NO (Supabase auto-confirms for now)
   
6. **Should we integrate with existing Locksmith Marketplace auth?**
   - Recommendation: YES (shared user accounts)

---

## 🔗 **INTEGRATION WITH MAIN APP**

### **Existing Auth System:**
The Locksmith Marketplace already has:
- ✅ User registration (`/signup` route in server)
- ✅ Email/password login (Supabase Auth)
- ✅ Social login support (Google, GitHub, etc.)
- ✅ Protected routes with JWT tokens
- ✅ User profiles in `auth.users` table

### **Integration Steps:**
1. Use existing `supabase.auth.getSession()` from main app
2. Pass session token to game component
3. Game API routes validate token
4. Link game stats to existing user profiles
5. Add "Game Stats" tab to user profile page

---

## 📌 **NEXT STEPS**

When ready to implement Phase 2:

1. **Review and approve** this document
2. **Answer** the 6 questions above
3. **Decide** on guest mode policy
4. **Start with** Phase 2A (basic persistence)
5. **Test thoroughly** before moving to Phase 2B

---

**Status:** Ready for review and approval  
**Estimated Effort:** 2-3 weeks for full Phase 2 implementation  
**Priority:** Medium (game works fine without auth, but limits engagement)

---

_Last Updated: January 12, 2026_
