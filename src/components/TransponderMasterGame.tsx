import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { 
  Timer, Trophy, Heart, Zap, X, ArrowLeft, Star, Award, 
  Target, TrendingUp, Users, Clock, CheckCircle2, Flame,
  Shield, SkipForward, Plus, Gift, Crown, Medal, Sparkles
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// ==================== INTERFACES ====================

interface Question {
  id: string;
  make: string;
  model: string;
  year: string;
  difficulty: number;
  category: string;
}

interface Option {
  text: string;
  correct: boolean;
}

interface GameStats {
  score: number;
  streak: number;
  lives: number;
  questionsAnswered: number;
  correctAnswers: number;
  level: number;
  xp: number;
  powerUps: PowerUps;
}

interface PowerUps {
  timeBoost: number;
  fiftyFifty: number;
  skip: number;
  doublePoints: number;
  shield: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  level: number;
  accuracy: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

// ==================== GAME COMPONENT ====================

interface TransponderMasterGameProps {
  onBack: () => void;
}

export function TransponderMasterGame({ onBack }: TransponderMasterGameProps) {
  // ===== STATE =====
  const [gameState, setGameState] = useState<
    "menu" | "mode-select" | "playing" | "gameover" | "leaderboard" | "stats" | "achievements" | "daily-challenge"
  >("menu");
  
  const [selectedMode, setSelectedMode] = useState<string>("classic");
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [maxTime, setMaxTime] = useState(15);
  const [doublePointsActive, setDoublePointsActive] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [removedOptions, setRemovedOptions] = useState<number[]>([]);
  const [showQuitModal, setShowQuitModal] = useState(false);
  
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    streak: 0,
    lives: 3,
    questionsAnswered: 0,
    correctAnswers: 0,
    level: 1,
    xp: 0,
    powerUps: {
      timeBoost: 3,
      fiftyFifty: 2,
      skip: 2,
      doublePoints: 1,
      shield: 1,
    },
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "first_steps", name: "First Steps", description: "Complete first game", icon: "🎯", unlocked: false },
    { id: "perfect_game", name: "Perfect Game", description: "15/15 correct", icon: "💯", unlocked: false },
    { id: "on_fire", name: "On Fire", description: "10 streak", icon: "🔥", unlocked: false },
    { id: "speed_demon", name: "Speed Demon", description: "Answer in <3 seconds", icon: "⚡", unlocked: false },
    { id: "know_it_all", name: "Know-It-All", description: "100 questions correct", icon: "🧠", unlocked: false },
    { id: "transponder_king", name: "Transponder King", description: "Reach level 10", icon: "👑", unlocked: false },
    { id: "flawless_week", name: "Flawless Week", description: "Win 5 games in a row", icon: "💎", unlocked: false },
    { id: "master_level", name: "Master Level", description: "Reach level 15", icon: "🌟", unlocked: false },
  ]);

  const [userStats, setUserStats] = useState({
    totalGamesPlayed: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    bestScore: 0,
    bestStreak: 0,
    totalXP: 0,
  });

  // ===== GAME MODES =====
  const gameModes: GameMode[] = [
    {
      id: "classic",
      name: "Classic Mode",
      description: "15 questions, 3 lives, increasing difficulty",
      icon: Trophy,
      color: "from-blue-500 to-purple-600",
    },
    {
      id: "practice",
      name: "Practice Mode",
      description: "No timer, no lives lost, learn at your pace",
      icon: Target,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "endless",
      name: "Endless Mode",
      description: "Keep playing until 3 wrong answers",
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
    },
    {
      id: "daily",
      name: "Daily Challenge",
      description: "Same questions for all players, one attempt per day",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "expert",
      name: "Brand Expert",
      description: "Focus on one manufacturer",
      icon: Award,
      color: "from-purple-500 to-pink-600",
    },
  ];

  // ===== TIMER =====
  useEffect(() => {
    if (gameState !== "playing" || showResult || selectedMode === "practice") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return maxTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, showResult, selectedMode]);

  // ===== LEVEL CALCULATION =====
  const calculateLevel = (xp: number): number => {
    // Level 1: 0-99 XP
    // Level 2: 100-249 XP
    // Level 3: 250-499 XP
    // etc.
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    if (xp < 1000) return 4;
    if (xp < 2000) return 5;
    if (xp < 3500) return 6;
    if (xp < 5500) return 7;
    if (xp < 8000) return 8;
    if (xp < 11000) return 9;
    if (xp < 15000) return 10;
    if (xp < 20000) return 11;
    if (xp < 26000) return 12;
    if (xp < 33000) return 13;
    if (xp < 41000) return 14;
    return 15;
  };

  // ===== FETCH QUESTION =====
  const fetchQuestion = async () => {
    try {
      const difficulty = Math.min(Math.floor(stats.questionsAnswered / 5) + 1, 5);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/game/question?difficulty=${difficulty}&mode=${selectedMode}`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.question) {
        setQuestion(data.question);
        setOptions(data.options);
        setTimeLeft(maxTime);
        setShowResult(false);
        setSelectedAnswer(null);
        setRemovedOptions([]);
      }
    } catch (error) {
      console.error("Failed to fetch question:", error);
    }
  };

  // ===== START GAME =====
  const startGame = (mode: string) => {
    setSelectedMode(mode);
    setGameState("playing");
    
    const initialLives = mode === "endless" ? 3 : mode === "practice" ? 999 : 3;
    const initialTime = mode === "practice" ? 999 : 15;
    
    setMaxTime(initialTime);
    setStats({
      score: 0,
      streak: 0,
      lives: initialLives,
      questionsAnswered: 0,
      correctAnswers: 0,
      level: calculateLevel(userStats.totalXP),
      xp: userStats.totalXP,
      powerUps: {
        timeBoost: 3,
        fiftyFifty: 2,
        skip: 2,
        doublePoints: 1,
        shield: 1,
      },
    });
    setDoublePointsActive(false);
    setShieldActive(false);
    fetchQuestion();
  };

  // ===== CALCULATE SCORE =====
  const calculateScore = (timeRemaining: number, streak: number, difficulty: number): number => {
    const baseScore = 100;
    const timeBonus = selectedMode === "practice" ? 0 : timeRemaining * 10;
    const streakBonus = streak * 50;
    const difficultyMultiplier = 1 + (difficulty * 0.2);
    
    let total = Math.floor((baseScore + timeBonus + streakBonus) * difficultyMultiplier);
    
    if (doublePointsActive) {
      total *= 2;
      setDoublePointsActive(false);
    }
    
    return total;
  };

  // ===== HANDLE ANSWER =====
  const handleAnswer = async (answer: string) => {
    if (showResult || !question) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/game/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            questionId: question.id,
            userAnswer: answer,
            responseTime: maxTime - timeLeft,
            mode: selectedMode,
          }),
        }
      );

      const result = await response.json();
      setIsCorrect(result.correct);

      // Update stats
      setStats((prev) => {
        const earnedXP = result.correct ? 10 : 0;
        const newXP = prev.xp + earnedXP;
        const newLevel = calculateLevel(newXP);
        
        const livesLost = result.correct ? 0 : (shieldActive ? 0 : 1);
        if (shieldActive && !result.correct) {
          setShieldActive(false);
        }
        
        const newStats = {
          ...prev,
          questionsAnswered: prev.questionsAnswered + 1,
          correctAnswers: result.correct ? prev.correctAnswers + 1 : prev.correctAnswers,
          streak: result.correct ? prev.streak + 1 : 0,
          lives: prev.lives - livesLost,
          score: result.correct 
            ? prev.score + calculateScore(timeLeft, prev.streak, question.difficulty)
            : prev.score,
          xp: newXP,
          level: newLevel,
        };

        // Check achievements
        checkAchievements(newStats, maxTime - timeLeft);

        // Check game over
        const maxQuestions = selectedMode === "classic" ? 15 
                           : selectedMode === "practice" ? 10 
                           : selectedMode === "endless" ? 999 
                           : 15;
        if (newStats.lives <= 0 || (selectedMode === "classic" && newStats.questionsAnswered >= maxQuestions)) {
          setTimeout(() => {
            saveGameSession(newStats);
            setGameState("gameover");
          }, 2000);
        }

        return newStats;
      });

      // Next question after 2 seconds (unless game already over)
      setTimeout(() => {
        fetchQuestion();
      }, 2000);

    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  // ===== HANDLE TIMEOUT =====
  const handleTimeout = () => {
    const livesLost = shieldActive ? 0 : 1;
    if (shieldActive) {
      setShieldActive(false);
    }
    
    setStats((prev) => ({
      ...prev,
      questionsAnswered: prev.questionsAnswered + 1,
      streak: 0,
      lives: prev.lives - livesLost,
    }));

    if (stats.lives <= 1 && !shieldActive) {
      saveGameSession(stats);
      setGameState("gameover");
    } else {
      fetchQuestion();
    }
  };

  // ===== POWER-UPS =====
  const usePowerUp = (type: keyof PowerUps) => {
    if (stats.powerUps[type] <= 0 || showResult) return;

    setStats(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        [type]: prev.powerUps[type] - 1,
      },
    }));

    switch (type) {
      case "timeBoost":
        setTimeLeft(prev => Math.min(prev + 10, maxTime));
        break;
      case "fiftyFifty":
        // Remove 2 wrong answers
        const wrongIndices = options
          .map((opt, idx) => (!opt.correct ? idx : -1))
          .filter(idx => idx !== -1);
        const toRemove = wrongIndices.slice(0, 2);
        setRemovedOptions(toRemove);
        break;
      case "skip":
        fetchQuestion();
        break;
      case "doublePoints":
        setDoublePointsActive(true);
        break;
      case "shield":
        setShieldActive(true);
        break;
    }
  };

  // ===== CHECK ACHIEVEMENTS =====
  const checkAchievements = (currentStats: GameStats, responseTime: number) => {
    const newAchievements = [...achievements];
    
    // First Steps
    if (currentStats.questionsAnswered === 1) {
      newAchievements[0].unlocked = true;
    }
    
    // Perfect Game
    if (currentStats.questionsAnswered === 15 && currentStats.correctAnswers === 15) {
      newAchievements[1].unlocked = true;
    }
    
    // On Fire
    if (currentStats.streak >= 10) {
      newAchievements[2].unlocked = true;
    }
    
    // Speed Demon
    if (responseTime < 3) {
      newAchievements[3].unlocked = true;
    }
    
    // Transponder King
    if (currentStats.level >= 10) {
      newAchievements[5].unlocked = true;
    }
    
    // Master Level
    if (currentStats.level >= 15) {
      newAchievements[7].unlocked = true;
    }
    
    setAchievements(newAchievements);
  };

  // ===== SAVE GAME SESSION =====
  const saveGameSession = async (finalStats: GameStats) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/game/save-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            mode: selectedMode,
            score: finalStats.score,
            questionsAnswered: finalStats.questionsAnswered,
            correctAnswers: finalStats.correctAnswers,
            bestStreak: finalStats.streak,
            level: finalStats.level,
          }),
        }
      );
      
      // Update user stats
      setUserStats(prev => ({
        ...prev,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + finalStats.questionsAnswered,
        totalCorrectAnswers: prev.totalCorrectAnswers + finalStats.correctAnswers,
        bestScore: Math.max(prev.bestScore, finalStats.score),
        bestStreak: Math.max(prev.bestStreak, finalStats.streak),
        totalXP: finalStats.xp,
      }));
    } catch (error) {
      console.error("Failed to save game session:", error);
    }
  };

  // ===== LOAD LEADERBOARD =====
  const loadLeaderboard = async (category: string = "alltime") => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/game/leaderboard?category=${category}`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  // ==================== RENDER SCREENS ====================

  // ===== MAIN MENU =====
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pt-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Hub
            </Button>
          </div>

          {/* Title Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg animate-pulse">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                🎮 TRANSPONDER MASTER
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Test your automotive locksmith knowledge!
              </p>
              
              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">{calculateLevel(userStats.totalXP)}</div>
                  <div className="text-sm text-white/80">Level</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">{userStats.bestScore}</div>
                  <div className="text-sm text-white/80">Best Score</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">{userStats.totalGamesPlayed}</div>
                  <div className="text-sm text-white/80">Games Played</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">
                    {userStats.totalQuestionsAnswered > 0 
                      ? Math.round((userStats.totalCorrectAnswers / userStats.totalQuestionsAnswered) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-white/80">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => setGameState("mode-select")}
              className="h-24 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
              <Trophy className="w-8 h-8 mr-3" />
              PLAY GAME
            </Button>
            
            <Button
              onClick={() => {
                loadLeaderboard();
                setGameState("leaderboard");
              }}
              className="h-24 text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg"
            >
              <Medal className="w-8 h-8 mr-3" />
              LEADERBOARD
            </Button>
            
            <Button
              onClick={() => setGameState("stats")}
              className="h-24 text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
            >
              <TrendingUp className="w-8 h-8 mr-3" />
              MY STATS
            </Button>
            
            <Button
              onClick={() => setGameState("achievements")}
              className="h-24 text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg"
            >
              <Award className="w-8 h-8 mr-3" />
              ACHIEVEMENTS
            </Button>
          </div>

          {/* How to Play */}
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-3 text-lg">How to Play:</h3>
            <ul className="space-y-2 text-white/90 text-sm">
              <li>• Match the correct transponder to each vehicle</li>
              <li>• Answer within the time limit</li>
              <li>• Build streaks for bonus points</li>
              <li>• Use power-ups strategically</li>
              <li>• Difficulty increases as you progress</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ===== MODE SELECT =====
  if (gameState === "mode-select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 pt-4">
            <Button
              variant="ghost"
              onClick={() => setGameState("menu")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">SELECT GAME MODE</h2>
            <p className="text-white/80">Choose how you want to play</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {gameModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => startGame(mode.id)}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105 text-left group"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${mode.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{mode.name}</h3>
                  <p className="text-white/80">{mode.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ===== LEADERBOARD =====
  if (gameState === "leaderboard") {
    const [leaderboardTab, setLeaderboardTab] = useState<"alltime" | "weekly" | "daily">("alltime");
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 pt-4">
            <Button
              variant="ghost"
              onClick={() => setGameState("menu")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white">LEADERBOARD</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => {
                  setLeaderboardTab("alltime");
                  loadLeaderboard("alltime");
                }}
                className={`flex-1 ${leaderboardTab === "alltime" ? "bg-white/30" : "bg-white/10"}`}
              >
                All Time
              </Button>
              <Button
                onClick={() => {
                  setLeaderboardTab("weekly");
                  loadLeaderboard("weekly");
                }}
                className={`flex-1 ${leaderboardTab === "weekly" ? "bg-white/30" : "bg-white/10"}`}
              >
                Weekly
              </Button>
              <Button
                onClick={() => {
                  setLeaderboardTab("daily");
                  loadLeaderboard("daily");
                }}
                className={`flex-1 ${leaderboardTab === "daily" ? "bg-white/30" : "bg-white/10"}`}
              >
                Today
              </Button>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <div className="text-center text-white/70 py-8">
                  No players yet. Be the first!
                </div>
              ) : (
                leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`bg-white/10 rounded-xl p-4 flex items-center justify-between ${
                      idx < 3 ? "border-2 border-yellow-400/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                        idx === 0 ? "bg-yellow-400 text-gray-900" :
                        idx === 1 ? "bg-gray-300 text-gray-900" :
                        idx === 2 ? "bg-orange-400 text-gray-900" :
                        "bg-white/20 text-white"
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-white font-bold">{entry.username}</div>
                        <div className="text-white/70 text-sm">Level {entry.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{entry.score}</div>
                      <div className="text-white/70 text-sm">{entry.accuracy}% accuracy</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== STATS =====
  if (gameState === "stats") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 pt-4">
            <Button
              variant="ghost"
              onClick={() => setGameState("menu")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white">MY STATISTICS</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-white">{userStats.totalGamesPlayed}</div>
                <div className="text-white/80 mt-2">Games Played</div>
              </div>
              <div className="bg-white/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-white">{userStats.bestScore}</div>
                <div className="text-white/80 mt-2">Best Score</div>
              </div>
              <div className="bg-white/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-white">{userStats.bestStreak}</div>
                <div className="text-white/80 mt-2">Best Streak</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-xl p-6">
                <div className="text-white/80 mb-2">Total Questions</div>
                <div className="text-3xl font-bold text-white">{userStats.totalQuestionsAnswered}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-6">
                <div className="text-white/80 mb-2">Correct Answers</div>
                <div className="text-3xl font-bold text-white">{userStats.totalCorrectAnswers}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-6">
                <div className="text-white/80 mb-2">Overall Accuracy</div>
                <div className="text-3xl font-bold text-white">
                  {userStats.totalQuestionsAnswered > 0 
                    ? Math.round((userStats.totalCorrectAnswers / userStats.totalQuestionsAnswered) * 100)
                    : 0}%
                </div>
              </div>
              <div className="bg-white/20 rounded-xl p-6">
                <div className="text-white/80 mb-2">Total XP</div>
                <div className="text-3xl font-bold text-white">{userStats.totalXP}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ACHIEVEMENTS =====
  if (gameState === "achievements") {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 pt-4">
            <Button
              variant="ghost"
              onClick={() => setGameState("menu")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white">ACHIEVEMENTS</h2>
              <p className="text-white/80 mt-2">{unlockedCount} / {achievements.length} Unlocked</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-xl p-6 border-2 ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400/50"
                      : "bg-white/10 border-white/20 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{achievement.name}</h3>
                      <p className="text-white/80 text-sm">{achievement.description}</p>
                      {achievement.unlocked && (
                        <div className="mt-2 text-yellow-400 text-sm font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Unlocked!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== GAME OVER =====
  if (gameState === "gameover") {
    const accuracy = stats.questionsAnswered > 0 
      ? ((stats.correctAnswers / stats.questionsAnswered) * 100).toFixed(1)
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-700 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {stats.correctAnswers === stats.questionsAnswered ? "🏆" : "💀"}
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">
              {stats.correctAnswers === stats.questionsAnswered ? "PERFECT!" : "GAME OVER"}
            </h1>
            <p className="text-xl text-white/80">
              {stats.correctAnswers === stats.questionsAnswered 
                ? "Flawless victory!" 
                : "Better luck next time!"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-white">{stats.score}</div>
              <div className="text-white/80 mt-1">Final Score</div>
            </div>
            <div className="bg-white/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-white">{accuracy}%</div>
              <div className="text-white/80 mt-1">Accuracy</div>
            </div>
            <div className="bg-white/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-white">{stats.questionsAnswered}</div>
              <div className="text-white/80 mt-1">Questions</div>
            </div>
            <div className="bg-white/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-white">{stats.correctAnswers}</div>
              <div className="text-white/80 mt-1">Correct</div>
            </div>
            <div className="bg-white/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-white">{stats.streak}</div>
              <div className="text-white/80 mt-1">Best Streak</div>
            </div>
            <div className="bg-white/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-white">{stats.level}</div>
              <div className="text-white/80 mt-1">Level</div>
            </div>
          </div>

          <Button
            onClick={() => startGame(selectedMode)}
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg mb-4"
          >
            PLAY AGAIN
          </Button>

          <Button
            onClick={() => setGameState("menu")}
            variant="outline"
            className="w-full h-12 text-white border-white/30 hover:bg-white/10"
          >
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  // ===== PLAYING SCREEN =====
  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center">
        <div className="text-white text-2xl">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4 pb-20 md:pb-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setShowQuitModal(true)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quit
            </Button>

            <div className="flex items-center gap-6">
              {selectedMode !== "practice" && (
                <div className="flex items-center gap-2">
                  <Timer className={`w-6 h-6 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`} />
                  <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                    {timeLeft}s
                  </span>
                </div>
              )}
              {selectedMode !== "practice" && (
                <div className="flex items-center gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-6 h-6 ${i < stats.lives ? 'text-red-500 fill-red-500' : 'text-white/30'}`}
                    />
                  ))}
                  {shieldActive && <Shield className="w-6 h-6 text-blue-400 fill-blue-400 animate-pulse" />}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{stats.score}</div>
              <div className="text-sm text-white/70">Score • Level {stats.level}</div>
            </div>
          </div>

          {stats.streak > 2 && (
            <div className="flex items-center gap-2 text-yellow-400 mb-4">
              <Flame className="w-5 h-5 fill-yellow-400" />
              <span className="font-bold">🔥 {stats.streak} Streak!</span>
              {doublePointsActive && <span className="ml-2 text-green-400 font-bold">2× POINTS!</span>}
            </div>
          )}

          {/* Power-Ups */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => usePowerUp("timeBoost")}
              disabled={stats.powerUps.timeBoost <= 0 || showResult || selectedMode === "practice"}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-2 flex items-center gap-2 text-white text-sm font-bold"
            >
              <Clock className="w-4 h-4" />
              +10s ({stats.powerUps.timeBoost})
            </button>
            <button
              onClick={() => usePowerUp("fiftyFifty")}
              disabled={stats.powerUps.fiftyFifty <= 0 || showResult || removedOptions.length > 0}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-2 flex items-center gap-2 text-white text-sm font-bold"
            >
              <Target className="w-4 h-4" />
              50/50 ({stats.powerUps.fiftyFifty})
            </button>
            <button
              onClick={() => usePowerUp("skip")}
              disabled={stats.powerUps.skip <= 0 || showResult}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-2 flex items-center gap-2 text-white text-sm font-bold"
            >
              <SkipForward className="w-4 h-4" />
              Skip ({stats.powerUps.skip})
            </button>
            <button
              onClick={() => usePowerUp("doublePoints")}
              disabled={stats.powerUps.doublePoints <= 0 || showResult || doublePointsActive}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-2 flex items-center gap-2 text-white text-sm font-bold"
            >
              <Sparkles className="w-4 h-4" />
              2× ({stats.powerUps.doublePoints})
            </button>
            <button
              onClick={() => usePowerUp("shield")}
              disabled={stats.powerUps.shield <= 0 || showResult || shieldActive || selectedMode === "practice"}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-2 flex items-center gap-2 text-white text-sm font-bold"
            >
              <Shield className="w-4 h-4" />
              Shield ({stats.powerUps.shield})
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-sm font-semibold text-gray-500 mb-2">
              Question {stats.questionsAnswered + 1} • Level {question.difficulty} • {selectedMode === "practice" ? "Practice Mode" : ""}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🚗 Which transponder fits:
            </h2>
            <div className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl px-8 py-4 border-2 border-purple-200">
              <div className="text-2xl font-bold text-purple-900">
                {question.make} {question.model}
              </div>
              <div className="text-lg text-purple-700 mt-1">{question.year}</div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {options.map((option, index) => {
              if (removedOptions.includes(index)) return null;
              
              const isSelected = selectedAnswer === option.text;
              const showCorrect = showResult && option.correct;
              const showWrong = showResult && isSelected && !option.correct;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.text)}
                  disabled={showResult}
                  className={`
                    w-full p-6 rounded-xl text-left font-medium transition-all transform
                    ${!showResult && 'hover:scale-[1.02] hover:shadow-lg cursor-pointer'}
                    ${!showResult && 'bg-gray-50 border-2 border-gray-200 hover:border-purple-400'}
                    ${showCorrect && 'bg-green-100 border-2 border-green-500 animate-pulse'}
                    ${showWrong && 'bg-red-100 border-2 border-red-500 animate-shake'}
                    ${showResult && !isSelected && !option.correct && 'bg-gray-100 border-2 border-gray-200 opacity-50'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                        ${!showResult && 'bg-purple-100 text-purple-700'}
                        ${showCorrect && 'bg-green-500 text-white'}
                        ${showWrong && 'bg-red-500 text-white'}
                        ${showResult && !isSelected && !option.correct && 'bg-gray-300 text-gray-600'}
                      `}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="text-gray-900">{option.text}</div>
                    </div>
                    {showCorrect && <span className="text-2xl">✅</span>}
                    {showWrong && <span className="text-2xl">❌</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress */}
          {selectedMode === "classic" && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{stats.questionsAnswered}/15</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.questionsAnswered / 15) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-3xl font-bold text-white mb-2">Quit Game?</h2>
              <p className="text-white/80 text-lg">
                Are you sure you want to quit? Your progress will be lost.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowQuitModal(false)}
                className="flex-1 h-14 text-lg font-bold bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                Continue Playing
              </Button>
              <Button
                onClick={() => {
                  setShowQuitModal(false);
                  setGameState("mode-select");
                  setQuestion(null);
                  setStats({
                    score: 0,
                    streak: 0,
                    lives: 3,
                    questionsAnswered: 0,
                    correctAnswers: 0,
                    level: 1,
                    xp: 0,
                    powerUps: { timeBoost: 2, fiftyFifty: 2, skip: 1, doublePoints: 2, shield: 1 }
                  });
                }}
                className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                Quit Game
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}