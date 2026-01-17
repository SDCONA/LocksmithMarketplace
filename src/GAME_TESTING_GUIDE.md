# TRANSPONDER MASTER GAME - COMPREHENSIVE TESTING GUIDE

## 🎯 PURPOSE
This guide outlines every test scenario that must pass before declaring the game production-ready.

---

## 🔴 CRITICAL TESTS (Must Pass)

### **Test 1: Lose All 3 Lives**
**Objective**: Verify game ends when lives reach 0

**Steps**:
1. Start a new Classic game
2. Answer 3 questions wrong (or let them timeout)
3. Observe console logs
4. Verify game over screen appears
5. Verify no more questions are fetched

**Expected Logs**:
```
❌ FAILSAFE: Lives are 0, cannot fetch question - triggering game over
🎮 GAME OVER - Lives: 0, Questions: X
```

**Expected Result**: ✅ Game over screen appears, no new questions

**Failure Indicators**:
- ❌ Game continues with 0 lives
- ❌ Lives reset to 3
- ❌ New question appears
- ❌ Level complete screen shows

---

### **Test 2: Lose Life on Question 10 (Level Complete Boundary)**
**Objective**: Verify that losing your last life on a level complete question triggers game over, NOT level complete

**Steps**:
1. Start new Classic game
2. Answer 9 questions (mix of right/wrong to have exactly 1 life left)
3. On question 10, answer wrong or timeout
4. Observe console logs
5. Verify game over appears (NOT level complete)

**Expected Logs**:
```
🔍 GAME FLOW CHECK (Question 10):
   Lives: 0
   isGameOver: true
   isLevelComplete: false
🎮 GAME OVER - Lives: 0, Questions: 10
```

**Expected Result**: ✅ Game over screen appears

**Failure Indicators**:
- ❌ Level complete screen appears
- ❌ Game continues
- ❌ Lives reset to 3

---

### **Test 3: Complete Level 2 With 1 Life, Then Lose Last Life**
**Objective**: Verify that lives persist through level complete and game ends properly on next wrong answer

**Steps**:
1. Start new Classic game
2. Play until question 10 with exactly 1 life remaining
3. Answer question 10 correctly → Level Complete screen shows
4. Click "🚀 NEXT LEVEL"
5. Answer question 11 wrong
6. Verify game over appears

**Expected Logs**:
```
✅ LEVEL COMPLETE - Lives: 1, Level: 2
🚀 NEXT LEVEL clicked - Current stats: { lives: 1, questions: 10 }
🎮 fetchQuestion called with stats: { questionsAnswered: 10, lives: 1, score: X }
[After answering wrong]
🔍 GAME FLOW CHECK (Question 11):
   Lives: 0
   isGameOver: true
🎮 GAME OVER - Lives: 0, Questions: 11
```

**Expected Result**: ✅ Game over screen appears after question 11

**Failure Indicators**:
- ❌ Lives reset to 3 after clicking NEXT LEVEL
- ❌ Game continues with 0 lives
- ❌ Another level complete screen appears

---

### **Test 4: Click NEXT LEVEL With 0 Lives**
**Objective**: Verify NEXT LEVEL button forces game over if lives = 0

**Setup**: This shouldn't normally happen, but test the failsafe

**Steps**:
1. Somehow reach level complete screen with 0 lives (modify code temporarily if needed)
2. Click "🚀 NEXT LEVEL"
3. Verify game over appears immediately

**Expected Logs**:
```
🚀 NEXT LEVEL clicked - Current stats: { lives: 0, questions: 10 }
❌ Cannot continue - lives are 0, forcing game over
```

**Expected Result**: ✅ Game over screen appears

---

### **Test 5: Resume Paused Game With 0 Lives**
**Objective**: Verify cannot resume a game that already ended

**Steps**:
1. Start game, lose all 3 lives
2. Before game over screen appears, click "💾 SAVE & EXIT" (if possible)
3. OR manually modify database to set a paused game with currentLives = 0
4. Refresh page
5. Try to resume game
6. Verify game goes directly to game over

**Expected Logs**:
```
✅ Found paused game: {lives: 0, ...}
❌ Cannot resume - game was already over (lives = 0)
🗑️ Deleting paused game: ...
```

**Expected Result**: ✅ Game over screen appears, paused game deleted

---

### **Test 6: Double-Click Answer**
**Objective**: Verify only first click is processed

**Steps**:
1. Start game
2. Quickly double-click an answer
3. Verify only one answer is submitted
4. Check console logs

**Expected Logs**:
```
📝 Submitting answer: Texas Crypto...
⚠️ GUARD: Answer already submitted or no question
```

**Expected Result**: ✅ Only one answer processed

---

### **Test 7: Use Power-up During Result Display**
**Objective**: Verify power-ups can't be used while showing result

