import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// ==================== INTERFACES ====================

interface Question {
  id: string;
  make: string;
  model: string;
  year: string;
}

interface Option {
  text: string;
  correct: boolean;
}

// ==================== GAME COMPONENT ====================

interface TransponderMasterGameProps {
  onBack: () => void;
}

export function TransponderMasterGame({ onBack }: TransponderMasterGameProps) {
  // ===== STATE =====
  const [gameState, setGameState] = useState<"playing" | "gameover">("playing");
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // ===== FETCH QUESTION =====
  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setExplanation("");

      const excludeParam = answeredQuestions.length > 0 ? `&exclude=${answeredQuestions.join(',')}` : '';
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/game/question?difficulty=1&mode=classic${excludeParam}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch question");
      }

      const data = await response.json();
      setQuestion(data.question);
      setOptions(data.options);
    } catch (error) {
      // Error fetching question
    } finally {
      setLoading(false);
    }
  };

  // ===== SUBMIT ANSWER =====
  const submitAnswer = async (answer: string) => {
    if (!question || selectedAnswer) return;

    setSelectedAnswer(answer);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/game/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            questionId: question.id,
            userAnswer: answer,
            responseTime: 0,
            mode: "practice",
          }),
        }
      );

      const result = await response.json();
      setIsCorrect(result.correct);
      setExplanation(result.explanation);
      
      // Update stats
      setQuestionsAnswered(prev => prev + 1);
      if (result.correct) {
        setCorrectAnswers(prev => prev + 1);
      }
      
      // Add to answered questions
      setAnsweredQuestions(prev => [...prev, question.id]);

      // Auto-advance after 2 seconds
      setTimeout(() => {
        fetchQuestion();
      }, 2000);
    } catch (error) {
      // Error submitting answer
    }
  };

  // ===== EFFECTS =====
  useEffect(() => {
    fetchQuestion();
  }, []);

  // ===== RESTART GAME =====
  const restartGame = () => {
    setGameState("playing");
    setAnsweredQuestions([]);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    fetchQuestion();
  };

  // ===== GAME OVER SCREEN =====
  if (gameState === "gameover") {
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hub
            </Button>
          </div>

          {/* Game Over Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-3">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-200 to-orange-300 bg-clip-text text-transparent">
                Practice Complete!
              </h2>
              <p className="text-lg text-gray-300">Great job learning transponder fitments!</p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-4 border border-blue-400/30">
                <div className="text-xs text-blue-300 mb-1 font-medium">Questions Answered</div>
                <div className="text-3xl font-bold text-blue-100">{questionsAnswered}</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-4 border border-green-400/30">
                <div className="text-xs text-green-300 mb-1 font-medium">Correct Answers</div>
                <div className="text-3xl font-bold text-green-100">{correctAnswers}</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-4 border border-purple-400/30">
                <div className="text-xs text-purple-300 mb-1 font-medium">Accuracy</div>
                <div className="text-3xl font-bold text-purple-100">{accuracy}%</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={restartGame}
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                Practice Again
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 h-12 text-base font-semibold border-2 border-white/30 hover:bg-white/10"
              >
                Back to Hub
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING SCREEN =====
  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/10 h-9"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hub
          </Button>
          
          <Button
            onClick={() => setGameState("gameover")}
            className="bg-red-600/80 hover:bg-red-700 text-white border-0 h-9"
          >
            End Practice
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-lg">
            <div className="text-xs text-gray-300 mb-0.5 font-medium">Questions</div>
            <div className="text-2xl font-bold">{questionsAnswered}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl rounded-xl p-3 border border-green-400/30 shadow-lg">
            <div className="text-xs text-green-300 mb-0.5 font-medium">Correct</div>
            <div className="text-2xl font-bold text-green-100">{correctAnswers}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl rounded-xl p-3 border border-purple-400/30 shadow-lg">
            <div className="text-xs text-purple-300 mb-0.5 font-medium">Accuracy</div>
            <div className="text-2xl font-bold text-purple-100">{accuracy}%</div>
          </div>
        </div>

        {/* Question Card */}
        {loading ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="text-xl animate-pulse">Loading question...</div>
          </div>
        ) : question ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl">
            {/* Question Header */}
            <div className="mb-4">
              <h3 className="text-base text-gray-300 mb-3 font-medium">
                What transponder does this vehicle use?
              </h3>
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-400/30">
                <div className="text-2xl font-bold text-white mb-1">
                  {question.make} {question.model}
                </div>
                <div className="text-lg text-blue-200">{question.year}</div>
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-2.5 mb-4">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === option.text;
                const showResult = selectedAnswer !== null;
                
                let classes = "bg-white/5 hover:bg-white/10 border-white/20";
                let icon = null;
                
                if (showResult && isSelected && isCorrect) {
                  classes = "bg-gradient-to-r from-green-500/30 to-green-600/20 border-green-400/50";
                  icon = <CheckCircle2 className="w-5 h-5 text-green-400" />;
                } else if (showResult && isSelected && !isCorrect) {
                  classes = "bg-gradient-to-r from-red-500/30 to-red-600/20 border-red-400/50";
                  icon = <XCircle className="w-5 h-5 text-red-400" />;
                } else if (showResult && option.correct) {
                  classes = "bg-gradient-to-r from-green-500/30 to-green-600/20 border-green-400/50";
                  icon = <CheckCircle2 className="w-5 h-5 text-green-400" />;
                }

                return (
                  <button
                    key={index}
                    onClick={() => submitAnswer(option.text)}
                    disabled={selectedAnswer !== null}
                    className={`${classes} border-2 rounded-xl p-3.5 text-left transition-all disabled:cursor-not-allowed text-base font-semibold hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between`}
                  >
                    <span>{option.text}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {explanation && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-3.5 border border-blue-400/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="text-xs text-blue-300 mb-1 font-semibold uppercase tracking-wide">Explanation</div>
                <div className="text-sm text-white">{explanation}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="text-xl mb-4">No more questions available</div>
            <Button
              onClick={() => setGameState("gameover")}
              className="h-11 px-6 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              View Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}