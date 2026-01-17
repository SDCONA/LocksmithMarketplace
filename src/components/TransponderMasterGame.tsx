import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { createClient } from "../utils/supabase/client";

interface Question {
  id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_years: string;
  transponder_type: string;
}

interface Props {
  onBack: () => void;
}

export function TransponderMasterGame({ onBack }: Props) {
  const [gameState, setGameState] = useState<"playing" | "gameover">("playing");
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [score, setScore] = useState(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);

  const TOTAL_QUESTIONS = 10;

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setIsCorrect(null);

      const supabase = createClient();

      // Get total count to calculate random offset
      const { count } = await supabase
        .from("transponder_fitments")
        .select("*", { count: "exact", head: true });

      if (!count || count === 0) {
        console.error("No questions available");
        return;
      }

      // Calculate random offset, avoiding previously used questions
      const maxOffset = Math.max(0, count - usedQuestionIds.length - 1);
      const randomOffset = Math.floor(Math.random() * maxOffset);

      // Get a random question that hasn't been used yet
      let query = supabase
        .from("transponder_fitments")
        .select("*")
        .order("id", { ascending: true })
        .range(randomOffset, randomOffset + 49);

      // Only filter out used questions if we have any
      if (usedQuestionIds.length > 0) {
        query = query.not("id", "in", `(${usedQuestionIds.join(",")})`);
      }

      const { data: questions, error } = await query;

      if (error || !questions || questions.length === 0) {
        console.error("Error fetching question:", error);
        return;
      }

      // Pick random question from the fetched batch
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      setQuestion(randomQuestion);
      setUsedQuestionIds([...usedQuestionIds, randomQuestion.id]);

      // Get wrong answers - fetch more and randomize better
      const { data: wrongAnswers } = await supabase
        .from("transponder_fitments")
        .select("transponder_type")
        .neq("transponder_type", randomQuestion.transponder_type)
        .order("id", { ascending: Math.random() > 0.5 })
        .limit(200);

      // Create options (1 correct + 3 wrong)
      const wrongOptions = wrongAnswers
        ? [...new Set(wrongAnswers.map((a) => a.transponder_type))]
            .filter((t) => t !== randomQuestion.transponder_type)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
        : [];

      const allOptions = [randomQuestion.transponder_type, ...wrongOptions].sort(
        () => Math.random() - 0.5
      );

      setOptions(allOptions);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer) return; // Already answered

    setSelectedAnswer(answer);
    const correct = answer === question?.transponder_type;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentQuestionNum >= TOTAL_QUESTIONS) {
        setGameState("gameover");
      } else {
        setCurrentQuestionNum(currentQuestionNum + 1);
        fetchQuestion();
      }
    }, 2000);
  };

  const handleRestart = () => {
    setGameState("playing");
    setCurrentQuestionNum(1);
    setScore(0);
    setUsedQuestionIds([]);
    setSelectedAnswer(null);
    setIsCorrect(null);
    fetchQuestion();
  };

  // Game Over Screen
  if (gameState === "gameover") {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-black pb-20 md:pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-gray-800 dark:via-gray-900 dark:to-black shadow-lg sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-white font-bold text-xl">Game Over!</h1>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <Trophy className="w-20 h-20 mx-auto text-yellow-500" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Final Score
            </h2>

            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {score}/{TOTAL_QUESTIONS}
            </div>

            <div className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
              {percentage}% Correct
            </div>

            {/* Performance Message */}
            <div className="mb-8">
              {percentage === 100 && (
                <p className="text-xl text-green-600 dark:text-green-400 font-semibold">
                  🎉 Perfect Score! You're a Transponder Master!
                </p>
              )}
              {percentage >= 80 && percentage < 100 && (
                <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold">
                  🌟 Excellent Work! You really know your transponders!
                </p>
              )}
              {percentage >= 60 && percentage < 80 && (
                <p className="text-xl text-purple-600 dark:text-purple-400 font-semibold">
                  👍 Good Job! Keep practicing to improve!
                </p>
              )}
              {percentage >= 40 && percentage < 60 && (
                <p className="text-xl text-yellow-600 dark:text-yellow-400 font-semibold">
                  📚 Not bad! Study up and try again!
                </p>
              )}
              {percentage < 40 && (
                <p className="text-xl text-orange-600 dark:text-orange-400 font-semibold">
                  💪 Keep learning! Practice makes perfect!
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleRestart}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={onBack}
                size="lg"
                variant="outline"
              >
                Back to Hub
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-black pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-gray-800 dark:via-gray-900 dark:to-black shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-white font-bold text-xl">Transponder Master</h1>
            </div>
            <div className="text-white font-semibold">
              Score: {score}/{currentQuestionNum - 1}
            </div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Question {currentQuestionNum} of {TOTAL_QUESTIONS}
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {Math.round((currentQuestionNum / TOTAL_QUESTIONS) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestionNum / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Which transponder fits this vehicle?
            </h2>

            {/* Vehicle Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-8 text-center">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                {question?.vehicle_make}
              </div>
              <div className="text-xl text-gray-700 dark:text-gray-200 mb-1">
                {question?.vehicle_model}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-300">
                {question?.vehicle_years}
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = option === question?.transponder_type;
                const showResult = selectedAnswer !== null;

                let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ";
                
                if (!showResult) {
                  buttonClass += "border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer";
                } else if (isCorrectAnswer) {
                  buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/30";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/30";
                } else {
                  buttonClass += "border-gray-300 dark:border-gray-600 opacity-50";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(option)}
                    disabled={selectedAnswer !== null}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {option}
                      </span>
                      {showResult && isCorrectAnswer && (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {selectedAnswer && (
              <div className="mt-6 text-center">
                {isCorrect ? (
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    ✓ Correct! Great job!
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    ✗ Wrong! The correct answer is {question?.transponder_type}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}