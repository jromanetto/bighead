/**
 * Contenu SEO/GEO des pages `/quiz/$category` : intros uniques, stats réelles
 * tirées de la base (juin 2026), sous-thèmes, exemples de questions issus du
 * jeu et FAQ. Ce contenu est rendu en SSR — c'est lui qui transforme des
 * landing pages template en pages citables par Google et les moteurs IA.
 *
 * Les exemples de questions sont de VRAIES questions de la base (statiques par
 * design : les crawlers doivent revoir le même contenu à chaque passage).
 */

import type { Lang } from '#/lib/i18n/strings'

export interface SampleQuestion {
  question: string
  answer: string
  explanation: string
}

export interface FaqItem {
  q: string
  a: string
}

interface Localized<T> {
  fr: T
  en: T
}

export interface CategorySeoContent {
  /** Paragraphe d'intro unique (remplace la meta description recopiée). */
  intro: Localized<string>
  /** Compteurs réels (snapshot DB juin 2026) — affichés arrondis. */
  stats: { total: number; easy: number; medium: number; hard: number }
  /** Sous-thèmes couverts par la catégorie. */
  subtopics: Localized<string[]>
  /** Vraies questions du jeu, avec réponse et explication. */
  samples: Localized<SampleQuestion[]>
  /** Concept Wikipédia (pont entité pour le JSON-LD `about.sameAs`). */
  about: { name: string; wikipedia: string }
}

/** "1 876" → "1 800+" : chiffre stable face aux ajouts de questions. */
export function roundedCount(n: number): string {
  const floored = Math.floor(n / 100) * 100
  // Groupes de milliers avec espace insecable (U+00A0), sans toLocaleString
  // (sa sortie varie selon la version ICU : U+202F vs U+00A0).
  const grouped = String(floored).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
  return grouped + '+'
}

/**
 * FAQ d'une catégorie : 3 questions communes paramétrées (gratuit, volume,
 * langues) + 1 question spécifique dont la réponse reprend les sous-thèmes
 * uniques. Le texte est VISIBLE sur la page et repris tel quel en JSON-LD
 * FAQPage — jamais de markup fantôme.
 */
export function buildFaq(
  label: string,
  content: CategorySeoContent,
  lang: Lang,
): FaqItem[] {
  const count = roundedCount(content.stats.total)
  const topics = content.subtopics[lang].slice(0, 4).join(', ')
  if (lang === 'fr') {
    return [
      {
        q: `Le quiz ${label} est-il gratuit ?`,
        a: `Oui, le quiz ${label} BIGHEAD est 100 % gratuit et jouable directement dans le navigateur, sans compte ni paiement. Tu peux créer un profil gratuit pour sauvegarder ta progression et apparaître au classement mondial.`,
      },
      {
        q: `Combien de questions de ${label} y a-t-il ?`,
        a: `La catégorie ${label} compte ${count} questions, réparties sur trois niveaux de difficulté (facile, moyen, difficile). De nouvelles questions sont ajoutées régulièrement.`,
      },
      {
        q: `Quels thèmes le quiz ${label} couvre-t-il ?`,
        a: `Les questions couvrent notamment : ${topics}. Chaque bonne réponse est accompagnée d'une explication pour apprendre en jouant.`,
      },
      {
        q: `Peut-on jouer au quiz ${label} en anglais ou sur mobile ?`,
        a: `Oui. Toutes les questions existent en français et en anglais, et le jeu fonctionne dans le navigateur mobile. L'app BIGHEAD est aussi disponible sur iOS et Android avec duels et question du jour en notification.`,
      },
    ]
  }
  return [
    {
      q: `Is the ${label} quiz free?`,
      a: `Yes, the BIGHEAD ${label} quiz is 100% free and playable right in your browser, with no account or payment required. You can create a free profile to save your progress and join the global leaderboard.`,
    },
    {
      q: `How many ${label} questions are there?`,
      a: `The ${label} category has ${count} questions across three difficulty levels (easy, medium, hard). New questions are added regularly.`,
    },
    {
      q: `What topics does the ${label} quiz cover?`,
      a: `Questions cover topics such as: ${topics}. Every correct answer comes with a short explanation so you learn as you play.`,
    },
    {
      q: `Can I play the ${label} quiz in French or on mobile?`,
      a: `Yes. Every question exists in both English and French, and the game works in mobile browsers. The BIGHEAD app is also available on iOS and Android with duels and a daily question notification.`,
    },
  ]
}

