import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

// Temporary mock question
const mockQuestion = {
  question: "Quelle est la capitale de l'Australie?",
  answers: ["Sydney", "Melbourne", "Canberra", "Perth"],
  correctIndex: 2,
};

export default function ChainGameScreen() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [chain, setChain] = useState(1);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showResult]);

  const handleAnswer = (index: number) => {
    if (showResult) return;

    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === mockQuestion.correctIndex;

    if (isCorrect) {
      const points = 100 * chain;
      setScore(score + points);
      // Increase chain: 1 -> 2 -> 3 -> 5 -> 8 -> 10
      const chainProgression = [1, 2, 3, 5, 8, 10];
      const currentIndex = chainProgression.indexOf(chain);
      if (currentIndex < chainProgression.length - 1) {
        setChain(chainProgression[currentIndex + 1]);
      }
    } else {
      setChain(1); // Reset chain
    }
  };

  const nextQuestion = () => {
    if (questionNumber >= 10) {
      // Game over - navigate to results
      router.push({
        pathname: "/game/result",
        params: { score: score.toString(), correct: "7", total: "10" },
      });
      return;
    }

    setSelectedAnswer(null);
    setShowResult(false);
    setQuestionNumber(questionNumber + 1);
    setTimeLeft(15);
  };

  const getChainColor = () => {
    const colors: Record<number, string> = {
      1: "bg-gray-500",
      2: "bg-success-500",
      3: "bg-blue-500",
      5: "bg-purple-500",
      8: "bg-orange-500",
      10: "bg-error-500",
    };
    return colors[chain] || "bg-gray-500";
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Pressable onPress={() => router.back()}>
            <Text className="text-white text-xl">✕</Text>
          </Pressable>
          <Text className="text-white text-lg">
            Question {questionNumber}/10
          </Text>
          <View className={`${getChainColor()} rounded-full px-4 py-2`}>
            <Text className="text-white font-bold">{chain}x</Text>
          </View>
        </View>

        {/* Score & Timer */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-white text-2xl font-bold">{score} pts</Text>
          <View className={`rounded-full w-14 h-14 items-center justify-center ${timeLeft <= 5 ? 'bg-error-500' : 'bg-gray-700'}`}>
            <Text className="text-white text-xl font-bold">{timeLeft}</Text>
          </View>
        </View>

        {/* Question */}
        <View className="bg-gray-800 rounded-2xl p-6 mb-6">
          <Text className="text-white text-xl text-center">
            {mockQuestion.question}
          </Text>
        </View>

        {/* Answers */}
        <View className="gap-3">
          {mockQuestion.answers.map((answer, index) => {
            let bgColor = "bg-gray-700";
            if (showResult) {
              if (index === mockQuestion.correctIndex) {
                bgColor = "bg-success-500";
              } else if (index === selectedAnswer && index !== mockQuestion.correctIndex) {
                bgColor = "bg-error-500";
              }
            } else if (selectedAnswer === index) {
              bgColor = "bg-primary-500";
            }

            return (
              <Pressable
                key={index}
                onPress={() => handleAnswer(index)}
                className={`${bgColor} rounded-xl py-4 px-6 active:opacity-80`}
                disabled={showResult}
              >
                <Text className="text-white text-lg text-center">{answer}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Next button (shown after answer) */}
        {showResult && (
          <Pressable
            onPress={nextQuestion}
            className="bg-primary-500 rounded-xl py-4 px-6 mt-6 active:opacity-80"
          >
            <Text className="text-white text-lg text-center font-bold">
              {questionNumber >= 10 ? "Voir les résultats" : "Question suivante"}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