**Steps**:
1. Answer a question
2. While the result is showing (green/red feedback), try to click a power-up
3. Verify it doesn't activate

**Expected Logs**:
```
⚠️ GUARD: Cannot use power-up while showing result
```

**Expected Result**: ✅ Power-up not activated

---

### **Test 8: Timeout With 1 Life**
**Objective**: Verify timeout triggers game over when on last life

**Steps**:
1. Start game, lose 2 lives
2. On next question, let timer run to 0
3. Verify game over appears

**Expected Logs**:
```
⏱️ TIMEOUT - Processing timeout
⏱️ After timeout - Lives: 0, Questions: X
❌ TIMEOUT -> GAME OVER
```

**Expected Result**: ✅ Game over screen appears

---

### **Test 9: Shield Absorbs Timeout**
**Objective**: Verify shield prevents life loss on timeout

**Steps**:
1. Start game
2. Activate shield power-up
3. Let timer run to 0
4. Verify no life lost, shield consumed

**Expected Logs**:
```
⚡ Using power-up: shield
⏱️ TIMEOUT - Processing timeout
🛡️ Shield absorbed timeout
⏱️ After timeout - Lives: 3, Questions: X
```

**Expected Result**: ✅ Lives remain same, shield consumed

---

### **Test 10: Start New Game Clears Previous State**
**Objective**: Verify starting new game resets everything

**Steps**:
1. Play a game, pause it
2. Start a new game
3. Verify paused game is deleted
4. Verify all stats reset

**Expected Logs**:
```
🎮 Starting new game - Mode: classic
🗑️ Deleting old paused game before starting new game
✨ Game reset complete - Lives: 3, Mode: classic
📊 Initial stats set: { lives: 3, mode: 'classic' }
```

**Expected Result**: ✅ Fresh game starts, no interference

---

## 🟡 IMPORTANT TESTS (Should Pass)

### **Test 11: Skip Power-up With 0 Lives**
**Objective**: Verify skip doesn't work with 0 lives

**Setup**: Modify code to force 0 lives

**Steps**:
1. Have 0 lives
2. Try to use skip power-up
3. Verify it's blocked

**Expected Logs**:
```
❌ Cannot skip - game is over
```

---

### **Test 12: Practice Mode With 20 Questions**
**Objective**: Verify practice mode ends at 20 questions

**Steps**:
1. Start Practice mode
2. Answer 20 questions
3. Verify game over appears

**Expected Result**: ✅ Game over after 20 questions

---

### **Test 13: Fifty-Fifty Power-up**
**Objective**: Verify fifty-fifty removes 2 wrong answers

**Steps**:
1. Start game
2. Use fifty-fifty power-up
3. Verify 2 wrong answers are hidden
4. Verify power-up count decreased

**Expected Result**: ✅ 2 wrong options hidden

---

### **Test 14: Time Boost Power-up**
**Objective**: Verify time boost adds time

**Steps**:
1. Start game
2. Let timer drop to 5 seconds
3. Use time boost
4. Verify timer increases

**Expected Result**: ✅ Timer increases by 10 seconds (capped at 15)

---

### **Test 15: Double Points Power-up**
**Objective**: Verify double points doubles score

**Steps**:
1. Start game
2. Activate double points
3. Answer correctly
4. Verify score is doubled

**Expected Result**: ✅ Score is 2x normal

---

### **Test 16: Streak Tracking**
**Objective**: Verify streak increments/resets correctly

**Steps**:
1. Answer 3 questions correctly → streak = 3
2. Answer 1 wrong → streak = 0
3. Answer 2 correct → streak = 2

**Expected Result**: ✅ Streak tracks correctly

---

### **Test 17: Best Streak Tracking**
**Objective**: Verify bestStreak is maintained

**Steps**:
1. Get streak of 5
2. Break streak
3. Get streak of 3
4. Verify bestStreak still shows 5

**Expected Result**: ✅ Best streak preserved

---

### **Test 18: Pause and Resume**
**Objective**: Verify pause/resume works correctly

**Steps**:
1. Play 3 questions
2. Pause game (Save & Exit)
3. Refresh page
4. Resume game
5. Verify stats restored correctly
6. Verify paused game deleted from DB after resume

**Expected Logs**:
```
✅ Found paused game: {lives: 3, score: 600, ...}
▶️ Resuming paused game: ...
✅ Resumed stats validated: {lives: 3, questions: 3}
🗑️ Deleting paused game: ...
```

**Expected Result**: ✅ Game resumes with correct stats

---

### **Test 19: Multiple Paused Games**
**Objective**: Verify only one paused game can exist

**Steps**:
1. Start game, pause it
2. Start another game, pause it
3. Verify only the latest is saved

**Expected Result**: ✅ Only one paused game exists

---

### **Test 20: Answered Questions Tracking**
**Objective**: Verify no duplicate questions in same session