export const CATEGORY_SEO: Record<string, CategorySeoContent> = {
  general: {
    intro: {
      fr: 'La culture générale, c’est le terrain de jeu ultime : mythologie, expressions, inventions, monnaies, records et curiosités du monde entier. Cette catégorie pioche dans tous les domaines pour tester l’étendue réelle de tes connaissances — pas seulement ce que tu as appris à l’école. Chaque question répondue correctement te donne une explication courte : tu ressors de chaque partie un peu moins ignorant et beaucoup plus accro.',
      en: 'General knowledge is the ultimate playground: mythology, idioms, inventions, currencies, records and curiosities from around the world. This category draws from every field to test the real breadth of what you know — not just what school taught you. Every correct answer comes with a short explanation, so you leave each game a little less ignorant and a lot more hooked.',
    },
    stats: { total: 2420, easy: 800, medium: 948, hard: 672 },
    subtopics: {
      fr: ['Mythologies grecque, nordique et égyptienne', 'Expressions et citations célèbres', 'Inventions et découvertes', 'Monnaies et symboles nationaux', 'Records du monde', 'Traditions et gastronomie'],
      en: ['Greek, Norse and Egyptian mythology', 'Famous idioms and quotes', 'Inventions and discoveries', 'Currencies and national symbols', 'World records', 'Traditions and food culture'],
    },
    samples: {
      fr: [
        { question: 'Quel est l’animal national de l’Australie ?', answer: 'Le kangourou', explanation: 'Le kangourou figure sur les armoiries de l’Australie avec l’émeu.' },
        { question: 'Qui a dit : « La liberté des uns s’arrête là où commence celle des autres » ?', answer: 'John Stuart Mill', explanation: 'Ce principe libéral est associé au philosophe britannique John Stuart Mill et à son essai « De la liberté » (1859).' },
        { question: 'Dans la mythologie nordique, quel dieu est associé au tonnerre ?', answer: 'Thor', explanation: 'Thor est le dieu nordique du tonnerre, fils d’Odin, reconnaissable à son marteau magique appelé Mjöllnir.' },
      ],
      en: [
        { question: 'Which animal is known as the "King of the Jungle"?', answer: 'The lion', explanation: 'Lions are called "King of the Jungle" despite primarily living in grasslands and savannas, not jungles.' },
        { question: 'Which country uses the shekel as its official currency?', answer: 'Israel', explanation: 'The Israeli new shekel has been the official currency of Israel since 1985, replacing the old shekel introduced in 1980.' },
        { question: 'Which Japanese manufacturer created the Skyline GT-R, an automotive culture icon?', answer: 'Nissan', explanation: 'The Nissan Skyline GT-R was launched in 1969 and became legendary thanks to its performance and advanced technology.' },
      ],
    },
    about: { name: 'Culture générale', wikipedia: 'https://fr.wikipedia.org/wiki/Culture_g%C3%A9n%C3%A9rale' },
  },

  history: {
    intro: {
      fr: 'De l’Égypte des pharaons à la chute du mur de Berlin, le quiz histoire balaye toutes les époques : Antiquité, Moyen Âge, révolutions, guerres mondiales et guerre froide. Dates clés, grands personnages, batailles décisives — chaque question est l’occasion de vérifier ce que tu crois savoir, et chaque réponse est expliquée en une phrase. Idéal pour réviser sans en avoir l’air, ou pour écraser tes amis en duel.',
      en: 'From the pharaohs of Egypt to the fall of the Berlin Wall, the history quiz spans every era: antiquity, the Middle Ages, revolutions, the world wars and the Cold War. Key dates, great figures, decisive battles — every question checks what you think you know, and every answer is explained in one sentence. Perfect for revising without noticing, or crushing your friends in a duel.',
    },
    stats: { total: 1876, easy: 850, medium: 399, hard: 627 },
    subtopics: {
      fr: ['Antiquité (Égypte, Grèce, Rome)', 'Moyen Âge et Renaissance', 'Révolution française et Napoléon', 'Guerres mondiales', 'Guerre froide et conquête spatiale', 'Histoire de France et du monde'],
      en: ['Antiquity (Egypt, Greece, Rome)', 'Middle Ages and Renaissance', 'French Revolution and Napoleon', 'World wars', 'Cold War and the space race', 'French and world history'],
    },
    samples: {
      fr: [
        { question: 'En quelle année Christophe Colomb a-t-il atteint les Bahamas ?', answer: '1492', explanation: 'Christophe Colomb a accosté aux Bahamas le 12 octobre 1492 lors de son premier voyage.' },
        { question: 'Quel général corse a mis fin à la Révolution française en prenant le pouvoir en 1799 ?', answer: 'Napoléon Bonaparte', explanation: 'Le coup d’État du 18 Brumaire an VIII permit à Napoléon de devenir Premier consul.' },
        { question: 'Quel est le nom du premier empereur de Chine qui a unifié le pays ?', answer: 'Qin Shi Huang', explanation: 'Qin Shi Huang a unifié la Chine en 221 av. J.-C. et commencé la Grande Muraille.' },
      ],
      en: [
        { question: 'What fortified line did France build between the two world wars?', answer: 'The Maginot Line', explanation: 'The Maginot Line, built in the 1930s, was designed to protect France from German invasion.' },
        { question: 'Which Western military organization was created in 1949 to counter the Soviet threat?', answer: 'NATO', explanation: 'The North Atlantic Treaty Organization was founded on April 4, 1949 by Western democracies to ensure their collective defense.' },
        { question: 'Which American president announced a space-based missile defense shield in 1983?', answer: 'Ronald Reagan', explanation: 'The Strategic Defense Initiative, nicknamed "Star Wars," was announced by Reagan in March 1983 and greatly alarmed the USSR.' },
      ],
    },
    about: { name: 'Histoire', wikipedia: 'https://fr.wikipedia.org/wiki/Histoire' },
  },

  geography: {
    intro: {
      fr: 'Capitales, fleuves, volcans, détroits et pays que tu serais bien incapable de placer sur une carte : le quiz géographie te fait voyager sans bouger. Des classiques (capitales d’Europe) aux pièges (quel fleuve traverse dix pays ?), les questions couvrent la géographie physique, politique et humaine du monde entier. Avec une explication à chaque réponse, c’est l’atlas le plus addictif que tu ouvriras cette année.',
      en: 'Capitals, rivers, volcanoes, straits and countries you could never place on a map: the geography quiz takes you travelling without moving. From classics (European capitals) to traps (which river crosses ten countries?), questions cover physical, political and human geography across the globe. With an explanation for every answer, it’s the most addictive atlas you’ll open this year.',
    },
    stats: { total: 2208, easy: 584, medium: 854, hard: 770 },
    subtopics: {
      fr: ['Capitales et drapeaux du monde', 'Fleuves, lacs et océans', 'Montagnes et volcans', 'Pays et frontières', 'Langues et populations', 'Géographie de la France'],
      en: ['World capitals and flags', 'Rivers, lakes and oceans', 'Mountains and volcanoes', 'Countries and borders', 'Languages and populations', 'Geography of France'],
    },
    samples: {
      fr: [
        { question: 'Quel fleuve traverse le plus de pays au monde ?', answer: 'Le Danube', explanation: 'Le Danube traverse ou borde 10 pays européens, de l’Allemagne à la Roumanie.' },
        { question: 'Quel pays est situé entre la Chine et la Russie en Asie centrale ?', answer: 'La Mongolie', explanation: 'La Mongolie est un vaste pays enclavé entre la Chine au sud et la Russie au nord.' },
        { question: 'Quel volcan célèbre se trouve près de Naples ?', answer: 'Le Vésuve', explanation: 'Le Vésuve a détruit Pompéi en 79 apr. J.-C. et reste un volcan actif dangereux.' },
      ],
      en: [
        { question: 'What mountain is the highest point in Japan?', answer: 'Mount Fuji', explanation: 'Mount Fuji stands at 3,776 m and is Japan’s most recognizable landmark.' },
        { question: 'What is the capital of Morocco?', answer: 'Rabat', explanation: 'Rabat has been Morocco’s administrative capital since 1912, though Casablanca is the largest city.' },
        { question: 'What is the largest country in Africa?', answer: 'Algeria', explanation: 'Algeria is the largest country in Africa at 2.38 million km², becoming first after South Sudan’s secession in 2011.' },
      ],
    },
    about: { name: 'Géographie', wikipedia: 'https://fr.wikipedia.org/wiki/G%C3%A9ographie' },
  },

  music: {
    intro: {
      fr: 'Du rap français aux légendes du rock, des festivals européens aux tubes planétaires : le quiz musique teste tes oreilles et ta mémoire. Artistes, albums cultes, festivals, instruments et histoire des genres — que tu sois plutôt Brassens, Thriller ou Diam’s, il y a des questions pour te faire vibrer et d’autres pour te faire transpirer. Chaque réponse vient avec son anecdote.',
      en: 'From French rap to rock legends, European festivals to global hits: the music quiz tests your ears and your memory. Artists, classic albums, festivals, instruments and the history of genres — whether you’re more Brassens, Thriller or The Clash, some questions will make you groove and others will make you sweat. Every answer comes with its own anecdote.',
    },
    stats: { total: 2158, easy: 928, medium: 745, hard: 485 },
    subtopics: {
      fr: ['Chanson française et rap', 'Rock, pop et musique électronique', 'Festivals et concerts mythiques', 'Albums et tubes cultes', 'Instruments et théorie', 'Histoire des genres musicaux'],
      en: ['French chanson and rap', 'Rock, pop and electronic music', 'Legendary festivals and concerts', 'Classic albums and hits', 'Instruments and theory', 'History of musical genres'],
    },
    samples: {
      fr: [
        { question: 'Quel rappeur français, originaire de Toulouse, est connu pour ses textes poétiques et son album « A » sorti en 2004 ?', answer: 'Diam’s', explanation: 'Diam’s a sorti l’album « A » en 2004 et s’est imposée comme une figure majeure du rap francophone.' },
        { question: 'Quel prix littéraire Georges Brassens a-t-il reçu de l’Académie française en 1967 ?', answer: 'Le Grand Prix de poésie', explanation: 'L’Académie française a décerné à Brassens son Grand Prix de poésie en 1967, reconnaissant la qualité littéraire de ses textes.' },
        { question: 'Dans quelle ville espagnole se déroule le festival Primavera Sound ?', answer: 'Barcelone', explanation: 'Le Primavera Sound est un festival de musique indépendante et alternative qui se tient chaque année à Barcelone depuis 2001.' },
      ],
      en: [
        { question: 'Which punk band released "London Calling"?', answer: 'The Clash', explanation: 'The Clash released "London Calling" in 1979, a double album blending punk, reggae, rockabilly and jazz influences.' },
        { question: 'What is the title of Michael Jackson’s 1982 album, one of the best-selling albums in history?', answer: 'Thriller', explanation: 'Thriller, released in 1982, is considered the best-selling album of all time, with over 66 million copies sold.' },
        { question: 'Which 1950s Jamaican radio station helped spread the American rhythm and blues that influenced ska?', answer: 'Radio Jamaica (RJR)', explanation: 'Radio Jamaica broadcast American rhythm and blues, which Jamaican musicians transformed to eventually create mento and then ska.' },
      ],
    },
    about: { name: 'Musique', wikipedia: 'https://fr.wikipedia.org/wiki/Musique' },
  },

  science: {
    intro: {
      fr: 'Physique, chimie, biologie, espace et mathématiques : le quiz sciences couvre tout ce qui explique le monde, de la mitose aux anneaux de Saturne. Les questions vont du niveau collège (combien de faces a un dé ?) aux pièges qui font douter les bacs +5. À chaque réponse, une explication d’une phrase remet les idées en place — la méthode la plus rapide pour réviser tes sciences sans rouvrir un manuel.',
      en: 'Physics, chemistry, biology, space and mathematics: the science quiz covers everything that explains the world, from mitosis to the rings of Saturn. Questions range from middle-school level (how many faces does a die have?) to traps that make graduates doubt themselves. Each answer comes with a one-sentence explanation — the fastest way to brush up your science without opening a textbook.',
    },
    stats: { total: 1972, easy: 733, medium: 464, hard: 775 },
    subtopics: {
      fr: ['Physique et chimie', 'Biologie et corps humain', 'Espace et astronomie', 'Mathématiques et logique', 'Grands scientifiques et découvertes', 'Sciences de la Terre'],
      en: ['Physics and chemistry', 'Biology and the human body', 'Space and astronomy', 'Mathematics and logic', 'Great scientists and discoveries', 'Earth sciences'],
    },
    samples: {
      fr: [
        { question: 'Quel est l’élément chimique le plus léger ?', answer: 'L’hydrogène', explanation: 'L’hydrogène, avec un numéro atomique de 1, est l’élément le plus léger et le plus abondant de l’univers.' },
        { question: 'Quel est le processus par lequel une cellule se divise en deux cellules filles identiques ?', answer: 'La mitose', explanation: 'La mitose est la division cellulaire qui produit deux cellules génétiquement identiques à la cellule mère.' },
        { question: 'Quel scientifique britannique a publié « De l’origine des espèces » en 1859 ?', answer: 'Charles Darwin', explanation: 'Charles Darwin y exposait sa théorie de la sélection naturelle, fondatrice de la biologie moderne.' },
      ],
      en: [
        { question: 'What is the scientific name for table salt?', answer: 'Sodium chloride (NaCl)', explanation: 'Table salt is sodium chloride, an ionic compound made of sodium and chloride ions in a crystal lattice.' },
        { question: 'What is the basic unit of heredity called?', answer: 'A gene', explanation: 'A gene is a segment of DNA that codes for a particular hereditary trait and serves as the fundamental unit of heredity.' },
        { question: 'Which planet is known for its rings?', answer: 'Saturn', explanation: 'Saturn is famous for its spectacular ring system made of ice and rock particles.' },
      ],
    },
    about: { name: 'Science', wikipedia: 'https://fr.wikipedia.org/wiki/Science' },
  },

  literature: {
    intro: {
      fr: 'Des contes de ton enfance aux prix Nobel, le quiz littérature parcourt les bibliothèques du monde entier : classiques français, sagas fantasy, science-fiction, polars et poésie. Sauras-tu retrouver l’auteur de Candide, le hobbit qui a trouvé l’Anneau avant Frodon ou la romancière derrière Hunger Games ? Chaque bonne réponse est accompagnée d’une explication — de quoi enrichir ta liste de lecture en jouant.',
      en: 'From childhood fairy tales to Nobel prizes, the literature quiz roams the world’s libraries: French classics, fantasy sagas, science fiction, crime novels and poetry. Can you name the author of Candide, the hobbit who found the Ring before Frodo, or the novelist behind The Hunger Games? Every correct answer comes with an explanation — a reading list that builds itself while you play.',
    },
    stats: { total: 2096, easy: 840, medium: 760, hard: 496 },
    subtopics: {
      fr: ['Classiques français (Voltaire, Hugo, Zola…)', 'Fantasy et science-fiction', 'Littérature jeunesse et contes', 'Romans policiers et thrillers', 'Poésie et théâtre', 'Prix littéraires et auteurs contemporains'],
      en: ['French classics (Voltaire, Hugo, Zola…)', 'Fantasy and science fiction', 'Children’s literature and fairy tales', 'Crime novels and thrillers', 'Poetry and drama', 'Literary prizes and contemporary authors'],
    },
    samples: {
      fr: [
        { question: 'Quel roman de Voltaire suit les aventures d’un jeune homme optimiste ?', answer: 'Candide', explanation: '« Candide ou l’Optimisme » (1759) est un conte philosophique satirisant l’optimisme de Leibniz.' },
        { question: 'Qui a écrit la saga « Hunger Games » ?', answer: 'Suzanne Collins', explanation: 'Suzanne Collins est l’auteure américaine de la trilogie dystopique Hunger Games, publiée à partir de 2008.' },
        { question: 'Quel est le nom de la fée dans « La Belle au bois dormant » ?', answer: 'La fée Carabosse', explanation: 'La fée Carabosse est la méchante fée qui jette un sort à la princesse.' },
      ],
      en: [
        { question: 'In Tolkien’s "The Lord of the Rings", which hobbit finds the One Ring before Frodo?', answer: 'Bilbo Baggins', explanation: 'Bilbo Baggins, Frodo’s uncle, finds the One Ring in the Misty Mountains during the journey recounted in "The Hobbit".' },
        { question: 'Which debut novel made F. Scott Fitzgerald famous in 1920?', answer: 'This Side of Paradise', explanation: '"This Side of Paradise", published in 1920, launched Fitzgerald as the voice of postwar American youth.' },
        { question: 'Which American author created the "Alex Cross" series?', answer: 'James Patterson', explanation: 'James Patterson introduced detective Alex Cross in "Along Came a Spider" in 1993, launching a hugely successful series.' },
      ],
    },
    about: { name: 'Littérature', wikipedia: 'https://fr.wikipedia.org/wiki/Litt%C3%A9rature' },
  },

  technology: {
    intro: {
      fr: 'Du premier octet à l’intelligence artificielle, le quiz technologie retrace l’histoire de l’informatique et questionne ton vocabulaire numérique : web, hardware, cybersécurité, IA et grandes entreprises de la tech. Qui a inventé le World Wide Web ? Combien de bits dans un octet ? Des fondamentaux aux dernières avancées quantiques, chaque réponse t’apprend quelque chose d’utile — ou au moins de quoi briller en réunion.',
      en: 'From the first byte to artificial intelligence, the technology quiz traces the history of computing and tests your digital vocabulary: the web, hardware, cybersecurity, AI and the giants of tech. Who invented the World Wide Web? How many bits in a byte? From the fundamentals to the latest quantum breakthroughs, every answer teaches you something useful — or at least something to shine with in meetings.',
    },
    stats: { total: 1927, easy: 824, medium: 555, hard: 548 },
    subtopics: {
      fr: ['Histoire de l’informatique et du web', 'Intelligence artificielle', 'Internet et réseaux', 'Cybersécurité', 'Hardware et gadgets', 'Grandes entreprises de la tech'],
      en: ['History of computing and the web', 'Artificial intelligence', 'Internet and networks', 'Cybersecurity', 'Hardware and gadgets', 'Big tech companies'],
    },
    samples: {
      fr: [
        { question: 'Quel est le nombre de bits dans un octet ?', answer: '8', explanation: 'Un octet (byte en anglais) est composé de 8 bits et peut représenter 256 valeurs différentes (0 à 255).' },
        { question: 'Quelle entreprise a développé AlphaGo, le programme ayant battu le champion du monde du jeu de go en 2016 ?', answer: 'DeepMind', explanation: 'DeepMind, filiale d’Alphabet (Google), a créé AlphaGo qui a vaincu Lee Sedol en 2016.' },
        { question: 'Quel est le principal avantage de la fibre optique par rapport au câble en cuivre ?', answer: 'Un débit beaucoup plus élevé', explanation: 'La fibre optique transmet des données par lumière, offrant des débits de plusieurs Gbps sur de longues distances avec peu de pertes.' },
      ],
      en: [
        { question: 'Who invented the World Wide Web in 1989?', answer: 'Tim Berners-Lee', explanation: 'Berners-Lee created the first web browser and web server.' },
        { question: 'Which platform is used for sharing source code?', answer: 'GitHub', explanation: 'GitHub, acquired by Microsoft in 2018, is the largest collaborative development platform.' },
        { question: 'What is the most popular search engine in the world?', answer: 'Google', explanation: 'Google handles over 90% of global search queries, processing approximately 8.5 billion searches per day.' },
      ],
    },
    about: { name: 'Technologie', wikipedia: 'https://fr.wikipedia.org/wiki/Technologie' },
  },

  animals: {
    intro: {
      fr: 'Avec plus de 3 000 questions, la catégorie animaux est la plus fournie du jeu : mammifères, reptiles, créatures des abysses, records du règne animal et espèces menacées. Sais-tu quel reptile possède une troisième paupière, ou pourquoi les lémuriens sont en danger ? Du dauphin à l’isopode géant, chaque question vient avec son explication — un vrai documentaire animalier, en plus interactif.',
      en: 'With more than 3,000 questions, animals is the biggest category in the game: mammals, reptiles, deep-sea creatures, animal-kingdom records and endangered species. Do you know which reptile has a third eyelid, or why lemurs are endangered? From dolphins to giant isopods, every question comes with its explanation — a wildlife documentary, only interactive.',
    },
    stats: { total: 3049, easy: 868, medium: 909, hard: 1272 },
    subtopics: {
      fr: ['Mammifères et oiseaux', 'Reptiles et amphibiens', 'Créatures marines et abysses', 'Insectes et invertébrés', 'Records du règne animal', 'Espèces menacées et conservation'],
      en: ['Mammals and birds', 'Reptiles and amphibians', 'Marine and deep-sea creatures', 'Insects and invertebrates', 'Animal kingdom records', 'Endangered species and conservation'],
    },
    samples: {
      fr: [
        { question: 'Quel animal marin est réputé pour son intelligence ?', answer: 'Le dauphin', explanation: 'Les dauphins sont parmi les animaux les plus intelligents, capables de communication complexe et d’utilisation d’outils.' },
        { question: 'Quel reptile possède une troisième paupière transparente appelée membrane nictitante ?', answer: 'Le crocodile', explanation: 'La membrane nictitante du crocodile protège ses yeux sous l’eau tout en lui permettant de voir ses proies.' },
        { question: 'Quel est l’animal endémique le plus menacé de Madagascar ?', answer: 'Le lémurien', explanation: 'Près de 95 % des espèces de lémuriens sont menacées d’extinction à cause de la déforestation à Madagascar.' },
      ],
      en: [
        { question: 'What layer beneath a polar bear’s skin protects it from extreme cold?', answer: 'A thick layer of fat', explanation: 'The polar bear has a layer of fat up to 11 cm thick that insulates it from the Arctic cold.' },
        { question: 'What is the main difference between alligators and crocodiles?', answer: 'The shape of their snout', explanation: 'Alligators have a wide, rounded U-shaped snout, while crocodiles have a narrower, pointed V-shaped snout.' },
        { question: 'What term describes frogs gathering in large numbers for spring reproduction?', answer: 'Breeding migration', explanation: 'Each spring, frogs migrate back to the ponds where they were born to reproduce in large numbers.' },
      ],
    },
    about: { name: 'Animal', wikipedia: 'https://fr.wikipedia.org/wiki/Animal' },
  },

  sport: {
    intro: {
      fr: 'Football, JO, Tour de France, Formule 1 : le quiz sport couvre les compétitions, les records et les légendes qui ont marqué l’histoire. Qui a remporté le marathon olympique pieds nus ? Combien de coureurs dans une équipe du Tour ? Des règles du jeu aux exploits mythiques, il y a de quoi départager les vrais connaisseurs des supporters du dimanche — et chaque réponse est expliquée.',
      en: 'Football, the Olympics, the Tour de France, Formula 1: the sport quiz covers the competitions, records and legends that made history. Who won the Olympic marathon barefoot? How many riders in a Tour de France team? From rules of the game to mythical feats, this is where real connoisseurs are separated from armchair fans — and every answer is explained.',
    },
    stats: { total: 1795, easy: 828, medium: 334, hard: 633 },
    subtopics: {
      fr: ['Football et coupes du monde', 'Jeux olympiques', 'Cyclisme et Tour de France', 'Sports mécaniques (F1, rallye)', 'Tennis, rugby et basket', 'Records et légendes du sport'],
      en: ['Football and World Cups', 'Olympic Games', 'Cycling and the Tour de France', 'Motorsport (F1, rally)', 'Tennis, rugby and basketball', 'Sports records and legends'],
    },
    samples: {
      fr: [
        { question: 'Quel athlète éthiopien a gagné le marathon olympique pieds nus en 1960 ?', answer: 'Abebe Bikila', explanation: 'Abebe Bikila a couru pieds nus sur les pavés de Rome et remporté le marathon olympique.' },
        { question: 'En quelle année a eu lieu le tout premier Tour de France ?', answer: '1903', explanation: 'La première édition du Tour de France a été organisée en 1903 à l’initiative du journal L’Auto.' },
        { question: 'Quel est le sport le plus populaire au monde ?', answer: 'Le football', explanation: 'Le football est pratiqué par plus de 250 millions de personnes dans le monde.' },
      ],
      en: [
        { question: 'Which French driver won four Formula 1 World Championship titles?', answer: 'Alain Prost', explanation: 'Alain Prost is the most successful French driver in Formula 1 history, with four World Championships.' },
        { question: 'How many riders typically make up a Tour de France team?', answer: '8', explanation: 'Each Tour de France team has fielded 8 riders since 2018, compared to 9 previously.' },
        { question: 'Which country hosted the 2019 Rugby World Cup?', answer: 'Japan', explanation: 'Japan was the first Asian country to host the Rugby World Cup, in 2019.' },
      ],
    },
    about: { name: 'Sport', wikipedia: 'https://fr.wikipedia.org/wiki/Sport' },
  },

  cinema: {
    intro: {
      fr: 'Du Parrain au Studio Ghibli, le quiz cinéma traverse un siècle de films : réalisateurs cultes, acteurs légendaires, répliques mythiques, animation et blockbusters. Qui incarnait Don Corleone ? Quel réalisateur suédois a signé « Persona » ? Que tu sois cinéphile pointu ou abonné aux soirées canapé, les questions s’adaptent à ton niveau et chaque réponse vient avec son anecdote de tournage ou d’histoire du cinéma.',
      en: 'From The Godfather to Studio Ghibli, the cinema quiz spans a century of film: cult directors, legendary actors, iconic lines, animation and blockbusters. Who played Don Corleone? Which Swedish director made "Persona"? Whether you’re a hardcore cinephile or a couch-night regular, the questions adapt to your level and every answer comes with a piece of film history.',
    },
    stats: { total: 2388, easy: 811, medium: 783, hard: 794 },
    subtopics: {
      fr: ['Films cultes et classiques', 'Réalisateurs et palmarès', 'Acteurs et actrices', 'Animation (Pixar, Ghibli…)', 'Cinéma français', 'Sagas et blockbusters'],
      en: ['Cult and classic films', 'Directors and awards', 'Actors and actresses', 'Animation (Pixar, Ghibli…)', 'French cinema', 'Franchises and blockbusters'],
    },
    samples: {
      fr: [
        { question: 'Quel acteur joue le Parrain dans le film de Francis Ford Coppola ?', answer: 'Marlon Brando', explanation: 'Marlon Brando incarne Don Vito Corleone dans Le Parrain (1972).' },
        { question: 'Quel est le nom du studio d’animation japonais fondé par Hayao Miyazaki et Isao Takahata en 1985 ?', answer: 'Studio Ghibli', explanation: 'Le Studio Ghibli est responsable de chefs-d’œuvre tels que Mon voisin Totoro et Le Voyage de Chihiro.' },
        { question: 'Quel réalisateur suédois est connu pour « Le Septième Sceau » et « Persona » ?', answer: 'Ingmar Bergman', explanation: 'Ingmar Bergman est considéré comme l’un des plus grands réalisateurs de l’histoire du cinéma.' },
      ],
      en: [
        { question: 'What is the name of the villain in "The Lion King"?', answer: 'Scar', explanation: 'Scar is the main antagonist in The Lion King (1994), Mufasa’s treacherous brother.' },
        { question: 'Which Japanese director is known for "Your Name" and "Suzume"?', answer: 'Makoto Shinkai', explanation: 'Makoto Shinkai is often called "the new Miyazaki" thanks to his visually stunning animated films.' },
        { question: 'Which French actor played the lead role in the "Taxi" film series?', answer: 'Samy Naceri', explanation: 'Samy Naceri plays Daniel, a Marseille taxi driver with extraordinary driving skills, in the Luc Besson production.' },
      ],
    },
    about: { name: 'Cinéma', wikipedia: 'https://fr.wikipedia.org/wiki/Cin%C3%A9ma' },
  },

  nature: {
    intro: {
      fr: 'Toundra, ouragans, aurores polaires et forêts primaires : le quiz nature explore les écosystèmes, les phénomènes naturels et les paysages les plus spectaculaires de la planète. Comment naît un arc-en-ciel ? Quelle est la plus grande zone humide du monde ? Entre science de la Terre et émerveillement, chaque question est expliquée — parfait pour les curieux qui aiment comprendre ce qu’ils admirent.',
      en: 'Tundra, hurricanes, polar auroras and primeval forests: the nature quiz explores ecosystems, natural phenomena and the planet’s most spectacular landscapes. How does a rainbow form? What is the world’s largest wetland? Between earth science and pure wonder, every question is explained — perfect for the curious who like to understand what they admire.',
    },
    stats: { total: 2138, easy: 957, medium: 782, hard: 399 },
    subtopics: {
      fr: ['Climats et phénomènes météo', 'Forêts, déserts et biomes', 'Plantes et photosynthèse', 'Montagnes, lacs et merveilles naturelles', 'Écosystèmes et biodiversité', 'Catastrophes naturelles'],
      en: ['Climates and weather phenomena', 'Forests, deserts and biomes', 'Plants and photosynthesis', 'Mountains, lakes and natural wonders', 'Ecosystems and biodiversity', 'Natural disasters'],
    },
    samples: {
      fr: [
        { question: 'Comment appelle-t-on la végétation rase et basse des régions polaires ?', answer: 'La toundra', explanation: 'La toundra est un biome froid avec des mousses, lichens et plantes naines, au-dessus du permafrost.' },
        { question: 'Quelle est la source d’énergie principale qui alimente un ouragan ?', answer: 'L’eau de mer chaude', explanation: 'Les ouragans puisent leur énergie dans l’évaporation de l’eau chaude de surface, d’au moins 26 °C.' },
        { question: 'Quel est le nom du plus grand marécage d’Amérique du Sud ?', answer: 'Le Pantanal', explanation: 'Le Pantanal au Brésil est la plus grande zone humide tropicale du monde, couvrant environ 150 000 km².' },
      ],
      en: [
        { question: 'What phenomenon makes colorful lights appear in the night sky over polar regions?', answer: 'The polar aurora', explanation: 'Polar auroras are caused by charged particles from the solar wind interacting with gases in Earth’s atmosphere.' },
        { question: 'What is the highest mountain in North America?', answer: 'Denali (Mount McKinley)', explanation: 'Denali in Alaska stands at 6,190 meters, the highest peak in North America.' },
        { question: 'What is the largest freshwater lake in the world by surface area?', answer: 'Lake Superior', explanation: 'Lake Superior covers about 82,100 square kilometers, making it the largest freshwater lake by area.' },
      ],
    },
    about: { name: 'Nature', wikipedia: 'https://fr.wikipedia.org/wiki/Nature' },
  },
}

/** Returns the SEO content for a category slug, or `undefined` when unknown. */
export function getCategorySeo(slug: string): CategorySeoContent | undefined {
  return CATEGORY_SEO[slug]
}
