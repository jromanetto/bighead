import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

// Mock question
const mockQuestion = {
  question: "Quel pays a le plus grand nombre de fuseaux horaires?",
  answers: ["Russie", "États-Unis", "France", "Chine"],
  correctIndex: 2,
};

export default function PartyGameScreen() {
  const { players: playersParam } = useLocalSearchParams<{ players: string }>();
  const players = playersParam ? JSON.parse(playersParam) : ["Joueur 1", "Joueur 2"];

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(players.map((p: string) => [p, 0]))
  );
  const [questionNumber, setQuestionNumber] = useState(1);
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  const handleReady = () => {
    setWaitingForPlayer(false);
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;

    setSelectedAnswer(index);
    setShowResult(true);

    if (index === mockQuestion.correctIndex) {
      setScores({
        ...scores,
        [currentPlayer]: scores[currentPlayer] + 100,
      });
    }
  };

  const nextTurn = () => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const isNewRound = nextPlayerIndex === 0;

    if (isNewRound && questionNumber >= 10) {
      // Game over
      router.replace({
        pathname: "/party/result",
        params: { scores: JSON.stringify(scores), players: playersParam },
      });
      return;
    }

    setCurrentPlayerIndex(nextPlayerIndex);
    if (isNewRound) {
      setQuestionNumber(questionNumber + 1);
    }
    setWaitingForPlayer(true);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  // Waiting screen
  if (waitingForPlayer) {
    return (
      <SafeAreaView className="flex-1 bg-accent-500">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white/60 text-lg mb-4">
            Question {questionNumber}/10
          </Text>
          <Text className="text-white text-2xl mb-2">Passe le téléphone à</Text>
          <Text className="text-white text-4xl font-bold mb-8">{currentPlayer}</Text>

          <Pressable
            onPress={handleReady}
            className="bg-white rounded-2xl py-4 px-12 active:opacity-80"
          >
            <Text className="text-accent-500 text-xl font-bold">Je suis prêt!</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Question screen
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-accent-400 text-xl font-bold">{currentPlayer}</Text>
          <Text className="text-white">{scores[currentPlayer]} pts</Text>
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
              } else if (index === selectedAnswer) {
                bgColor = "bg-error-500";
              }
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

        {/* Next button */}
        {showResult && (
          <Pressable
            onPress={nextTurn}
            className="bg-accent-500 rounded-xl py-4 px-6 mt-6 active:opacity-80"
          >
            <Text className="text-white text-lg text-center font-bold">
              Joueur suivant
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
