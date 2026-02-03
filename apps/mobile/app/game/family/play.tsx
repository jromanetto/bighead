import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getFamilyQuestions } from "../../../src/services/adventure";
import { buttonPressFeedback, playHaptic } from "../../../src/utils/feedback";
import { playSound } from "../../../src/services/sounds";
import { useAuth } from "../../../src/contexts/AuthContext";
import { recordPlay } from "../../../src/services/dailyLimits";
import {
  Category,
  AgeGroup,
  QuestionCount,
  getCategoryInfo,
} from "../../../src/types/adventure";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceLight: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.2)",
  error: "#ef4444",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

// Mock questions for Family mode fallback
const MOCK_FAMILY_QUESTIONS: Question[] = [
  // Culture Générale
  { id: "f1", question_text: "Quelle est la capitale de la France ?", correct_answer: "Paris", category: "culture_generale" },
  { id: "f2", question_text: "Combien de jours y a-t-il dans une semaine ?", correct_answer: "7 jours", category: "culture_generale" },
  { id: "f3", question_text: "Quelle est la couleur du ciel par beau temps ?", correct_answer: "Bleu", category: "culture_generale" },
  { id: "f4", question_text: "Comment s'appelle le petit de la vache ?", correct_answer: "Le veau", category: "culture_generale" },
  { id: "f5", question_text: "Combien de pattes a un chat ?", correct_answer: "4 pattes", category: "culture_generale" },
  { id: "f6", question_text: "Quel animal est le roi de la jungle ?", correct_answer: "Le lion", category: "culture_generale" },
  { id: "f7", question_text: "Combien de mois y a-t-il dans une année ?", correct_answer: "12 mois", category: "culture_generale" },
  { id: "f8", question_text: "Quelle est la forme de la Terre ?", correct_answer: "Une sphère (ronde)", category: "culture_generale" },
  { id: "f9", question_text: "Quel est le plus grand océan du monde ?", correct_answer: "L'océan Pacifique", category: "culture_generale" },
  { id: "f10", question_text: "Combien y a-t-il de continents ?", correct_answer: "7 continents", category: "culture_generale" },

  // Histoire
  { id: "f11", question_text: "Qui a construit la Tour Eiffel ?", correct_answer: "Gustave Eiffel", category: "histoire" },
  { id: "f12", question_text: "Quel pharaon était enterré dans une pyramide dorée ?", correct_answer: "Toutankhamon", category: "histoire" },
  { id: "f13", question_text: "En quelle année l'homme a-t-il marché sur la Lune ?", correct_answer: "1969", category: "histoire" },
  { id: "f14", question_text: "Qui était Napoléon Bonaparte ?", correct_answer: "Un empereur français", category: "histoire" },
  { id: "f15", question_text: "Quelle civilisation a construit les pyramides d'Égypte ?", correct_answer: "Les Égyptiens", category: "histoire" },
  { id: "f16", question_text: "Quel peuple vivait en Amérique avant Christophe Colomb ?", correct_answer: "Les Amérindiens/Indiens", category: "histoire" },
  { id: "f17", question_text: "Qui a peint la Joconde ?", correct_answer: "Léonard de Vinci", category: "histoire" },
  { id: "f18", question_text: "Comment s'appelaient les guerriers du Japon ancien ?", correct_answer: "Les Samouraïs", category: "histoire" },
  { id: "f19", question_text: "Quel animal Cléopâtre avait-elle comme symbole ?", correct_answer: "Le serpent (cobra)", category: "histoire" },
  { id: "f20", question_text: "En quelle année la Révolution française a-t-elle commencé ?", correct_answer: "1789", category: "histoire" },

  // Géographie
  { id: "f21", question_text: "Quelle est la capitale de l'Italie ?", correct_answer: "Rome", category: "geographie" },
  { id: "f22", question_text: "Quel est le plus long fleuve de France ?", correct_answer: "La Loire", category: "geographie" },
  { id: "f23", question_text: "Dans quel pays se trouve la Grande Muraille ?", correct_answer: "La Chine", category: "geographie" },
  { id: "f24", question_text: "Quelle est la capitale de l'Espagne ?", correct_answer: "Madrid", category: "geographie" },
  { id: "f25", question_text: "Quel est le plus grand pays du monde ?", correct_answer: "La Russie", category: "geographie" },
  { id: "f26", question_text: "Sur quel continent se trouve l'Australie ?", correct_answer: "L'Océanie", category: "geographie" },
  { id: "f27", question_text: "Quel fleuve traverse Paris ?", correct_answer: "La Seine", category: "geographie" },
  { id: "f28", question_text: "Quelle est la plus haute montagne du monde ?", correct_answer: "L'Everest", category: "geographie" },
  { id: "f29", question_text: "Dans quel pays se trouvent les kangourous ?", correct_answer: "L'Australie", category: "geographie" },
  { id: "f30", question_text: "Quelle est la capitale du Japon ?", correct_answer: "Tokyo", category: "geographie" },

  // Sciences
  { id: "f31", question_text: "Quelle planète est surnommée la planète rouge ?", correct_answer: "Mars", category: "sciences" },
  { id: "f32", question_text: "Combien de planètes y a-t-il dans notre système solaire ?", correct_answer: "8 planètes", category: "sciences" },
  { id: "f33", question_text: "Quel est le gaz que nous respirons ?", correct_answer: "L'oxygène", category: "sciences" },
  { id: "f34", question_text: "Quelle est la plus grande planète du système solaire ?", correct_answer: "Jupiter", category: "sciences" },
  { id: "f35", question_text: "Comment s'appelle notre galaxie ?", correct_answer: "La Voie Lactée", category: "sciences" },
  { id: "f36", question_text: "Quel est l'organe qui pompe le sang dans notre corps ?", correct_answer: "Le cœur", category: "sciences" },
  { id: "f37", question_text: "Combien d'os y a-t-il dans le corps humain adulte ?", correct_answer: "206 os", category: "sciences" },
  { id: "f38", question_text: "Quel animal pond des œufs mais allaite ses petits ?", correct_answer: "L'ornithorynque", category: "sciences" },
  { id: "f39", question_text: "Quelle est la formule chimique de l'eau ?", correct_answer: "H2O", category: "sciences" },
  { id: "f40", question_text: "Quel est le plus gros animal du monde ?", correct_answer: "La baleine bleue", category: "sciences" },

  // Sport
  { id: "f41", question_text: "Combien de joueurs y a-t-il dans une équipe de football ?", correct_answer: "11 joueurs", category: "sport" },
  { id: "f42", question_text: "Quel sport se joue à Wimbledon ?", correct_answer: "Le tennis", category: "sport" },
  { id: "f43", question_text: "Dans quel sport utilise-t-on un ballon orange ?", correct_answer: "Le basketball", category: "sport" },
  { id: "f44", question_text: "Combien de tours de piste fait-on dans un 400 mètres ?", correct_answer: "1 tour", category: "sport" },
  { id: "f45", question_text: "Quel sport pratique Kylian Mbappé ?", correct_answer: "Le football", category: "sport" },
  { id: "f46", question_text: "Combien de sets faut-il gagner pour remporter un match de tennis chez les hommes ?", correct_answer: "3 sets (ou 2 en tournoi)", category: "sport" },
  { id: "f47", question_text: "Quel pays a inventé le judo ?", correct_answer: "Le Japon", category: "sport" },
  { id: "f48", question_text: "Comment s'appelle la course cycliste la plus célèbre de France ?", correct_answer: "Le Tour de France", category: "sport" },
  { id: "f49", question_text: "Quel sport se pratique sur un tatami ?", correct_answer: "Le judo/karaté", category: "sport" },
  { id: "f50", question_text: "Quel est le record du monde du 100 mètres hommes (environ) ?", correct_answer: "9,58 secondes", category: "sport" },

  // Pop Culture
  { id: "f51", question_text: "Comment s'appelle le bonhomme de neige dans La Reine des Neiges ?", correct_answer: "Olaf", category: "pop_culture" },
  { id: "f52", question_text: "Quel superhéros est aussi appelé l'Homme-araignée ?", correct_answer: "Spider-Man", category: "pop_culture" },
  { id: "f53", question_text: "Comment s'appelle le poisson clown dans le film de Pixar ?", correct_answer: "Nemo", category: "pop_culture" },
  { id: "f54", question_text: "Qui est le meilleur ami de Mickey ?", correct_answer: "Dingo (ou Pluto)", category: "pop_culture" },
  { id: "f55", question_text: "Quel est le nom du lion dans Le Roi Lion ?", correct_answer: "Simba", category: "pop_culture" },
  { id: "f56", question_text: "Comment s'appelle l'école de Harry Potter ?", correct_answer: "Poudlard", category: "pop_culture" },
  { id: "f57", question_text: "Qui est l'ennemi de Batman ?", correct_answer: "Le Joker", category: "pop_culture" },
  { id: "f58", question_text: "Comment s'appelle la princesse dans Raiponce ?", correct_answer: "Raiponce", category: "pop_culture" },
  { id: "f59", question_text: "Quel est le nom du cowboy dans Toy Story ?", correct_answer: "Woody", category: "pop_culture" },
  { id: "f60", question_text: "Comment s'appelle l'ogre vert de DreamWorks ?", correct_answer: "Shrek", category: "pop_culture" },

  // Jeux Vidéo
  { id: "f61", question_text: "Quel est le personnage principal de Mario ?", correct_answer: "Mario (le plombier)", category: "jeux_video" },
  { id: "f62", question_text: "Dans quel jeu construit-on avec des blocs ?", correct_answer: "Minecraft", category: "jeux_video" },
  { id: "f63", question_text: "Comment s'appelle le hérisson bleu de SEGA ?", correct_answer: "Sonic", category: "jeux_video" },
  { id: "f64", question_text: "Quel est le jeu vidéo de danse le plus populaire ?", correct_answer: "Just Dance", category: "jeux_video" },
  { id: "f65", question_text: "Quel est le frère de Mario ?", correct_answer: "Luigi", category: "jeux_video" },
  { id: "f66", question_text: "Dans quel jeu capture-t-on des créatures avec des Poké Balls ?", correct_answer: "Pokémon", category: "jeux_video" },
  { id: "f67", question_text: "Comment s'appelle la princesse que Mario doit sauver ?", correct_answer: "Peach", category: "jeux_video" },
  { id: "f68", question_text: "Quel jeu de battle royale est très populaire chez les jeunes ?", correct_answer: "Fortnite", category: "jeux_video" },
  { id: "f69", question_text: "Quel est le Pokémon jaune le plus célèbre ?", correct_answer: "Pikachu", category: "jeux_video" },
  { id: "f70", question_text: "Dans quel jeu conduit-on des karts avec Mario et ses amis ?", correct_answer: "Mario Kart", category: "jeux_video" },

  // Cinéma
  { id: "f71", question_text: "Qui joue Iron Man dans les films Marvel ?", correct_answer: "Robert Downey Jr.", category: "cinema" },
  { id: "f72", question_text: "Dans quel film un garçon reste-t-il seul à la maison à Noël ?", correct_answer: "Maman j'ai raté l'avion", category: "cinema" },
  { id: "f73", question_text: "Quel studio a créé les films Toy Story ?", correct_answer: "Pixar", category: "cinema" },
  { id: "f74", question_text: "Comment s'appelle le robot ami de Wall-E ?", correct_answer: "EVE", category: "cinema" },
  { id: "f75", question_text: "Qui est le père de Luke Skywalker ?", correct_answer: "Dark Vador", category: "cinema" },
  { id: "f76", question_text: "Quel film raconte l'histoire d'un poisson perdu ?", correct_answer: "Le Monde de Nemo", category: "cinema" },
  { id: "f77", question_text: "Qui sont les deux héros de Vice Versa ?", correct_answer: "Les émotions (Joie, Tristesse...)", category: "cinema" },
  { id: "f78", question_text: "Dans quel film y a-t-il des Minions ?", correct_answer: "Moi, Moche et Méchant", category: "cinema" },
  { id: "f79", question_text: "Qui est le méchant dans Le Roi Lion ?", correct_answer: "Scar", category: "cinema" },
  { id: "f80", question_text: "Comment s'appelle le robot de Big Hero 6 ?", correct_answer: "Baymax", category: "cinema" },

  // Musique
  { id: "f81", question_text: "Combien y a-t-il de notes de musique ?", correct_answer: "7 notes", category: "musique" },
  { id: "f82", question_text: "Quel instrument a des touches noires et blanches ?", correct_answer: "Le piano", category: "musique" },
  { id: "f83", question_text: "Qui a chanté 'Thriller' ?", correct_answer: "Michael Jackson", category: "musique" },
  { id: "f84", question_text: "Quel instrument utilise un archet ?", correct_answer: "Le violon", category: "musique" },
  { id: "f85", question_text: "Combien de cordes a une guitare classique ?", correct_answer: "6 cordes", category: "musique" },
  { id: "f86", question_text: "Quel groupe a chanté 'Yellow Submarine' ?", correct_answer: "Les Beatles", category: "musique" },
  { id: "f87", question_text: "Comment s'appelle la clé qui sert à lire la musique ?", correct_answer: "La clé de sol", category: "musique" },
  { id: "f88", question_text: "Quel instrument souffle-t-on pour jouer ?", correct_answer: "La flûte (ou trompette)", category: "musique" },
  { id: "f89", question_text: "Qui a composé 'La Marche turque' ?", correct_answer: "Mozart", category: "musique" },
  { id: "f90", question_text: "Quel chanteur français est surnommé 'Mister Starmania' ?", correct_answer: "Michel Berger", category: "musique" },

  // Technologie
  { id: "f91", question_text: "Qui a fondé Apple ?", correct_answer: "Steve Jobs", category: "technologie" },
  { id: "f92", question_text: "Quel est le moteur de recherche le plus utilisé ?", correct_answer: "Google", category: "technologie" },
  { id: "f93", question_text: "Qu'est-ce qu'un emoji ?", correct_answer: "Une petite image/émoticône", category: "technologie" },
  { id: "f94", question_text: "Comment s'appelle le réseau social où l'on partage des photos carrées ?", correct_answer: "Instagram", category: "technologie" },
  { id: "f95", question_text: "Quel est le système d'exploitation des iPhones ?", correct_answer: "iOS", category: "technologie" },
  { id: "f96", question_text: "Qu'est-ce que YouTube ?", correct_answer: "Un site de vidéos", category: "technologie" },
  { id: "f97", question_text: "Comment appelle-t-on un ordinateur portable très fin ?", correct_answer: "Un ultrabook/laptop", category: "technologie" },
  { id: "f98", question_text: "Quel appareil utilise-t-on pour écouter de la musique en marchant ?", correct_answer: "Des écouteurs/un smartphone", category: "technologie" },
  { id: "f99", question_text: "Comment s'appelle l'assistant vocal d'Apple ?", correct_answer: "Siri", category: "technologie" },
  { id: "f100", question_text: "Qu'est-ce qu'une tablette tactile ?", correct_answer: "Un écran portable tactile", category: "technologie" },
];

