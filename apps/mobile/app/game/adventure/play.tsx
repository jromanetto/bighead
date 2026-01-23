import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getAdventureQuestions } from "../../../src/services/adventure";
import { markQuestionSeen } from "../../../src/services/questions";
import { playSound } from "../../../src/services/sounds";
import {
  Category,
  Tier,
  getCategoryInfo,
  getTierInfo,
  getNextLevel,
  CATEGORIES,
  QUESTIONS_PER_CATEGORY,
  MAX_ERRORS_ALLOWED,
  AdventureProgress,
} from "../../../src/types/adventure";

const STORAGE_KEY = "adventure_progress";
const ATTEMPTS_KEY = "adventure_attempts";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceActive: "#252e33",
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.2)",
  error: "#ef4444",
  errorDim: "rgba(239, 68, 68, 0.2)",
  yellow: "#FFD700",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

const LETTER_OPTIONS = ["A", "B", "C", "D"];
const TIME_PER_QUESTION = 15;

// Mock questions for testing when database is unavailable
const MOCK_QUESTIONS: Record<string, Question[]> = {
  culture_generale: [
    { id: "cg1", question_text: "Quelle est la capitale de la France ?", correct_answer: "Paris", wrong_answers: ["Lyon", "Marseille", "Bordeaux"], category: "culture_generale", difficulty: 1 },
    { id: "cg2", question_text: "Combien y a-t-il de continents sur Terre ?", correct_answer: "7", wrong_answers: ["5", "6", "8"], category: "culture_generale", difficulty: 1 },
    { id: "cg3", question_text: "Qui a peint La Joconde ?", correct_answer: "Léonard de Vinci", wrong_answers: ["Michel-Ange", "Raphaël", "Picasso"], category: "culture_generale", difficulty: 2 },
    { id: "cg4", question_text: "Quel est le plus grand océan du monde ?", correct_answer: "Océan Pacifique", wrong_answers: ["Océan Atlantique", "Océan Indien", "Océan Arctique"], category: "culture_generale", difficulty: 2 },
    { id: "cg5", question_text: "En quelle année l'homme a-t-il marché sur la Lune ?", correct_answer: "1969", wrong_answers: ["1965", "1971", "1973"], category: "culture_generale", difficulty: 3 },
    { id: "cg6", question_text: "Quel est l'élément chimique le plus abondant dans l'univers ?", correct_answer: "Hydrogène", wrong_answers: ["Hélium", "Oxygène", "Carbone"], category: "culture_generale", difficulty: 3 },
    { id: "cg7", question_text: "Combien d'os compte le corps humain adulte ?", correct_answer: "206", wrong_answers: ["186", "226", "256"], category: "culture_generale", difficulty: 4 },
    { id: "cg8", question_text: "Quelle planète est surnommée la planète rouge ?", correct_answer: "Mars", wrong_answers: ["Vénus", "Jupiter", "Saturne"], category: "culture_generale", difficulty: 2 },
    { id: "cg9", question_text: "Quel animal est le symbole de l'Australie ?", correct_answer: "Kangourou", wrong_answers: ["Koala", "Émeu", "Ornithorynque"], category: "culture_generale", difficulty: 2 },
    { id: "cg10", question_text: "Quel est le plus petit pays du monde ?", correct_answer: "Vatican", wrong_answers: ["Monaco", "Saint-Marin", "Liechtenstein"], category: "culture_generale", difficulty: 3 },
    { id: "cg11", question_text: "Combien de jours y a-t-il dans une semaine ?", correct_answer: "7", wrong_answers: ["5", "6", "8"], category: "culture_generale", difficulty: 1 },
    { id: "cg12", question_text: "Quelle est la couleur du ciel par beau temps ?", correct_answer: "Bleu", wrong_answers: ["Vert", "Rouge", "Jaune"], category: "culture_generale", difficulty: 1 },
    { id: "cg13", question_text: "Quelle est la monnaie utilisée au Japon ?", correct_answer: "Yen", wrong_answers: ["Yuan", "Won", "Dollar"], category: "culture_generale", difficulty: 2 },
    { id: "cg14", question_text: "Quel est le plus long fleuve de France ?", correct_answer: "Loire", wrong_answers: ["Seine", "Rhône", "Garonne"], category: "culture_generale", difficulty: 2 },
    { id: "cg15", question_text: "Quelle est la plus haute montagne du monde ?", correct_answer: "Everest", wrong_answers: ["K2", "Mont Blanc", "Kilimandjaro"], category: "culture_generale", difficulty: 2 },
    { id: "cg16", question_text: "Quel est le symbole chimique de l'or ?", correct_answer: "Au", wrong_answers: ["Or", "Ag", "Fe"], category: "culture_generale", difficulty: 3 },
    { id: "cg17", question_text: "Quelle vitamine est produite par le soleil ?", correct_answer: "Vitamine D", wrong_answers: ["Vitamine C", "Vitamine A", "Vitamine B"], category: "culture_generale", difficulty: 3 },
    { id: "cg18", question_text: "Quel est le point le plus profond des océans ?", correct_answer: "Fosse des Mariannes", wrong_answers: ["Fosse de Porto Rico", "Fosse du Japon", "Fosse des Philippines"], category: "culture_generale", difficulty: 4 },
    { id: "cg19", question_text: "Combien de satellites naturels a Mars ?", correct_answer: "2", wrong_answers: ["0", "1", "4"], category: "culture_generale", difficulty: 4 },
    { id: "cg20", question_text: "Quel est le nom du plus grand diamant jamais découvert ?", correct_answer: "Cullinan", wrong_answers: ["Hope", "Koh-i-Noor", "Régent"], category: "culture_generale", difficulty: 5 },
  ],
  histoire: [
    { id: "h1", question_text: "Qui était le roi de France surnommé le Roi Soleil ?", correct_answer: "Louis XIV", wrong_answers: ["Louis XV", "Louis XVI", "François Ier"], category: "histoire", difficulty: 1 },
    { id: "h2", question_text: "En quelle année a eu lieu la chute du mur de Berlin ?", correct_answer: "1989", wrong_answers: ["1987", "1991", "1985"], category: "histoire", difficulty: 1 },
    { id: "h3", question_text: "Qui a découvert l'Amérique en 1492 ?", correct_answer: "Christophe Colomb", wrong_answers: ["Amerigo Vespucci", "Marco Polo", "Vasco de Gama"], category: "histoire", difficulty: 1 },
    { id: "h4", question_text: "En quelle année a commencé la Première Guerre mondiale ?", correct_answer: "1914", wrong_answers: ["1912", "1916", "1918"], category: "histoire", difficulty: 2 },
    { id: "h5", question_text: "En quelle année Napoléon est-il devenu empereur ?", correct_answer: "1804", wrong_answers: ["1799", "1806", "1810"], category: "histoire", difficulty: 3 },
    { id: "h6", question_text: "Quelle bataille a mis fin à l'Empire de Napoléon ?", correct_answer: "Waterloo", wrong_answers: ["Austerlitz", "Trafalgar", "Iéna"], category: "histoire", difficulty: 4 },
    { id: "h7", question_text: "Qui a inventé l'imprimerie ?", correct_answer: "Gutenberg", wrong_answers: ["Léonard de Vinci", "Galilée", "Copernic"], category: "histoire", difficulty: 3 },
    { id: "h8", question_text: "Quelle civilisation a construit les pyramides de Gizeh ?", correct_answer: "Égyptienne", wrong_answers: ["Maya", "Aztèque", "Romaine"], category: "histoire", difficulty: 2 },
    { id: "h9", question_text: "En quelle année la Seconde Guerre mondiale s'est-elle terminée ?", correct_answer: "1945", wrong_answers: ["1943", "1944", "1946"], category: "histoire", difficulty: 3 },
    { id: "h10", question_text: "Qui était Martin Luther King ?", correct_answer: "Un militant des droits civiques", wrong_answers: ["Un président américain", "Un pasteur allemand", "Un scientifique"], category: "histoire", difficulty: 3 },
    { id: "h11", question_text: "Quel pharaon est associé au masque d'or le plus célèbre ?", correct_answer: "Toutânkhamon", wrong_answers: ["Ramsès II", "Cléopâtre", "Khéops"], category: "histoire", difficulty: 2 },
    { id: "h12", question_text: "En quelle année la Révolution française a-t-elle commencé ?", correct_answer: "1789", wrong_answers: ["1776", "1792", "1799"], category: "histoire", difficulty: 2 },
    { id: "h13", question_text: "Qui était Jeanne d'Arc ?", correct_answer: "Une héroïne française", wrong_answers: ["Une reine anglaise", "Une impératrice romaine", "Une princesse espagnole"], category: "histoire", difficulty: 1 },
    { id: "h14", question_text: "Quel empire a régné sur la Méditerranée dans l'Antiquité ?", correct_answer: "Empire romain", wrong_answers: ["Empire grec", "Empire perse", "Empire ottoman"], category: "histoire", difficulty: 2 },
    { id: "h15", question_text: "Qui a été le premier président des États-Unis ?", correct_answer: "George Washington", wrong_answers: ["Abraham Lincoln", "Thomas Jefferson", "John Adams"], category: "histoire", difficulty: 2 },
    { id: "h16", question_text: "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?", correct_answer: "1969", wrong_answers: ["1965", "1971", "1973"], category: "histoire", difficulty: 2 },
    { id: "h17", question_text: "Quelle guerre a opposé le Nord et le Sud des États-Unis ?", correct_answer: "Guerre de Sécession", wrong_answers: ["Guerre d'Indépendance", "Guerre du Mexique", "Guerre du Vietnam"], category: "histoire", difficulty: 3 },
    { id: "h18", question_text: "Qui a peint le plafond de la chapelle Sixtine ?", correct_answer: "Michel-Ange", wrong_answers: ["Raphaël", "Léonard de Vinci", "Botticelli"], category: "histoire", difficulty: 3 },
    { id: "h19", question_text: "Quel événement a déclenché la Première Guerre mondiale ?", correct_answer: "Assassinat de l'archiduc François-Ferdinand", wrong_answers: ["Invasion de la Pologne", "Traité de Versailles", "Révolution russe"], category: "histoire", difficulty: 4 },
    { id: "h20", question_text: "Quel peuple a construit Machu Picchu ?", correct_answer: "Les Incas", wrong_answers: ["Les Aztèques", "Les Mayas", "Les Olmèques"], category: "histoire", difficulty: 3 },
  ],
  geographie: [
    { id: "g1", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "France", wrong_answers: ["Belgique", "Italie", "Pays-Bas"], category: "geographie", difficulty: 1, image_url: "https://flagcdn.com/w320/fr.png" },
    { id: "g2", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Allemagne", wrong_answers: ["Belgique", "Autriche", "Suisse"], category: "geographie", difficulty: 1, image_url: "https://flagcdn.com/w320/de.png" },
    { id: "g3", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Italie", wrong_answers: ["Mexique", "Irlande", "Côte d'Ivoire"], category: "geographie", difficulty: 1, image_url: "https://flagcdn.com/w320/it.png" },
    { id: "g4", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Japon", wrong_answers: ["Corée du Sud", "Chine", "Vietnam"], category: "geographie", difficulty: 2, image_url: "https://flagcdn.com/w320/jp.png" },
    { id: "g5", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Brésil", wrong_answers: ["Argentine", "Colombie", "Venezuela"], category: "geographie", difficulty: 2, image_url: "https://flagcdn.com/w320/br.png" },
    { id: "g6", question_text: "Dans quelle ville se trouve ce monument ?", correct_answer: "Paris", wrong_answers: ["Londres", "Rome", "New York"], category: "geographie", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/200px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg" },
    { id: "g7", question_text: "Dans quel pays se trouve ce monument ?", correct_answer: "Inde", wrong_answers: ["Pakistan", "Bangladesh", "Iran"], category: "geographie", difficulty: 3, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/300px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg" },
    { id: "g8", question_text: "Dans quel pays se trouve ce monument ?", correct_answer: "Égypte", wrong_answers: ["Soudan", "Libye", "Jordanie"], category: "geographie", difficulty: 2, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/300px-Kheops-Pyramid.jpg" },
    { id: "g9", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Canada", wrong_answers: ["États-Unis", "Australie", "Nouvelle-Zélande"], category: "geographie", difficulty: 2, image_url: "https://flagcdn.com/w320/ca.png" },
    { id: "g10", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Espagne", wrong_answers: ["Portugal", "Andorre", "Monaco"], category: "geographie", difficulty: 1, image_url: "https://flagcdn.com/w320/es.png" },
    { id: "g11", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Royaume-Uni", wrong_answers: ["Australie", "Nouvelle-Zélande", "Fidji"], category: "geographie", difficulty: 1, image_url: "https://flagcdn.com/w320/gb.png" },
    { id: "g12", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Portugal", wrong_answers: ["Espagne", "Brésil", "Italie"], category: "geographie", difficulty: 2, image_url: "https://flagcdn.com/w320/pt.png" },
    { id: "g13", question_text: "Quelle est la capitale de l'Italie ?", correct_answer: "Rome", wrong_answers: ["Milan", "Florence", "Venise"], category: "geographie", difficulty: 1 },
    { id: "g14", question_text: "Quel est le plus grand pays du monde par superficie ?", correct_answer: "Russie", wrong_answers: ["Canada", "États-Unis", "Chine"], category: "geographie", difficulty: 2 },
    { id: "g15", question_text: "Quelle est la capitale de l'Australie ?", correct_answer: "Canberra", wrong_answers: ["Sydney", "Melbourne", "Brisbane"], category: "geographie", difficulty: 3 },
    { id: "g16", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Suisse", wrong_answers: ["Autriche", "Danemark", "Malte"], category: "geographie", difficulty: 2, image_url: "https://flagcdn.com/w320/ch.png" },
    { id: "g17", question_text: "Quel fleuve traverse Paris ?", correct_answer: "La Seine", wrong_answers: ["La Loire", "Le Rhône", "La Garonne"], category: "geographie", difficulty: 1 },
    { id: "g18", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Mexique", wrong_answers: ["Italie", "Irlande", "Hongrie"], category: "geographie", difficulty: 2, image_url: "https://flagcdn.com/w320/mx.png" },
    { id: "g19", question_text: "Quelle est la capitale de l'Espagne ?", correct_answer: "Madrid", wrong_answers: ["Barcelone", "Séville", "Valence"], category: "geographie", difficulty: 1 },
    { id: "g20", question_text: "À quel pays appartient ce drapeau ?", correct_answer: "Corée du Sud", wrong_answers: ["Japon", "Chine", "Taiwan"], category: "geographie", difficulty: 3, image_url: "https://flagcdn.com/w320/kr.png" },
  ],
  sciences: [
    { id: "s1", question_text: "Quelle planète est la plus proche du Soleil ?", correct_answer: "Mercure", wrong_answers: ["Vénus", "Mars", "Terre"], category: "sciences", difficulty: 1 },
    { id: "s2", question_text: "Quel gaz respirons-nous principalement ?", correct_answer: "Oxygène", wrong_answers: ["Azote", "Dioxyde de carbone", "Hydrogène"], category: "sciences", difficulty: 1 },
    { id: "s3", question_text: "Quel est le symbole chimique de l'or ?", correct_answer: "Au", wrong_answers: ["Or", "Ag", "Fe"], category: "sciences", difficulty: 2 },
    { id: "s4", question_text: "Quel organe pompe le sang dans notre corps ?", correct_answer: "Le cœur", wrong_answers: ["Les poumons", "Le foie", "Les reins"], category: "sciences", difficulty: 1 },
    { id: "s5", question_text: "Quelle force nous maintient sur Terre ?", correct_answer: "La gravité", wrong_answers: ["Le magnétisme", "L'électricité", "La friction"], category: "sciences", difficulty: 2 },
    { id: "s6", question_text: "Combien de chromosomes possède un être humain ?", correct_answer: "46", wrong_answers: ["44", "48", "42"], category: "sciences", difficulty: 4 },
    { id: "s7", question_text: "Quel est le plus grand organe du corps humain ?", correct_answer: "La peau", wrong_answers: ["Le foie", "Les poumons", "L'intestin"], category: "sciences", difficulty: 2 },
    { id: "s8", question_text: "Quelle est la planète la plus grande du système solaire ?", correct_answer: "Jupiter", wrong_answers: ["Saturne", "Uranus", "Neptune"], category: "sciences", difficulty: 2 },
    { id: "s9", question_text: "Combien de planètes composent notre système solaire ?", correct_answer: "8", wrong_answers: ["7", "9", "10"], category: "sciences", difficulty: 1 },
    { id: "s10", question_text: "Quelle est la température d'ébullition de l'eau ?", correct_answer: "100°C", wrong_answers: ["90°C", "110°C", "120°C"], category: "sciences", difficulty: 2 },
    { id: "s11", question_text: "Quel est le symbole chimique de l'eau ?", correct_answer: "H2O", wrong_answers: ["O2", "CO2", "H2"], category: "sciences", difficulty: 1 },
    { id: "s12", question_text: "Quel animal est le plus rapide sur terre ?", correct_answer: "Guépard", wrong_answers: ["Lion", "Tigre", "Antilope"], category: "sciences", difficulty: 1 },
    { id: "s13", question_text: "Combien d'os a un bébé humain à la naissance ?", correct_answer: "Environ 300", wrong_answers: ["206", "150", "350"], category: "sciences", difficulty: 4 },
    { id: "s14", question_text: "Quelle est la formule chimique du sel de table ?", correct_answer: "NaCl", wrong_answers: ["KCl", "CaCl2", "MgCl"], category: "sciences", difficulty: 3 },
    { id: "s15", question_text: "Quel est le plus petit os du corps humain ?", correct_answer: "L'étrier (dans l'oreille)", wrong_answers: ["Le fémur", "La rotule", "Le crâne"], category: "sciences", difficulty: 3 },
    { id: "s16", question_text: "Qu'est-ce qui fait que le ciel est bleu ?", correct_answer: "La diffusion de la lumière", wrong_answers: ["La réflexion des océans", "Les nuages", "L'atmosphère jaune"], category: "sciences", difficulty: 3 },
    { id: "s17", question_text: "Quelle planète a des anneaux visibles ?", correct_answer: "Saturne", wrong_answers: ["Mars", "Vénus", "Mercure"], category: "sciences", difficulty: 1 },
    { id: "s18", question_text: "Combien de pattes a une araignée ?", correct_answer: "8", wrong_answers: ["6", "10", "12"], category: "sciences", difficulty: 1 },
    { id: "s19", question_text: "Quel gaz les plantes absorbent-elles ?", correct_answer: "Dioxyde de carbone", wrong_answers: ["Oxygène", "Azote", "Hydrogène"], category: "sciences", difficulty: 2 },
    { id: "s20", question_text: "Quelle est la vitesse de la lumière ?", correct_answer: "300 000 km/s", wrong_answers: ["150 000 km/s", "500 000 km/s", "1 000 000 km/s"], category: "sciences", difficulty: 4 },
  ],
  sport: [
    { id: "sp1", question_text: "Combien de joueurs composent une équipe de football ?", correct_answer: "11", wrong_answers: ["9", "10", "12"], category: "sport", difficulty: 1 },
    { id: "sp2", question_text: "Dans quel sport utilise-t-on une raquette et un volant ?", correct_answer: "Badminton", wrong_answers: ["Tennis", "Squash", "Ping-pong"], category: "sport", difficulty: 1 },
    { id: "sp3", question_text: "Qui a remporté le plus de Ballons d'Or ?", correct_answer: "Lionel Messi", wrong_answers: ["Cristiano Ronaldo", "Michel Platini", "Johan Cruyff"], category: "sport", difficulty: 2 },
    { id: "sp4", question_text: "Quel pays a remporté le plus de Coupes du monde de football ?", correct_answer: "Brésil", wrong_answers: ["Allemagne", "Italie", "Argentine"], category: "sport", difficulty: 2 },
    { id: "sp5", question_text: "Quelle est la distance d'un marathon ?", correct_answer: "42,195 km", wrong_answers: ["40 km", "45 km", "50 km"], category: "sport", difficulty: 3 },
    { id: "sp6", question_text: "Qui détient le record du monde du 100m ?", correct_answer: "Usain Bolt", wrong_answers: ["Tyson Gay", "Yohan Blake", "Justin Gatlin"], category: "sport", difficulty: 3 },
    { id: "sp7", question_text: "Quel sport pratique Tiger Woods ?", correct_answer: "Golf", wrong_answers: ["Tennis", "Cricket", "Polo"], category: "sport", difficulty: 2 },
    { id: "sp8", question_text: "Combien de temps dure un match de football ?", correct_answer: "90 minutes", wrong_answers: ["80 minutes", "100 minutes", "120 minutes"], category: "sport", difficulty: 2 },
    { id: "sp9", question_text: "Quel nageur a remporté le plus de médailles olympiques ?", correct_answer: "Michael Phelps", wrong_answers: ["Mark Spitz", "Ryan Lochte", "Ian Thorpe"], category: "sport", difficulty: 3 },
    { id: "sp10", question_text: "Quel club a remporté le plus de Ligues des Champions ?", correct_answer: "Real Madrid", wrong_answers: ["AC Milan", "Liverpool", "Bayern Munich"], category: "sport", difficulty: 3 },
    { id: "sp11", question_text: "Quel sport se joue à Wimbledon ?", correct_answer: "Tennis", wrong_answers: ["Golf", "Cricket", "Rugby"], category: "sport", difficulty: 1 },
    { id: "sp12", question_text: "Combien de joueurs composent une équipe de basket ?", correct_answer: "5", wrong_answers: ["6", "7", "4"], category: "sport", difficulty: 1 },
    { id: "sp13", question_text: "Quel pays organise la Formule 1 à Monaco ?", correct_answer: "Monaco", wrong_answers: ["France", "Italie", "Espagne"], category: "sport", difficulty: 1 },
    { id: "sp14", question_text: "Quel joueur de tennis a remporté le plus de Grand Chelem ?", correct_answer: "Novak Djokovic", wrong_answers: ["Roger Federer", "Rafael Nadal", "Pete Sampras"], category: "sport", difficulty: 3 },
    { id: "sp15", question_text: "Dans quel sport fait-on des touchdowns ?", correct_answer: "Football américain", wrong_answers: ["Rugby", "Football", "Hockey"], category: "sport", difficulty: 2 },
    { id: "sp16", question_text: "Quel pilote de F1 a remporté 7 titres mondiaux ?", correct_answer: "Michael Schumacher", wrong_answers: ["Ayrton Senna", "Alain Prost", "Sebastian Vettel"], category: "sport", difficulty: 3 },
    { id: "sp17", question_text: "Quel est le pays hôte des Jeux Olympiques 2024 ?", correct_answer: "France", wrong_answers: ["États-Unis", "Japon", "Chine"], category: "sport", difficulty: 1 },
    { id: "sp18", question_text: "Combien de sets faut-il gagner pour remporter un match de tennis en Grand Chelem (hommes) ?", correct_answer: "3", wrong_answers: ["2", "4", "5"], category: "sport", difficulty: 2 },
    { id: "sp19", question_text: "Quel boxeur est surnommé 'The Greatest' ?", correct_answer: "Mohamed Ali", wrong_answers: ["Mike Tyson", "Floyd Mayweather", "Manny Pacquiao"], category: "sport", difficulty: 2 },
    { id: "sp20", question_text: "Quel pays a remporté la Coupe du Monde 2022 ?", correct_answer: "Argentine", wrong_answers: ["France", "Brésil", "Allemagne"], category: "sport", difficulty: 2 },
  ],
  pop_culture: [
    { id: "pc1", question_text: "Qui chante 'Bad Guy' ?", correct_answer: "Billie Eilish", wrong_answers: ["Ariana Grande", "Taylor Swift", "Dua Lipa"], category: "pop_culture", difficulty: 1 },
    { id: "pc2", question_text: "Qui est Harry Potter ?", correct_answer: "Un sorcier", wrong_answers: ["Un vampire", "Un super-héros", "Un extraterrestre"], category: "pop_culture", difficulty: 1 },
    { id: "pc3", question_text: "Quel groupe a chanté 'Bohemian Rhapsody' ?", correct_answer: "Queen", wrong_answers: ["The Beatles", "Led Zeppelin", "Pink Floyd"], category: "pop_culture", difficulty: 2 },
    { id: "pc4", question_text: "Qui interprète Iron Man dans les films Marvel ?", correct_answer: "Robert Downey Jr.", wrong_answers: ["Chris Evans", "Chris Hemsworth", "Mark Ruffalo"], category: "pop_culture", difficulty: 2 },
    { id: "pc5", question_text: "Quelle série met en scène des dragons et le Trône de Fer ?", correct_answer: "Game of Thrones", wrong_answers: ["The Witcher", "Vikings", "The Last Kingdom"], category: "pop_culture", difficulty: 2 },
    { id: "pc6", question_text: "Qui a créé la saga Star Wars ?", correct_answer: "George Lucas", wrong_answers: ["Steven Spielberg", "James Cameron", "Peter Jackson"], category: "pop_culture", difficulty: 2 },
    { id: "pc7", question_text: "Quel acteur joue le Joker dans 'The Dark Knight' ?", correct_answer: "Heath Ledger", wrong_answers: ["Joaquin Phoenix", "Jack Nicholson", "Jared Leto"], category: "pop_culture", difficulty: 3 },
    { id: "pc8", question_text: "Quelle série Netflix parle d'un jeu mortel coréen ?", correct_answer: "Squid Game", wrong_answers: ["Alice in Borderland", "Sweet Home", "Kingdom"], category: "pop_culture", difficulty: 2 },
    { id: "pc9", question_text: "Quel super-héros vient de Krypton ?", correct_answer: "Superman", wrong_answers: ["Batman", "Spider-Man", "Flash"], category: "pop_culture", difficulty: 1 },
    { id: "pc10", question_text: "Quelle chanteuse est surnommée 'Queen B' ?", correct_answer: "Beyoncé", wrong_answers: ["Rihanna", "Lady Gaga", "Britney Spears"], category: "pop_culture", difficulty: 2 },
    { id: "pc11", question_text: "Quel rappeur est connu pour 'Lose Yourself' ?", correct_answer: "Eminem", wrong_answers: ["50 Cent", "Dr. Dre", "Snoop Dogg"], category: "pop_culture", difficulty: 2 },
    { id: "pc12", question_text: "Quelle série raconte l'histoire de Eleven ?", correct_answer: "Stranger Things", wrong_answers: ["The Umbrella Academy", "Locke & Key", "Dark"], category: "pop_culture", difficulty: 1 },
    { id: "pc13", question_text: "Quel groupe coréen est le plus populaire au monde ?", correct_answer: "BTS", wrong_answers: ["BLACKPINK", "EXO", "TWICE"], category: "pop_culture", difficulty: 1 },
    { id: "pc14", question_text: "Qui joue Jack Sparrow ?", correct_answer: "Johnny Depp", wrong_answers: ["Orlando Bloom", "Brad Pitt", "Leonardo DiCaprio"], category: "pop_culture", difficulty: 1 },
    { id: "pc15", question_text: "Quelle chanteuse a sorti l'album '1989' ?", correct_answer: "Taylor Swift", wrong_answers: ["Katy Perry", "Lady Gaga", "Ariana Grande"], category: "pop_culture", difficulty: 2 },
    { id: "pc16", question_text: "Quel film Disney raconte l'histoire d'Elsa et Anna ?", correct_answer: "La Reine des Neiges", wrong_answers: ["Raiponce", "Vaiana", "Encanto"], category: "pop_culture", difficulty: 1 },
    { id: "pc17", question_text: "Qui est le créateur de Mickey Mouse ?", correct_answer: "Walt Disney", wrong_answers: ["Pixar", "Steven Spielberg", "Warner Bros"], category: "pop_culture", difficulty: 1 },
    { id: "pc18", question_text: "Quelle série HBO raconte la vie de familles mafieuses ?", correct_answer: "Les Soprano", wrong_answers: ["Breaking Bad", "Ozark", "Narcos"], category: "pop_culture", difficulty: 3 },
    { id: "pc19", question_text: "Quel artiste chante 'Blinding Lights' ?", correct_answer: "The Weeknd", wrong_answers: ["Bruno Mars", "Post Malone", "Drake"], category: "pop_culture", difficulty: 2 },
    { id: "pc20", question_text: "Quelle saga de livres a inspiré les films Hunger Games ?", correct_answer: "Suzanne Collins", wrong_answers: ["J.K. Rowling", "Stephenie Meyer", "Veronica Roth"], category: "pop_culture", difficulty: 3 },
  ],
  jeux_video: [
    { id: "jv1", question_text: "Quel est le personnage principal de Mario ?", correct_answer: "Mario", wrong_answers: ["Luigi", "Peach", "Bowser"], category: "jeux_video", difficulty: 1 },
    { id: "jv2", question_text: "Quel jeu met en scène des blocs qui tombent ?", correct_answer: "Tetris", wrong_answers: ["Pac-Man", "Snake", "Pong"], category: "jeux_video", difficulty: 1 },
    { id: "jv3", question_text: "Quel jeu de battle royale est gratuit et très populaire ?", correct_answer: "Fortnite", wrong_answers: ["PUBG", "Apex Legends", "Call of Duty Warzone"], category: "jeux_video", difficulty: 1 },
    { id: "jv4", question_text: "Dans quel jeu construit-on des maisons avec des blocs ?", correct_answer: "Minecraft", wrong_answers: ["Roblox", "Terraria", "Lego Worlds"], category: "jeux_video", difficulty: 1 },
    { id: "jv5", question_text: "Quel est le nom du héros de Zelda ?", correct_answer: "Link", wrong_answers: ["Zelda", "Ganon", "Epona"], category: "jeux_video", difficulty: 2 },
    { id: "jv6", question_text: "Quel studio a créé GTA V ?", correct_answer: "Rockstar Games", wrong_answers: ["Ubisoft", "EA Games", "Activision"], category: "jeux_video", difficulty: 2 },
    { id: "jv7", question_text: "Quelle est la mascotte de Sega ?", correct_answer: "Sonic", wrong_answers: ["Mario", "Crash Bandicoot", "Spyro"], category: "jeux_video", difficulty: 2 },
    { id: "jv8", question_text: "Quel Pokémon est le plus connu ?", correct_answer: "Pikachu", wrong_answers: ["Évoli", "Dracaufeu", "Mewtwo"], category: "jeux_video", difficulty: 1 },
    { id: "jv9", question_text: "Quel est le jeu le plus vendu de tous les temps ?", correct_answer: "Minecraft", wrong_answers: ["GTA V", "Tetris", "Wii Sports"], category: "jeux_video", difficulty: 3 },
    { id: "jv10", question_text: "Quelle console a créé Nintendo en 2017 ?", correct_answer: "Switch", wrong_answers: ["Wii U", "3DS", "GameCube"], category: "jeux_video", difficulty: 2 },
    { id: "jv11", question_text: "Quel jeu de sport est développé par EA chaque année ?", correct_answer: "FIFA", wrong_answers: ["PES", "NBA 2K", "Madden"], category: "jeux_video", difficulty: 1 },
    { id: "jv12", question_text: "Quel personnage mange des fantômes ?", correct_answer: "Pac-Man", wrong_answers: ["Mario", "Sonic", "Kirby"], category: "jeux_video", difficulty: 1 },
    { id: "jv13", question_text: "Quel jeu de tir est connu pour ses zombies ?", correct_answer: "Call of Duty", wrong_answers: ["Battlefield", "Halo", "Counter-Strike"], category: "jeux_video", difficulty: 2 },
    { id: "jv14", question_text: "Quel est le nom du plombier vert ami de Mario ?", correct_answer: "Luigi", wrong_answers: ["Wario", "Waluigi", "Toad"], category: "jeux_video", difficulty: 1 },
    { id: "jv15", question_text: "Quel jeu mobile consiste à attraper des créatures en AR ?", correct_answer: "Pokémon GO", wrong_answers: ["Ingress", "Harry Potter GO", "Jurassic World Alive"], category: "jeux_video", difficulty: 1 },
    { id: "jv16", question_text: "Quelle saga met en scène Kratos ?", correct_answer: "God of War", wrong_answers: ["Devil May Cry", "Dark Souls", "Bayonetta"], category: "jeux_video", difficulty: 2 },
    { id: "jv17", question_text: "Quel jeu de simulation de vie est développé par Maxis ?", correct_answer: "Les Sims", wrong_answers: ["Animal Crossing", "Stardew Valley", "Harvest Moon"], category: "jeux_video", difficulty: 2 },
    { id: "jv18", question_text: "Quelle console de Sony est sortie en 2020 ?", correct_answer: "PlayStation 5", wrong_answers: ["PlayStation 4", "Xbox Series X", "Nintendo Switch"], category: "jeux_video", difficulty: 2 },
    { id: "jv19", question_text: "Quel jeu de course est la franchise phare de Nintendo ?", correct_answer: "Mario Kart", wrong_answers: ["Gran Turismo", "Need for Speed", "Forza"], category: "jeux_video", difficulty: 1 },
    { id: "jv20", question_text: "Quel jeu de combat met en scène des personnages Nintendo ?", correct_answer: "Super Smash Bros", wrong_answers: ["Street Fighter", "Mortal Kombat", "Tekken"], category: "jeux_video", difficulty: 2 },
  ],
  cinema: [
    { id: "c1", question_text: "Quel film raconte l'histoire d'un lion nommé Simba ?", correct_answer: "Le Roi Lion", wrong_answers: ["Madagascar", "Kung Fu Panda", "Zootopia"], category: "cinema", difficulty: 1 },
    { id: "c2", question_text: "Qui joue Spider-Man dans les films récents ?", correct_answer: "Tom Holland", wrong_answers: ["Andrew Garfield", "Tobey Maguire", "Miles Morales"], category: "cinema", difficulty: 1 },
    { id: "c3", question_text: "Quel film met en scène des jouets qui prennent vie ?", correct_answer: "Toy Story", wrong_answers: ["Cars", "Monstres et Cie", "Là-haut"], category: "cinema", difficulty: 1 },
    { id: "c4", question_text: "Quelle série parle de chimie et de drogue ?", correct_answer: "Breaking Bad", wrong_answers: ["Narcos", "Ozark", "Better Call Saul"], category: "cinema", difficulty: 2 },
    { id: "c5", question_text: "Qui joue le personnage de Wolverine ?", correct_answer: "Hugh Jackman", wrong_answers: ["Chris Hemsworth", "Ryan Reynolds", "Liam Hemsworth"], category: "cinema", difficulty: 2 },
    { id: "c6", question_text: "Quel est le film le plus rentable de tous les temps ?", correct_answer: "Avatar", wrong_answers: ["Avengers: Endgame", "Titanic", "Star Wars"], category: "cinema", difficulty: 3 },
    { id: "c7", question_text: "Qui a réalisé Pulp Fiction ?", correct_answer: "Quentin Tarantino", wrong_answers: ["Martin Scorsese", "Francis Ford Coppola", "Steven Spielberg"], category: "cinema", difficulty: 3 },
    { id: "c8", question_text: "Quel héros porte un masque noir et une cape ?", correct_answer: "Batman", wrong_answers: ["Zorro", "The Phantom", "Spawn"], category: "cinema", difficulty: 1 },
    { id: "c9", question_text: "Qui joue James Bond depuis 2006 ?", correct_answer: "Daniel Craig", wrong_answers: ["Pierce Brosnan", "Timothy Dalton", "Sean Connery"], category: "cinema", difficulty: 2 },
    { id: "c10", question_text: "Quel film de Pixar parle de poissons ?", correct_answer: "Le Monde de Nemo", wrong_answers: ["Shark Tale", "La Petite Sirène", "Ponyo"], category: "cinema", difficulty: 1 },
    { id: "c11", question_text: "Qui réalise les films Avengers ?", correct_answer: "Les frères Russo", wrong_answers: ["Joss Whedon", "James Gunn", "Taika Waititi"], category: "cinema", difficulty: 3 },
    { id: "c12", question_text: "Quel film raconte l'histoire du Titanic ?", correct_answer: "Titanic", wrong_answers: ["Poseidon", "Pearl Harbor", "Dunkerque"], category: "cinema", difficulty: 1 },
    { id: "c13", question_text: "Qui joue Thor dans les films Marvel ?", correct_answer: "Chris Hemsworth", wrong_answers: ["Chris Evans", "Chris Pratt", "Tom Hiddleston"], category: "cinema", difficulty: 1 },
    { id: "c14", question_text: "Quel film de Nolan parle de rêves ?", correct_answer: "Inception", wrong_answers: ["Interstellar", "Tenet", "Memento"], category: "cinema", difficulty: 2 },
    { id: "c15", question_text: "Quel studio a créé les films Shrek ?", correct_answer: "DreamWorks", wrong_answers: ["Pixar", "Disney", "Illumination"], category: "cinema", difficulty: 2 },
    { id: "c16", question_text: "Qui joue le rôle de Forrest Gump ?", correct_answer: "Tom Hanks", wrong_answers: ["Tom Cruise", "Leonardo DiCaprio", "Brad Pitt"], category: "cinema", difficulty: 2 },
    { id: "c17", question_text: "Quel film d'animation japonais parle d'une sorcière ?", correct_answer: "Kiki la petite sorcière", wrong_answers: ["Le Voyage de Chihiro", "Mon voisin Totoro", "Princesse Mononoké"], category: "cinema", difficulty: 3 },
    { id: "c18", question_text: "Qui est le méchant dans le premier film Avengers ?", correct_answer: "Loki", wrong_answers: ["Thanos", "Ultron", "Red Skull"], category: "cinema", difficulty: 2 },
    { id: "c19", question_text: "Quel acteur joue Neo dans Matrix ?", correct_answer: "Keanu Reeves", wrong_answers: ["Brad Pitt", "Tom Cruise", "Johnny Depp"], category: "cinema", difficulty: 2 },
    { id: "c20", question_text: "Quel film Disney raconte l'histoire de Raya ?", correct_answer: "Raya et le Dernier Dragon", wrong_answers: ["Vaiana", "Encanto", "Mulan"], category: "cinema", difficulty: 2 },
  ],
  musique: [
    { id: "m1", question_text: "Qui chante 'Shape of You' ?", correct_answer: "Ed Sheeran", wrong_answers: ["Justin Bieber", "Shawn Mendes", "Bruno Mars"], category: "musique", difficulty: 1 },
    { id: "m2", question_text: "Quel instrument a des touches noires et blanches ?", correct_answer: "Piano", wrong_answers: ["Guitare", "Violon", "Flûte"], category: "musique", difficulty: 1 },
    { id: "m3", question_text: "Qui est le 'Roi de la Pop' ?", correct_answer: "Michael Jackson", wrong_answers: ["Elvis Presley", "Prince", "Madonna"], category: "musique", difficulty: 1 },
    { id: "m4", question_text: "Quel groupe britannique a chanté 'Yellow' ?", correct_answer: "Coldplay", wrong_answers: ["Oasis", "Radiohead", "Muse"], category: "musique", difficulty: 2 },
    { id: "m5", question_text: "Qui a composé 'La Neuvième Symphonie' ?", correct_answer: "Beethoven", wrong_answers: ["Mozart", "Bach", "Chopin"], category: "musique", difficulty: 3 },
    { id: "m6", question_text: "Quel rappeur américain est surnommé 'Slim Shady' ?", correct_answer: "Eminem", wrong_answers: ["50 Cent", "Dr. Dre", "Snoop Dogg"], category: "musique", difficulty: 2 },
    { id: "m7", question_text: "Quel compositeur était sourd ?", correct_answer: "Beethoven", wrong_answers: ["Mozart", "Bach", "Vivaldi"], category: "musique", difficulty: 2 },
    { id: "m8", question_text: "Qui chante 'Despacito' ?", correct_answer: "Luis Fonsi", wrong_answers: ["Daddy Yankee", "J Balvin", "Bad Bunny"], category: "musique", difficulty: 2 },
    { id: "m9", question_text: "Quel groupe a chanté 'We Will Rock You' ?", correct_answer: "Queen", wrong_answers: ["AC/DC", "Kiss", "Guns N' Roses"], category: "musique", difficulty: 2 },
    { id: "m10", question_text: "Qui est le chanteur principal de Coldplay ?", correct_answer: "Chris Martin", wrong_answers: ["Bono", "Thom Yorke", "Matt Bellamy"], category: "musique", difficulty: 3 },
    { id: "m11", question_text: "Quel groupe a chanté 'Hey Jude' ?", correct_answer: "The Beatles", wrong_answers: ["The Rolling Stones", "Led Zeppelin", "Pink Floyd"], category: "musique", difficulty: 1 },
    { id: "m12", question_text: "Combien de cordes a une guitare classique ?", correct_answer: "6", wrong_answers: ["4", "5", "8"], category: "musique", difficulty: 1 },
    { id: "m13", question_text: "Qui chante 'Thriller' ?", correct_answer: "Michael Jackson", wrong_answers: ["Prince", "Madonna", "Whitney Houston"], category: "musique", difficulty: 1 },
    { id: "m14", question_text: "Quel artiste français chante 'Je t'aime' ?", correct_answer: "Serge Gainsbourg", wrong_answers: ["Charles Aznavour", "Jacques Brel", "Johnny Hallyday"], category: "musique", difficulty: 3 },
    { id: "m15", question_text: "Quel groupe a chanté 'Smells Like Teen Spirit' ?", correct_answer: "Nirvana", wrong_answers: ["Pearl Jam", "Soundgarden", "Alice in Chains"], category: "musique", difficulty: 2 },
    { id: "m16", question_text: "Qui est la chanteuse de 'Hello' (2015) ?", correct_answer: "Adele", wrong_answers: ["Beyoncé", "Rihanna", "Lady Gaga"], category: "musique", difficulty: 1 },
    { id: "m17", question_text: "Quel instrument utilise principalement un DJ ?", correct_answer: "Platines", wrong_answers: ["Guitare", "Batterie", "Saxophone"], category: "musique", difficulty: 1 },
    { id: "m18", question_text: "Quel rappeur français a chanté 'Sapés comme jamais' ?", correct_answer: "Maître Gims", wrong_answers: ["Booba", "Nekfeu", "PNL"], category: "musique", difficulty: 2 },
    { id: "m19", question_text: "Qui a composé 'La Flûte enchantée' ?", correct_answer: "Mozart", wrong_answers: ["Beethoven", "Bach", "Vivaldi"], category: "musique", difficulty: 3 },
    { id: "m20", question_text: "Quel groupe a chanté 'Stairway to Heaven' ?", correct_answer: "Led Zeppelin", wrong_answers: ["Pink Floyd", "The Who", "Deep Purple"], category: "musique", difficulty: 3 },
  ],
  technologie: [
    { id: "t1", question_text: "Quel est le moteur de recherche le plus utilisé ?", correct_answer: "Google", wrong_answers: ["Bing", "Yahoo", "DuckDuckGo"], category: "technologie", difficulty: 1 },
    { id: "t2", question_text: "Quelle entreprise fabrique l'iPhone ?", correct_answer: "Apple", wrong_answers: ["Samsung", "Google", "Microsoft"], category: "technologie", difficulty: 1 },
    { id: "t3", question_text: "Qui a fondé Facebook ?", correct_answer: "Mark Zuckerberg", wrong_answers: ["Elon Musk", "Jeff Bezos", "Bill Gates"], category: "technologie", difficulty: 1 },
    { id: "t4", question_text: "Quelle entreprise a créé Windows ?", correct_answer: "Microsoft", wrong_answers: ["Apple", "IBM", "Intel"], category: "technologie", difficulty: 1 },
    { id: "t5", question_text: "Qu'est-ce que l'IA ?", correct_answer: "Intelligence Artificielle", wrong_answers: ["Internet Avancé", "Interface Automatique", "Information Assistée"], category: "technologie", difficulty: 2 },
    { id: "t6", question_text: "Qui a créé Tesla ?", correct_answer: "Elon Musk", wrong_answers: ["Jeff Bezos", "Bill Gates", "Steve Jobs"], category: "technologie", difficulty: 2 },
    { id: "t7", question_text: "En quelle année le premier iPhone est-il sorti ?", correct_answer: "2007", wrong_answers: ["2005", "2009", "2010"], category: "technologie", difficulty: 3 },
    { id: "t8", question_text: "Quelle entreprise possède YouTube ?", correct_answer: "Google", wrong_answers: ["Facebook", "Amazon", "Microsoft"], category: "technologie", difficulty: 2 },
    { id: "t9", question_text: "Quelle est la monnaie virtuelle la plus connue ?", correct_answer: "Bitcoin", wrong_answers: ["Ethereum", "Dogecoin", "Litecoin"], category: "technologie", difficulty: 2 },
    { id: "t10", question_text: "Qui a créé Amazon ?", correct_answer: "Jeff Bezos", wrong_answers: ["Elon Musk", "Mark Zuckerberg", "Larry Page"], category: "technologie", difficulty: 2 },
    { id: "t11", question_text: "Quel réseau social utilise des tweets ?", correct_answer: "Twitter/X", wrong_answers: ["Facebook", "Instagram", "TikTok"], category: "technologie", difficulty: 1 },
    { id: "t12", question_text: "Quelle application permet de partager des photos ?", correct_answer: "Instagram", wrong_answers: ["WhatsApp", "LinkedIn", "Snapchat"], category: "technologie", difficulty: 1 },
    { id: "t13", question_text: "Qui a co-fondé Apple avec Steve Jobs ?", correct_answer: "Steve Wozniak", wrong_answers: ["Bill Gates", "Tim Cook", "Jony Ive"], category: "technologie", difficulty: 3 },
    { id: "t14", question_text: "Quel est le système d'exploitation de Google pour mobile ?", correct_answer: "Android", wrong_answers: ["iOS", "Windows Phone", "BlackBerry OS"], category: "technologie", difficulty: 1 },
    { id: "t15", question_text: "Quelle entreprise a créé ChatGPT ?", correct_answer: "OpenAI", wrong_answers: ["Google", "Microsoft", "Meta"], category: "technologie", difficulty: 2 },
    { id: "t16", question_text: "Quel est le nom du assistant vocal d'Apple ?", correct_answer: "Siri", wrong_answers: ["Alexa", "Google Assistant", "Cortana"], category: "technologie", difficulty: 1 },
    { id: "t17", question_text: "Quelle entreprise fabrique les processeurs Ryzen ?", correct_answer: "AMD", wrong_answers: ["Intel", "Nvidia", "Qualcomm"], category: "technologie", difficulty: 3 },
    { id: "t18", question_text: "Qu'est-ce que le Wi-Fi ?", correct_answer: "Réseau sans fil", wrong_answers: ["Câble internet", "Fibre optique", "4G"], category: "technologie", difficulty: 1 },
    { id: "t19", question_text: "Quelle plateforme est connue pour les vidéos courtes ?", correct_answer: "TikTok", wrong_answers: ["YouTube", "Vimeo", "Dailymotion"], category: "technologie", difficulty: 1 },
    { id: "t20", question_text: "Quel langage de programmation a été créé par Guido van Rossum ?", correct_answer: "Python", wrong_answers: ["Java", "JavaScript", "C++"], category: "technologie", difficulty: 4 },
  ],
  logo: [
    { id: "l1", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Apple", wrong_answers: ["Samsung", "Huawei", "LG"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png" },
    { id: "l2", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Nike", wrong_answers: ["Adidas", "Puma", "Reebok"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png" },
    { id: "l3", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "McDonald's", wrong_answers: ["Burger King", "KFC", "Subway"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/200px-McDonald%27s_Golden_Arches.svg.png" },
    { id: "l4", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Mercedes-Benz", wrong_answers: ["BMW", "Audi", "Volkswagen"], category: "logo", difficulty: 2, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png" },
    { id: "l5", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Adidas", wrong_answers: ["Nike", "Puma", "Under Armour"], category: "logo", difficulty: 2, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png" },
    { id: "l6", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Audi", wrong_answers: ["BMW", "Mercedes", "Volkswagen"], category: "logo", difficulty: 2, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/200px-Audi-Logo_2016.svg.png" },
    { id: "l7", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "BMW", wrong_answers: ["Mercedes", "Audi", "Volkswagen"], category: "logo", difficulty: 2, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png" },
    { id: "l8", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Ferrari", wrong_answers: ["Lamborghini", "Porsche", "Maserati"], category: "logo", difficulty: 3, image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Ferrari-Logo.svg/200px-Ferrari-Logo.svg.png" },
    { id: "l9", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Starbucks", wrong_answers: ["Costa Coffee", "Dunkin", "Peet's"], category: "logo", difficulty: 3, image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/200px-Starbucks_Corporation_Logo_2011.svg.png" },
    { id: "l10", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Porsche", wrong_answers: ["Ferrari", "Lamborghini", "Aston Martin"], category: "logo", difficulty: 3, image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Porsche_logo.svg/200px-Porsche_logo.svg.png" },
    { id: "l11", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Google", wrong_answers: ["Microsoft", "Apple", "Amazon"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png" },
    { id: "l12", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Amazon", wrong_answers: ["eBay", "Alibaba", "Walmart"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png" },
    { id: "l13", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Coca-Cola", wrong_answers: ["Pepsi", "Fanta", "Sprite"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/200px-Coca-Cola_logo.svg.png" },
    { id: "l14", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Toyota", wrong_answers: ["Honda", "Nissan", "Mazda"], category: "logo", difficulty: 2, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carance_logo.svg/200px-Toyota_carancy_logo.svg.png" },
    { id: "l15", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Netflix", wrong_answers: ["Disney+", "HBO Max", "Amazon Prime"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/200px-Netflix_2015_logo.svg.png" },
    { id: "l16", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "PlayStation", wrong_answers: ["Xbox", "Nintendo", "Sega"], category: "logo", difficulty: 2, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Playstation_logo_colour.svg/200px-Playstation_logo_colour.svg.png" },
    { id: "l17", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Spotify", wrong_answers: ["Apple Music", "Deezer", "Tidal"], category: "logo", difficulty: 2, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/200px-Spotify_logo_without_text.svg.png" },
    { id: "l18", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Instagram", wrong_answers: ["Facebook", "Snapchat", "TikTok"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/200px-Instagram_icon.png" },
    { id: "l19", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "Twitter/X", wrong_answers: ["Facebook", "LinkedIn", "Reddit"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/200px-Logo_of_Twitter.svg.png" },
    { id: "l20", question_text: "Quelle marque est représentée par ce logo ?", correct_answer: "YouTube", wrong_answers: ["Vimeo", "Dailymotion", "Twitch"], category: "logo", difficulty: 1, image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/200px-YouTube_full-color_icon_%282017%29.svg.png" },
  ],
};

interface Question {
  id: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: number;
  image_url?: string | null;
  image_credit?: string | null;
}

interface FormattedQuestion {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  imageUrl?: string | null;
  imageCredit?: string | null;
}

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circular Timer Component
function CircularTimer({
  timeRemaining,
  totalTime,
  questionNumber,
}: {
  timeRemaining: number;
  totalTime: number;
  questionNumber: number;
}) {
  const isLow = timeRemaining <= 5;
  const color = isLow ? COLORS.error : COLORS.primary;

  const SIZE = 100;
  const STROKE_WIDTH = 6;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const progress = useSharedValue(timeRemaining / totalTime);

  useEffect(() => {
    progress.value = withTiming(timeRemaining / totalTime, {
      duration: 300,
      easing: Easing.linear,
    });
  }, [timeRemaining, totalTime]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View className="relative items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      <View className="absolute items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <Text
          className="text-3xl font-black"
          style={{ color: isLow ? COLORS.error : COLORS.text }}
        >
          {timeRemaining}
        </Text>
        <Text className="text-xs font-bold" style={{ color: COLORS.textMuted }}>
          Q{questionNumber}/{QUESTIONS_PER_CATEGORY}
        </Text>
      </View>
    </View>
  );
}

// Answer Option Component
function AnswerOption({
  answer,
  index,
  onPress,
  disabled,
  isSelected,
  isCorrect,
  showResult,
}: {
  answer: string;
  index: number;
  onPress: () => void;
  disabled: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  showResult: boolean;
}) {
  let bgColor = COLORS.surface;
  let borderColor = "rgba(255,255,255,0.05)";
  let letterBgColor = "rgba(255,255,255,0.05)";
  let letterTextColor = COLORS.text;

  if (showResult) {
    if (isCorrect) {
      bgColor = COLORS.successDim;
      borderColor = COLORS.success;
      letterBgColor = COLORS.success;
      letterTextColor = COLORS.bg;
    } else if (isSelected && !isCorrect) {
      bgColor = COLORS.errorDim;
      borderColor = COLORS.error;
      letterBgColor = COLORS.error;
      letterTextColor = COLORS.bg;
    }
  } else if (isSelected) {
    bgColor = COLORS.surfaceActive;
    borderColor = `${COLORS.primary}50`;
    letterBgColor = COLORS.primary;
    letterTextColor = COLORS.bg;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="rounded-xl p-4 flex-row items-center gap-4 active:opacity-90"
      style={{
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center"
        style={{ backgroundColor: letterBgColor }}
      >
        <Text className="font-bold text-lg" style={{ color: letterTextColor }}>
          {LETTER_OPTIONS[index]}
        </Text>
      </View>
      <Text className="text-lg font-medium text-white/90 flex-1">{answer}</Text>
      {showResult && isCorrect && (
        <Text className="text-xl" style={{ color: COLORS.success }}>
          ✓
        </Text>
      )}
    </Pressable>
  );
}

export default function AdventurePlayScreen() {
  const { category, tier } = useLocalSearchParams<{ category: Category; tier: Tier }>();
  const { user, isPremium } = useAuth();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [errors, setErrors] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);

  const categoryInfo = getCategoryInfo(category as Category);
  const tierInfo = getTierInfo(tier as Tier);
  const currentQuestion = questions[currentIndex];

  // Format questions from DB format
  const formatQuestions = (dbQuestions: Question[]): FormattedQuestion[] => {
    return dbQuestions.map((q) => {
      const allAnswers = [q.correct_answer, ...q.wrong_answers];
      // Shuffle answers
      const shuffled = allAnswers.sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(q.correct_answer);

      return {
        id: q.id,
        question: q.question_text,
        answers: shuffled,
        correctIndex,
        imageUrl: q.image_url,
        imageCredit: q.image_credit,
      };
    });
  };

  // Load questions
  useEffect(() => {
    console.log("=== PLAY SCREEN MOUNTED ===");
    console.log("Category:", category);
    console.log("Tier:", tier);
    console.log("User:", user?.id || "guest");

    const loadQuestions = async () => {
      // Wait for params to be available
      if (!category || !tier) {
        console.log("Waiting for params... category:", category, "tier:", tier);
        return;
      }

      console.log("Loading questions for category:", category, "tier:", tier);
      setLoading(true);

      try {
        // Try to fetch from database if user exists
        if (user?.id) {
          console.log("Trying database for user:", user.id);
          const fetchedQuestions = await getAdventureQuestions(
            user.id,
            category as Category,
            tier as Tier,
            QUESTIONS_PER_CATEGORY
          );
          if (fetchedQuestions && fetchedQuestions.length > 0) {
            console.log("Got", fetchedQuestions.length, "questions from DB");
            const formatted = formatQuestions(fetchedQuestions);
            setQuestions(formatted);
            setLoading(false);
            return;
          }
          console.log("No questions from DB, using mock");
        }

        // Use mock questions as fallback (for guests or if DB fails)
        console.log("Using MOCK questions for category:", category);
        console.log("Available mock categories:", Object.keys(MOCK_QUESTIONS));
        const categoryQuestions = MOCK_QUESTIONS[category as string];
        console.log("Found mock questions:", categoryQuestions?.length || 0);

        if (categoryQuestions && categoryQuestions.length > 0) {
          const formatted = formatQuestions(categoryQuestions);
          console.log("Formatted questions:", formatted.length);
          setQuestions(formatted);
        } else {
          // Ultimate fallback
          console.log("No mock questions for category, using culture_generale");
          const fallbackQuestions = MOCK_QUESTIONS.culture_generale;
          const formatted = formatQuestions(fallbackQuestions);
          setQuestions(formatted);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        // Use mock questions as fallback
        const categoryQuestions = MOCK_QUESTIONS[category as string] || MOCK_QUESTIONS.culture_generale;
        const formatted = formatQuestions(categoryQuestions);
        setQuestions(formatted);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();

    return () => {
      mounted.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, category, tier]);

  // Timer
  useEffect(() => {
    if (loading || gameOver || showResult) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - count as error
          handleTimeout();
          return TIME_PER_QUESTION;
        }
        if (prev <= 5) playSound("tick");
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, gameOver, showResult, currentIndex]);

  const handleTimeout = () => {
    playSound("timeout");
    setShowResult(true);
    setErrors((prev) => prev + 1);
    checkGameEnd(errors + 1, correctCount);
  };

  const handleAnswer = (index: number) => {
    if (showResult || gameOver) return;

    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      playSound("correct");
      setCorrectCount((prev) => prev + 1);
    } else {
      playSound("wrong");
      setErrors((prev) => prev + 1);
    }

    // Mark question as seen
    if (user?.id && currentQuestion?.id) {
      markQuestionSeen(user.id, currentQuestion.id, isCorrect).catch(console.error);
    }

    checkGameEnd(isCorrect ? errors : errors + 1, isCorrect ? correctCount + 1 : correctCount);
  };

  const checkGameEnd = async (currentErrors: number, currentCorrect: number) => {
    // Check if failed (2+ errors)
    if (currentErrors > MAX_ERRORS_ALLOWED) {
      setGameOver(true);
      setSuccess(false);
      playSound("gameOver");
      // Use an attempt (local storage)
      if (!isPremium) {
        try {
          const today = new Date().toISOString().split("T")[0];
          const storedAttempts = await AsyncStorage.getItem(ATTEMPTS_KEY);
          const attempts = storedAttempts ? JSON.parse(storedAttempts) : { date: today, used: 0 };
          if (attempts.date === today) {
            attempts.used += 1;
          } else {
            attempts.date = today;
            attempts.used = 1;
          }
          await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
        } catch (e) {
          console.error("Error saving attempt:", e);
        }
      }
      return;
    }

    // Check if completed all questions
    if (currentIndex + 1 >= questions.length) {
      setGameOver(true);
      setSuccess(true);
      playSound("levelUp");
      // Mark category as completed (local storage)
      try {
        const storedProgress = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedProgress) {
          const progress: AdventureProgress = JSON.parse(storedProgress);

          // Add category to completed list
          if (!progress.completed_categories.includes(category as Category)) {
            progress.completed_categories.push(category as Category);
          }

          // Check if all categories are completed
          const allCategoriesCompleted = CATEGORIES.every(cat =>
            progress.completed_categories.includes(cat.code)
          );

          if (allCategoriesCompleted) {
            // Level up!
            const nextLevelInfo = getNextLevel(progress.tier, progress.level);
            if (nextLevelInfo) {
              progress.tier = nextLevelInfo.tier;
              progress.level = nextLevelInfo.level;
            }
            progress.completed_categories = [];
          }

          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        }
      } catch (e) {
        console.error("Error saving progress:", e);
      }
    }
  };

  const handleNext = () => {
    if (gameOver) {
      router.replace("/game/adventure");
      return;
    }

    setSelectedAnswer(null);
    setShowResult(false);
    setTimeRemaining(TIME_PER_QUESTION);
    setCurrentIndex((prev) => prev + 1);
    playSound("buttonPress");
  };

  const handleExit = () => {
    router.replace("/game/adventure");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted }} className="mt-4">
          Chargement des questions...
        </Text>
      </SafeAreaView>
    );
  }

  // No questions available
  if (!questions || questions.length === 0 || !currentQuestion) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.bg }}>
        <Text className="text-6xl mb-4">❌</Text>
        <Text className="text-white text-xl font-bold text-center mb-4">
          Aucune question disponible
        </Text>
        <Text style={{ color: COLORS.textMuted }} className="text-center mb-6">
          Catégorie: {category}
        </Text>
        <Pressable
          onPress={handleExit}
          className="px-8 py-4 rounded-2xl"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="font-bold" style={{ color: COLORS.bg }}>
            Retour
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Game Over Screen
  if (gameOver) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.bg }}>
        <Text className="text-6xl mb-4">{success ? "🎉" : "😔"}</Text>
        <Text className="text-white text-2xl font-black text-center mb-2">
          {success ? "CATÉGORIE VALIDÉE !" : "PERDU !"}
        </Text>
        <Text style={{ color: COLORS.textMuted }} className="text-center mb-6">
          {success
            ? `Tu as complété ${categoryInfo.nameFr} avec ${correctCount}/${questions.length} bonnes réponses !`
            : `Tu as fait ${errors} erreurs. Réessaie demain !`}
        </Text>

        {/* Stats */}
        <View className="flex-row gap-4 mb-8">
          <View
            className="items-center px-6 py-4 rounded-2xl"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-3xl mb-1">{categoryInfo.icon}</Text>
            <Text style={{ color: COLORS.textMuted }} className="text-xs">
              {categoryInfo.nameFr}
            </Text>
          </View>
          <View
            className="items-center px-6 py-4 rounded-2xl"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Text className="text-2xl font-black" style={{ color: success ? COLORS.success : COLORS.error }}>
              {correctCount}/{questions.length}
            </Text>
            <Text style={{ color: COLORS.textMuted }} className="text-xs">
              Bonnes réponses
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleExit}
          className="px-12 py-4 rounded-2xl"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
            Retour à la Montagne
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Pressable
          onPress={handleExit}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.surface }}
        >
          <Text className="text-white text-xl">×</Text>
        </Pressable>

        {/* Category Badge */}
        <View
          className="flex-row items-center px-4 py-2 rounded-full"
          style={{
            backgroundColor: `${categoryInfo.color}20`,
            borderWidth: 1,
            borderColor: `${categoryInfo.color}50`,
          }}
        >
          <Text className="text-xl mr-2">{categoryInfo.icon}</Text>
          <Text className="font-bold" style={{ color: categoryInfo.color }}>
            {categoryInfo.nameFr}
          </Text>
        </View>

        {/* Error Counter */}
        <View className="flex-row items-center">
          {[...Array(MAX_ERRORS_ALLOWED + 1)].map((_, i) => (
            <View
              key={i}
              className="w-4 h-4 rounded-full mx-0.5"
              style={{
                backgroundColor: i < errors ? COLORS.error : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </View>
      </View>

      {/* Timer */}
      <View className="items-center py-4">
        <CircularTimer
          timeRemaining={timeRemaining}
          totalTime={TIME_PER_QUESTION}
          questionNumber={currentIndex + 1}
        />
      </View>

      {/* Question Card */}
      <View className="px-6 mb-6">
        <View
          className="rounded-2xl p-6"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {currentQuestion?.imageUrl && (
            <Image
              source={{ uri: currentQuestion.imageUrl }}
              style={{ width: "100%", height: 140, borderRadius: 12, marginBottom: 16 }}
              resizeMode="cover"
            />
          )}
          <Text className="text-xl font-bold text-white">{currentQuestion?.question}</Text>
        </View>
      </View>

      {/* Answers */}
      <View className="px-6 gap-3">
        {currentQuestion?.answers.map((answer, index) => (
          <AnswerOption
            key={index}
            answer={answer}
            index={index}
            onPress={() => handleAnswer(index)}
            disabled={showResult}
            isSelected={selectedAnswer === index}
            isCorrect={index === currentQuestion.correctIndex}
            showResult={showResult}
          />
        ))}
      </View>

      {/* Next Button */}
      {showResult && !gameOver && (
        <View className="px-6 mt-6">
          <Pressable
            onPress={handleNext}
            className="py-4 rounded-2xl items-center"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="font-bold text-lg" style={{ color: COLORS.bg }}>
              Question suivante →
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
