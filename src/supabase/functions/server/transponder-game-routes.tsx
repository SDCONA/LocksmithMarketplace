import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const app = new Hono();

// Middleware
app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Create Supabase admin client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 TRANSPONDER MASTER GAME ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Initialize/Import Transponder Data
// ─────────────────────────────────────────────────────────────────────────────
app.post('/admin/import-transponder-data', async (c) => {
  try {
    const { data: vehicleData } = await c.req.json();
    
    if (!Array.isArray(vehicleData) || vehicleData.length === 0) {
      return c.json({ error: 'Invalid vehicle data provided' }, 400);
    }

    console.log(`📥 Importing ${vehicleData.length} vehicle transponder records...`);

    // Process and insert data
    const processedData = vehicleData.map(item => {
      const [yearStart, yearEnd] = parseYearRange(item.years);
      const difficulty = calculateDifficulty(item);
      const region = determineRegion(item.make);
      
      return {
        vehicle_make: item.make,
        vehicle_model: item.model,
        vehicle_years: item.years,
        year_start: yearStart,
        year_end: yearEnd,
        transponder_type: item.transponder,
        oem_key: item.oemKey || '—',
        category: item.category || 'car',
        region: region,
        difficulty_level: difficulty,
        times_asked: 0,
        times_correct: 0,
        accuracy_rate: null
      };
    });

    // Insert in batches of 100
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('transponder_fitments')
        .insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      totalInserted += batch.length;
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Inserted ${batch.length} records (Total: ${totalInserted})`);
    }

    return c.json({
      success: true,
      message: `Successfully imported ${totalInserted} vehicle records`,
      total: totalInserted
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    return c.json({
      error: 'Failed to import transponder data',
      details: error.message
    }, 500);
  }
});

// Helper functions
function parseYearRange(years: string): [number, number | null] {
  // Handle formats: "2013–2017", "2018+", "2015–", "2020"
  const plusMatch = years.match(/(\d{4})\+/);
  if (plusMatch) return [parseInt(plusMatch[1]), null];
  
  const rangeMatch = years.match(/(\d{4})[–-](\d{4})?/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = rangeMatch[2] ? parseInt(rangeMatch[2]) : null;
    return [start, end];
  }
  
  const singleYear = years.match(/(\d{4})/);
  if (singleYear) {
    const year = parseInt(singleYear[1]);
    return [year, year];
  }
  
  return [2000, null]; // Default fallback
}

function calculateDifficulty(item: any): number {
  // Difficulty factors:
  // 1. Year range complexity
  // 2. Transponder type rarity
  // 3. Multiple possible transponders
  // 4. Motorcycles are harder
  // 5. Newer = harder (more encryption)

  let difficulty = 1;

  // Year complexity
  if (item.years.includes('+') || !item.years.includes('–')) {
    difficulty += 1; // Open-ended or single year
  }

  // Transponder complexity
  const transponder = item.transponder.toUpperCase();
  if (transponder.includes('AES') || transponder.includes('ENCRYPTED') || transponder.includes('ID49')) {
    difficulty += 2; // Modern encryption
  } else if (transponder.includes('DST80') || transponder.includes('ID47') || transponder.includes('ID46')) {
    difficulty += 1; // Mid-level
  }

  // Multiple options
  if (transponder.includes('/') || transponder.includes('OR')) {
    difficulty += 1;
  }

  // Category
  if (item.category === 'motorcycle') {
    difficulty += 1;
  }

  // Clamp between 1-5
  return Math.min(Math.max(difficulty, 1), 5);
}

function determineRegion(make: string): string {
  const makeUpper = make.toUpperCase();
  
  // US brands
  const usBrands = ['FORD', 'CHEVROLET', 'GMC', 'BUICK', 'CADILLAC', 'CHRYSLER', 'DODGE', 'JEEP', 'HUMMER', 'LINCOLN'];
  if (usBrands.some(brand => makeUpper.includes(brand))) return 'US';
  
  // European brands
  const europeBrands = ['BMW', 'AUDI', 'VOLKSWAGEN', 'VW', 'MERCEDES', 'PORSCHE', 'SEAT', 'SKODA', 'RENAULT', 'PEUGEOT', 'CITROEN', 'FIAT', 'ALFA ROMEO', 'LANCIA', 'OPEL', 'VOLVO', 'LAND ROVER', 'JAGUAR', 'ROVER', 'DAF', 'IVECO', 'DACIA', 'MINI'];
  if (europeBrands.some(brand => makeUpper.includes(brand))) return 'Europe';
  
  // Asian brands
  const asiaBrands = ['TOYOTA', 'HONDA', 'NISSAN', 'MAZDA', 'LEXUS', 'MITSUBISHI', 'SUBARU', 'SUZUKI', 'ISUZU', 'DAIHATSU', 'HYUNDAI', 'KIA', 'DAEWOO', 'ACURA'];
  if (asiaBrands.some(brand => makeUpper.includes(brand))) return 'Asia';
  
  // Motorcycles
  const bikeBrands = ['KAWASAKI', 'YAMAHA'];
  if (bikeBrands.some(brand => makeUpper.includes(brand))) return 'Asia';
  
  return 'Unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Random Question
// ─────────────────────────────────────────────────────────────────────────────
app.get('/game/question', async (c) => {
  try {
    const difficulty = parseInt(c.req.query('difficulty') || '1');
    const mode = c.req.query('mode') || 'classic'; // classic, brand, region
    const filter = c.req.query('filter'); // brand name or region

    let query = supabase
      .from('transponder_fitments')
      .select('*')
      .eq('difficulty_level', difficulty);

    // Apply filters based on mode
    if (mode === 'brand' && filter) {
      query = query.eq('vehicle_make', filter);
    } else if (mode === 'region' && filter) {
      query = query.eq('region', filter);
    }

    // Step 1: Get total count of matching records
    const countQuery = supabase
      .from('transponder_fitments')
      .select('id', { count: 'exact', head: true })
      .eq('difficulty_level', difficulty);
    
    if (mode === 'brand' && filter) {
      countQuery.eq('vehicle_make', filter);
    } else if (mode === 'region' && filter) {
      countQuery.eq('region', filter);
    }

    const { count } = await countQuery;

    if (!count || count === 0) {
      return c.json({ error: 'No questions available' }, 404);
    }

    // Step 2: Calculate random offset (true randomization)
    const randomOffset = Math.floor(Math.random() * Math.max(0, count - 1));

    // Step 3: Fetch 1 record from random position
    const { data: fitments, error } = await query
      .range(randomOffset, randomOffset)
      .limit(1);

    if (error) throw error;
    if (!fitments || fitments.length === 0) {
      return c.json({ error: 'No questions available' }, 404);
    }

    // Pick the random record
    const correctAnswer = fitments[0];

    // Generate 3 wrong answers - get diverse pool
    const { data: allFitments } = await supabase
      .from('transponder_fitments')
      .select('*')
      .neq('id', correctAnswer.id)
      .limit(500); // Larger pool for better wrong answer variety

    const wrongAnswers = generateWrongAnswers(correctAnswer, allFitments || [], 3);

    // Shuffle options
    const options = shuffleArray([
      { text: correctAnswer.transponder_type, correct: true },
      ...wrongAnswers.map(ans => ({ text: ans, correct: false }))
    ]);

    return c.json({
      question: {
        id: correctAnswer.id,
        make: correctAnswer.vehicle_make,
        model: correctAnswer.vehicle_model,
        year: correctAnswer.vehicle_years,
        difficulty: correctAnswer.difficulty_level,
        category: correctAnswer.category
      },
      options,
      correctAnswer: correctAnswer.transponder_type
    });

  } catch (error) {
    console.error('❌ Error generating question:', error);
    return c.json({ error: 'Failed to generate question', details: error.message }, 500);
  }
});

function generateWrongAnswers(correct: any, pool: any[], count: number): string[] {
  // Get plausible wrong answers
  const allTransponders = pool.map(f => f.transponder_type).filter(t => t !== correct.transponder_type);
  
  // Deduplicate
  const unique = [...new Set(allTransponders)];
  
  // Shuffle and take
  const shuffled = shuffleArray(unique);
  return shuffled.slice(0, count);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─────────────────────────────────────────────────────────────────────────────
// Submit Answer
// ─────────────────────────────────────────────────────────────────────────────
app.post('/game/answer', async (c) => {
  try {
    const { questionId, userAnswer, responseTime, mode } = await c.req.json();

    // Get correct answer
    const { data: question, error } = await supabase
      .from('transponder_fitments')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) throw error;

    const isCorrect = userAnswer === question.transponder_type;

    // Update statistics
    await supabase
      .from('transponder_fitments')
      .update({
        times_asked: question.times_asked + 1,
        times_correct: isCorrect ? question.times_correct + 1 : question.times_correct,
        accuracy_rate: ((isCorrect ? question.times_correct + 1 : question.times_correct) / (question.times_asked + 1)) * 100
      })
      .eq('id', questionId);

    return c.json({
      correct: isCorrect,
      correctAnswer: question.transponder_type,
      explanation: `${question.vehicle_make} ${question.vehicle_model} (${question.vehicle_years}) uses ${question.transponder_type}`,
      responseTime
    });

  } catch (error) {
    console.error('❌ Error submitting answer:', error);
    return c.json({ error: 'Failed to submit answer', details: error.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Save Game Session
// ─────────────────────────────────────────────────────────────────────────────
app.post('/game/save-session', async (c) => {
  try {
    const { mode, score, questionsAnswered, correctAnswers, bestStreak, level } = await c.req.json();
    
    const sessionId = `game_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
    
    // For now, just return success without persisting (game is local-only)
    // TODO: Use game_sessions table for authenticated users
    
    return c.json({
      success: true,
      sessionId,
      message: 'Game session saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving game session:', error);
    return c.json({ error: 'Failed to save game session', details: error.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Leaderboard
// ─────────────────────────────────────────────────────────────────────────────
app.get('/game/leaderboard', async (c) => {
  try {
    const category = c.req.query('category') || 'alltime';
    
    // Return empty leaderboard for now (will implement with game_sessions table later)
    const leaderboard = [];
    
    return c.json({ leaderboard });
    
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard', details: error.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Get User Stats
// ─────────────────────────────────────────────────────────────────────────────
app.get('/game/user-stats', async (c) => {
  try {
    const username = c.req.query('username') || 'Guest';
    
    // Return default stats for now (local only)
    const stats = {
      totalGamesPlayed: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      bestScore: 0,
      bestStreak: 0,
      totalXP: 0,
    };
    
    return c.json(stats);
    
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    return c.json({ error: 'Failed to fetch user stats', details: error.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Daily Challenge
// ─────────────────────────────────────────────────────────────────────────────
app.get('/game/daily-challenge', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Return empty challenge for now
    const challenge = {
      date: today,
      questionIds: [],
      createdAt: new Date().toISOString(),
    };
    
    return c.json(challenge);
    
  } catch (error) {
    console.error('❌ Error fetching daily challenge:', error);
    return c.json({ error: 'Failed to fetch daily challenge', details: error.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Brand-Specific Questions
// ─────────────────────────────────────────────────────────────────────────────
app.get('/game/brands', async (c) => {
  try {
    const { data, error } = await supabase
      .from('transponder_fitments')
      .select('vehicle_make')
      .order('vehicle_make');
    
    if (error) throw error;
    
    // Get unique brands
    const brands = [...new Set(data.map(item => item.vehicle_make))].sort();
    
    return c.json({ brands });
    
  } catch (error) {
    console.error('❌ Error fetching brands:', error);
    return c.json({ error: 'Failed to fetch brands', details: error.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Achievements
// ─────────────────────────────────────────────────────────────────────────────
app.get('/game/achievements', async (c) => {
  try {
    const username = c.req.query('username') || 'Guest';
    
    // Return default achievements (local only)
    const achievements = [
      { id: 'first_steps', unlocked: false },
      { id: 'perfect_game', unlocked: false },
      { id: 'on_fire', unlocked: false },
      { id: 'speed_demon', unlocked: false },
      { id: 'know_it_all', unlocked: false },
      { id: 'transponder_king', unlocked: false },
      { id: 'flawless_week', unlocked: false },
      { id: 'master_level', unlocked: false },
    ];
    
    return c.json({ achievements });
    
  } catch (error) {
    console.error('❌ Error fetching achievements:', error);
    return c.json({ error: 'Failed to fetch achievements', details: error.message }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'transponder-master' });
});

export default app;