// Helper function to get mock questions for Family mode
function getMockFamilyQuestions(category: Category | "mix", limit: number): Question[] {
  let questions = [...MOCK_FAMILY_QUESTIONS];

  // Filter by category if not mix
  if (category !== "mix") {
    questions = questions.filter(q => q.category === category);
  }

  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  // Return requested number
  return questions.slice(0, Math.min(limit, questions.length));
}

interface Question {
  id: string;
  question_text: string;
  correct_answer: string;
  category: string;
}

export default function FamilyPlayScreen() {
  const { minAge, questionCount, category } = useLocalSearchParams<{
    minAge: string;
    questionCount: string;
    category: string;
  }>();
  const { isPremium } = useAuth();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentQuestion = questions[currentIndex];
  const categoryInfo = category !== "mix" ? getCategoryInfo(category as Category) : null;
  const isUnlimited = questionCount === "unlimited";
  const totalQuestions = isUnlimited ? questions.length : parseInt(questionCount);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const limit = isUnlimited ? 100 : parseInt(questionCount);
        const fetchedQuestions = await getFamilyQuestions(
          category as Category | "mix",
          parseInt(minAge),
          limit
        );
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error loading questions:", error);
        // Mock questions fallback - use appropriate questions based on category
        const mockQuestions = getMockFamilyQuestions(category as Category | "mix", parseInt(questionCount) || 20);
        setQuestions(mockQuestions);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [minAge, questionCount, category]);

  const handleReveal = () => {
    buttonPressFeedback();
    playSound("buttonPress");
    setIsAnswerRevealed(true);
  };

  const handleCorrect = () => {
    buttonPressFeedback();
    playSound("correct");
    playHaptic("success");
    setScore((prev) => prev + 1);
    goToNext();
  };

  const handleIncorrect = () => {
    buttonPressFeedback();
    playSound("wrong");
    goToNext();
  };

  const goToNext = async () => {
    setIsAnswerRevealed(false);

    if (currentIndex + 1 >= questions.length) {
      setGameOver(true);
      playSound("levelUp");
      // Record the play using daily limits service
      if (!isPremium) {
        try {
          await recordPlay("family");
        } catch (e) {
          console.error("Error recording play:", e);
        }
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleExit = () => {
    buttonPressFeedback();
    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.bg }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted }} className="mt-4">
          Préparation des questions...
        </Text>
      </SafeAreaView>
    );
  }

  // Game Over Screen
  if (gameOver) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: COLORS.bg }}
      >
        <Text className="text-6xl mb-4">🎉</Text>
        <Text className="text-white text-3xl font-black text-center mb-2">
          BRAVO !
        </Text>
        <Text style={{ color: COLORS.textMuted }} className="text-center mb-8 text-lg">
          Partie terminée
        </Text>

        {/* Final Score */}
        <View
          className="w-full p-6 rounded-2xl mb-8 items-center"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text style={{ color: COLORS.textMuted }} className="text-sm mb-2">
            SCORE DU GROUPE
          </Text>
          <Text
            className="text-5xl font-black"
            style={{ color: COLORS.success }}
          >
            {score}
          </Text>
          <Text style={{ color: COLORS.textMuted }} className="text-lg">
            bonnes réponses sur {questions.length}
          </Text>

          {/* Percentage */}
          <View className="mt-4 flex-row items-center">
            <View
              className="h-3 rounded-full flex-1 mr-3"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${(score / questions.length) * 100}%`,
                  backgroundColor: COLORS.success,
                }}
              />
            </View>
            <Text style={{ color: COLORS.success }} className="font-bold">
              {Math.round((score / questions.length) * 100)}%
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleExit}
          className="px-12 py-4 rounded-2xl"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
            Retour à l'accueil
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
        <Pressable
          onPress={handleExit}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-white text-xl">×</Text>
        </Pressable>

        {/* Progress */}
        <Text style={{ color: COLORS.textMuted }} className="font-medium">
          Question {currentIndex + 1}
          {!isUnlimited && `/${totalQuestions}`}
        </Text>

        {/* Score */}
        <View
          className="flex-row items-center px-4 py-2 rounded-full"
          style={{ backgroundColor: COLORS.successDim }}
        >
          <Text className="text-lg mr-2">✅</Text>
          <Text style={{ color: COLORS.success }} className="font-bold">
            {score}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-5 justify-center">
        {/* Category Badge */}
        {currentQuestion && (
          <View className="items-center mb-6">
            <View
              className="px-4 py-2 rounded-full flex-row items-center"
              style={{
                backgroundColor: COLORS.surface,
              }}
            >
              <Text className="text-xl mr-2">
                {categoryInfo?.icon ||
                  getCategoryInfo(currentQuestion.category as Category)?.icon ||
                  "🎯"}
              </Text>
              <Text style={{ color: COLORS.textMuted }} className="font-medium">
                {categoryInfo?.nameFr ||
                  getCategoryInfo(currentQuestion.category as Category)?.nameFr ||
                  "Culture Générale"}
              </Text>
            </View>
          </View>
        )}

        {/* Question Card */}
        <View
          className="rounded-3xl p-8"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Text className="text-white text-2xl font-bold text-center leading-relaxed">
            "{currentQuestion?.question_text}"
          </Text>
        </View>

        {/* Answer Section */}
        {!isAnswerRevealed ? (
          <Pressable
            onPress={handleReveal}
            className="mt-8 py-6 rounded-2xl items-center active:opacity-80"
            style={{
              backgroundColor: COLORS.primaryDim,
              borderWidth: 2,
              borderColor: COLORS.primary,
              borderStyle: "dashed",
            }}
          >
            <Text className="text-4xl mb-2">👆</Text>
            <Text style={{ color: COLORS.primary }} className="font-bold text-lg">
              TAP POUR RÉVÉLER
            </Text>
          </Pressable>
        ) : (
          <View className="mt-8">
            {/* Answer Reveal */}
            <View
              className="p-6 rounded-2xl items-center mb-6"
              style={{
                backgroundColor: COLORS.successDim,
                borderWidth: 2,
                borderColor: COLORS.success,
              }}
            >
              <Text style={{ color: COLORS.textMuted }} className="text-sm mb-2">
                RÉPONSE
              </Text>
              <Text
                className="text-2xl font-black text-center"
                style={{ color: COLORS.success }}
              >
                {currentQuestion?.correct_answer}
              </Text>
            </View>

            {/* Did someone get it? */}
            <Text
              className="text-center mb-4 font-medium"
              style={{ color: COLORS.textMuted }}
            >
              Quelqu'un a trouvé ?
            </Text>

            <View className="flex-row gap-4">
              <Pressable
                onPress={handleCorrect}
                className="flex-1 py-4 rounded-2xl items-center flex-row justify-center active:opacity-80"
                style={{ backgroundColor: COLORS.success }}
              >
                <Text className="text-2xl mr-2">✅</Text>
                <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
                  OUI +1
                </Text>
              </Pressable>

              <Pressable
                onPress={handleIncorrect}
                className="flex-1 py-4 rounded-2xl items-center flex-row justify-center active:opacity-80"
                style={{ backgroundColor: COLORS.surface }}
              >
                <Text className="text-2xl mr-2">❌</Text>
                <Text className="font-bold text-lg" style={{ color: COLORS.text }}>
                  NON
                </Text>
              </Pressable>
            </View>

            {/* Skip to next without scoring */}
            <Pressable
              onPress={goToNext}
              className="mt-4 py-3 items-center"
            >
              <Text style={{ color: COLORS.textMuted }}>
                Question suivante →
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Footer hint */}
      <View className="px-5 pb-6">
        <Text className="text-center text-sm" style={{ color: COLORS.textMuted }}>
          Le narrateur lit la question à voix haute
        </Text>
      </View>
    </SafeAreaView>
  );
}
