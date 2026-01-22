import { View, Text, Pressable, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

function GameModeCard({
  title,
  description,
  icon,
  color,
  onPress,
}: GameModeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`${color} rounded-2xl p-5 active:opacity-90`}
    >
      <View className="flex-row items-center mb-2">
        <Text className="text-3xl mr-3">{icon}</Text>
        <Text className="text-white text-xl font-bold">{title}</Text>
      </View>
      <Text className="text-white/80 text-sm leading-5">{description}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center pt-8 pb-6">
          <Text className="text-5xl font-bold text-white tracking-tight">
            BIGHEAD
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Le quiz qui te rend plus intelligent
          </Text>
        </View>

        {/* Quick Play */}
        <Pressable
          onPress={() => router.push("/game/chain")}
          className="bg-primary-500 rounded-2xl py-5 px-6 mb-6 active:opacity-90"
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-4xl mr-3">⚡</Text>
            <View>
              <Text className="text-white text-2xl font-bold">Jouer</Text>
              <Text className="text-white/70 text-sm">Partie rapide</Text>
            </View>
          </View>
        </Pressable>

        {/* Game Modes */}
        <Text className="text-white text-lg font-bold mb-3">Modes de jeu</Text>
        <View className="gap-3 mb-6">
          <GameModeCard
            title="Chain Reaction"
            description="Enchaîne les bonnes réponses pour multiplier tes points. Un seul faux pas et tu repars à zéro!"
            icon="🔗"
            color="bg-blue-600"
            onPress={() => router.push("/game/chain")}
          />

          <GameModeCard
            title="Mode Party"
            description="Jusqu'à 8 joueurs sur un seul téléphone. Parfait pour les soirées entre amis!"
            icon="🎉"
            color="bg-accent-600"
            onPress={() => router.push("/party/setup")}
          />
        </View>

        {/* Stats Preview */}
        <Text className="text-white text-lg font-bold mb-3">Mes stats</Text>
        <View className="bg-gray-800 rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-white text-2xl font-bold">-</Text>
              <Text className="text-gray-400 text-xs mt-1">Parties</Text>
            </View>
            <View className="w-px bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-white text-2xl font-bold">-</Text>
              <Text className="text-gray-400 text-xs mt-1">Max Chain</Text>
            </View>
            <View className="w-px bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-yellow-400 text-2xl font-bold">-</Text>
              <Text className="text-gray-400 text-xs mt-1">XP Total</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/profile")}
            className="bg-gray-700 rounded-xl py-2 mt-4 active:opacity-80"
          >
            <Text className="text-white text-center text-sm">
              Voir mon profil
            </Text>
          </Pressable>
        </View>

        {/* Coming Soon */}
        <Text className="text-white text-lg font-bold mb-3">Bientôt</Text>
        <View className="gap-3">
          <View className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 border-dashed">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3 opacity-50">⚔️</Text>
              <View className="flex-1">
                <Text className="text-gray-400 font-medium">Duel 1v1</Text>
                <Text className="text-gray-500 text-sm">
                  Affronte tes amis en temps réel
                </Text>
              </View>
              <View className="bg-gray-700 rounded-full px-2 py-1">
                <Text className="text-gray-400 text-xs">Soon</Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 border-dashed">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3 opacity-50">🏆</Text>
              <View className="flex-1">
                <Text className="text-gray-400 font-medium">Tournois</Text>
                <Text className="text-gray-500 text-sm">
                  Compétitions hebdomadaires
                </Text>
              </View>
              <View className="bg-gray-700 rounded-full px-2 py-1">
                <Text className="text-gray-400 text-xs">Soon</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-around py-4 border-t border-gray-800 bg-gray-900">
        <Pressable className="items-center" onPress={() => {}}>
          <Text className="text-2xl mb-1">🏠</Text>
          <Text className="text-primary-400 text-xs font-medium">Accueil</Text>
        </Pressable>
        <Link href="/leaderboard" asChild>
          <Pressable className="items-center">
            <Text className="text-2xl mb-1">📊</Text>
            <Text className="text-gray-400 text-xs">Classement</Text>
          </Pressable>
        </Link>
        <Link href="/profile" asChild>
          <Pressable className="items-center">
            <Text className="text-2xl mb-1">👤</Text>
            <Text className="text-gray-400 text-xs">Profil</Text>
          </Pressable>
        </Link>
        <Link href="/settings" asChild>
          <Pressable className="items-center">
            <Text className="text-2xl mb-1">⚙️</Text>
            <Text className="text-gray-400 text-xs">Options</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