**Steps**:
1. Play 10 questions
2. Verify no question repeats
3. Check answeredQuestionIds array

**Expected Result**: ✅ All questions unique

---

## 🟢 NICE-TO-HAVE TESTS

### **Test 21: Leaderboard Updates**
**Objective**: Verify stats save to leaderboard

**Steps**:
1. Complete a game
2. Check leaderboard
3. Verify score appears

---

### **Test 22: XP Calculation**
**Objective**: Verify XP increases on correct answers

**Steps**:
1. Answer 5 questions correctly
2. Verify XP increased by 50

---

### **Test 23: Level Up**
**Objective**: Verify player level increases with XP

**Steps**:
1. Earn 100 XP
2. Verify player level = 2

---

### **Test 24: Browser Refresh**
**Objective**: Verify game state persists through refresh

**Steps**:
1. Play 3 questions
2. Refresh browser
3. Verify paused game offer appears

---

### **Test 25: Network Error Handling**
**Objective**: Verify graceful failure on network errors

**Steps**:
1. Disconnect network
2. Try to answer question
3. Verify error handling

---

## 📊 TEST RESULTS TEMPLATE

```markdown
## Test Results - [Date]

### Critical Tests (10)
- [ ] Test 1: Lose All 3 Lives
- [ ] Test 2: Lose Life on Question 10
- [ ] Test 3: Complete Level With 1 Life
- [ ] Test 4: Click NEXT LEVEL With 0 Lives
- [ ] Test 5: Resume Paused Game With 0 Lives
- [ ] Test 6: Double-Click Answer
- [ ] Test 7: Use Power-up During Result
- [ ] Test 8: Timeout With 1 Life
- [ ] Test 9: Shield Absorbs Timeout
- [ ] Test 10: Start New Game Clears State

### Important Tests (10)
- [ ] Test 11: Skip With 0 Lives
- [ ] Test 12: Practice Mode 20 Questions
- [ ] Test 13: Fifty-Fifty Power-up
- [ ] Test 14: Time Boost Power-up
- [ ] Test 15: Double Points Power-up
- [ ] Test 16: Streak Tracking
- [ ] Test 17: Best Streak Tracking
- [ ] Test 18: Pause and Resume
- [ ] Test 19: Multiple Paused Games
- [ ] Test 20: Answered Questions Tracking

### Nice-to-Have Tests (5)
- [ ] Test 21: Leaderboard Updates
- [ ] Test 22: XP Calculation
- [ ] Test 23: Level Up
- [ ] Test 24: Browser Refresh
- [ ] Test 25: Network Error Handling

**Total Passed**: 0/25
**Critical Passed**: 0/10

**Status**: ⚠️ TESTING IN PROGRESS

**Notes**:
[Add notes here]
```

---

## 🎯 PASS CRITERIA

### Production Ready:
- ✅ ALL 10 Critical Tests Pass
- ✅ At least 8/10 Important Tests Pass
- ✅ No console errors during normal gameplay
- ✅ No infinite loops or crashes
- ✅ Database operations work correctly

### Alpha Ready:
- ✅ At least 8/10 Critical Tests Pass
- ✅ At least 5/10 Important Tests Pass

### Beta Ready:
- ✅ ALL 10 Critical Tests Pass
- ✅ ALL 10 Important Tests Pass
- ✅ At least 3/5 Nice-to-Have Tests Pass

---

## 🔧 DEBUGGING TIPS

### If Test Fails:
1. **Check console logs** - All critical operations are logged
2. **Look for guard/failsafe messages** - ⚠️ or ❌ indicators
3. **Verify state** - Check React DevTools for state values
4. **Check database** - Verify paused game table
5. **Test in isolation** - Reproduce with minimal steps

### Common Issues:
- **Stats not updating**: Check `setStats` functional updates
- **Paused game interfering**: Check if deletePausedGame is called
- **Lives regenerating**: Check all failsafes are in place
- **State transitions**: Check guard conditions

### Logging Reference:
- `🎮` = Game events (start, end, state change)
- `✅` = Success operations
- `❌` = Failures or game over
- `⚠️` = Guards triggered
- `🛡️` = Shield activated
- `⏱️` = Timer events
- `⚡` = Power-up usage
- `📝` = Answer submission
- `🗑️` = Deletion operations
- `📊` = Stats updates

---

## 📈 PROGRESS TRACKING

**Date**: [Today's Date]
**Version**: v1.0-beta
**Tested By**: [Your Name]

**Current Status**: 
- Critical Bugs Fixed: 2/2 ✅
- Failsafes Added: 7/7 ✅
- Tests Passed: 0/25 ⏳

**Next Steps**:
1. Run all 10 critical tests
2. Document results
3. Fix any failing tests
4. Run important tests
5. Final verification
