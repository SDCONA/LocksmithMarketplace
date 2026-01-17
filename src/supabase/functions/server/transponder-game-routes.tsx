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
// 🎮 TRANSPONDER MASTER GAME ROUTES - PRACTICE MODE ONLY
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
        throw error;
      }

      totalInserted += batch.length;
    }

    return c.json({
      success: true,
      message: `Successfully imported ${totalInserted} vehicle records`,
      total: totalInserted
    });

  } catch (error) {
    return c.json({
      error: 'Failed to import transponder data',
      details: error.message
    }, 500);
  }
});

// Helper functions
function parseYearRange(years: string): [number, number | null] {
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
  
  return [2000, null];
}

function calculateDifficulty(item: any): number {
  let difficulty = 1;

  if (item.years.includes('+') || !item.years.includes('–')) {
    difficulty += 1;
  }

  const transponder = item.transponder.toUpperCase();
  if (transponder.includes('AES') || transponder.includes('ENCRYPTED') || transponder.includes('ID49')) {
    difficulty += 2;
  } else if (transponder.includes('DST80') || transponder.includes('ID47') || transponder.includes('ID46')) {
    difficulty += 1;
  }

  if (transponder.includes('/') || transponder.includes('OR')) {
    difficulty += 1;
  }

  if (item.category === 'motorcycle') {
    difficulty += 1;
  }

  return Math.min(Math.max(difficulty, 1), 5);
}

function determineRegion(make: string): string {
  const makeUpper = make.toUpperCase();
  
  const usBrands = ['FORD', 'CHEVROLET', 'GMC', 'BUICK', 'CADILLAC', 'CHRYSLER', 'DODGE', 'JEEP', 'HUMMER', 'LINCOLN'];
  if (usBrands.some(brand => makeUpper.includes(brand))) return 'US';
  
  const europeBrands = ['BMW', 'AUDI', 'VOLKSWAGEN', 'VW', 'MERCEDES', 'PORSCHE', 'SEAT', 'SKODA', 'RENAULT', 'PEUGEOT', 'CITROEN', 'FIAT', 'ALFA ROMEO', 'LANCIA', 'OPEL', 'VOLVO', 'LAND ROVER', 'JAGUAR', 'ROVER', 'DAF', 'IVECO', 'DACIA', 'MINI'];
  if (europeBrands.some(brand => makeUpper.includes(brand))) return 'Europe';
  
  const asiaBrands = ['TOYOTA', 'HONDA', 'NISSAN', 'MAZDA', 'LEXUS', 'MITSUBISHI', 'SUBARU', 'SUZUKI', 'ISUZU', 'DAIHATSU', 'HYUNDAI', 'KIA', 'DAEWOO', 'ACURA'];
  if (asiaBrands.some(brand => makeUpper.includes(brand))) return 'Asia';
  
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
    const mode = c.req.query('mode') || 'classic';
    const filter = c.req.query('filter');
    const excludeIds = c.req.query('exclude');
    
    const excludedIds = excludeIds ? excludeIds.split(',').filter(id => id.trim()) : [];

    let actualDifficulty = difficulty;
    let count = 0;
    
    for (let diff = difficulty; diff >= 1; diff--) {
      let countQuery = supabase
        .from('transponder_fitments')
        .select('id', { count: 'exact', head: true })
        .eq('difficulty_level', diff);
      
      if (excludedIds.length > 0) {
        countQuery = countQuery.not('id', 'in', `(${excludedIds.join(',')})`);
      }
      
      if (mode === 'brand' && filter) {
        countQuery = countQuery.eq('vehicle_make', filter);
      } else if (mode === 'region' && filter) {
        countQuery = countQuery.eq('region', filter);
      }

      const { count: c } = await countQuery;
      
      if (c && c > 0) {
        count = c;
        actualDifficulty = diff;
        break;
      }
    }

    if (!count || count === 0) {
      return c.json({ error: 'No questions available' }, 404);
    }

    let query = supabase
      .from('transponder_fitments')
      .select('*')
      .eq('difficulty_level', actualDifficulty);

    if (mode === 'brand' && filter) {
      query = query.eq('vehicle_make', filter);
    } else if (mode === 'region' && filter) {
      query = query.eq('region', filter);
    }

    if (excludedIds.length > 0) {
      query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    const randomOffset = Math.floor(Math.random() * Math.max(0, count - 1));

    const { data: fitments, error } = await query
      .range(randomOffset, randomOffset)
      .limit(1);

    if (error) throw error;
    if (!fitments || fitments.length === 0) {
      return c.json({ error: 'No questions available' }, 404);
    }

    const correctAnswer = fitments[0];

    const { data: allFitments } = await supabase
      .from('transponder_fitments')
      .select('*')
      .neq('id', correctAnswer.id)
      .limit(500);

    const wrongAnswers = generateWrongAnswers(correctAnswer, allFitments || [], 3);

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
    return c.json({ error: 'Failed to generate question', details: error.message }, 500);
  }
});

function generateWrongAnswers(correct: any, pool: any[], count: number): string[] {
  const allTransponders = pool.map(f => f.transponder_type).filter(t => t !== correct.transponder_type);
  const unique = [...new Set(allTransponders)];
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
    return c.json({ error: 'Failed to submit answer', details: error.message }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'transponder-master' });
});

export default app;