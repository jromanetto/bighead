/**
 * Programmatic SEO theme pages — `/quiz/t/$slug`.
 *
 * Unlike `/quiz/$category` (the 11 broad DB categories), themes target the
 * long-tail "quiz <sujet précis>" queries people actually search in French
 * ("quiz drapeaux", "blind test années 80", "quiz Harry Potter"...). Each theme
 * is a self-contained SEO landing: unique FR/EN intro, real sample Q&A (crawlable
 * citable content), a FAQ mirrored into FAQPage JSON-LD, and a playable CTA that
 * loads the closest playable category in the Chain game.
 *
 * Themes deliberately do NOT reuse the category i18n strings — they own their
 * copy so we can scale to hundreds of pages from a generator without touching
 * the translation system. `playCategory` must be a valid slug from
 * `#/lib/game/categories` (the value accepted by the Chain RPC `p_category`).
 *
 * To add more themes at scale, generate new `ThemeContent` entries with the
 * `scripts/gen-quiz-themes.ts` helper (one LLM call per theme) and append here.
 */

import { SITE_URL } from '#/lib/funnel/appLinks'

import type { Lang } from '#/lib/i18n/strings'

export interface ThemeSample {
  question: string
  answer: string
  explanation: string
}

export interface ThemeQA {
  q: string
  a: string
}

export interface ThemeContent {
  /** URL slug under `/quiz/t/` — kebab-case, ASCII only. */
  slug: string
  emoji: string
  /** Valid category slug for the playable Chain quiz (closest match). */
  playCategory: string
  /** Wikipedia URL + entity name for the `about` JSON-LD. */
  aboutName: string
  aboutWikipedia: string
  label: Record<Lang, string>
  /** Document `<title>`. */
  title: Record<Lang, string>
  /** Meta description (~150 chars). */
  description: Record<Lang, string>
  /** 120-200 word unique intro shown under the H1. */
  intro: Record<Lang, string>
  subtopics: Record<Lang, string[]>
  samples: Record<Lang, ThemeSample[]>
  faq: Record<Lang, ThemeQA[]>
}

export const THEMES: readonly ThemeContent[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'drapeaux',
    emoji: '🚩',
    playCategory: 'geography',
    aboutName: 'Drapeau',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Drapeau',
    label: { fr: 'Drapeaux du monde', en: 'Flags of the World' },
    title: {
      fr: 'Quiz Drapeaux du monde — reconnais les 197 pays | BIGHEAD',
      en: 'World Flags Quiz — name all 197 countries | BIGHEAD',
    },
    description: {
      fr: 'Quiz drapeaux du monde gratuit : reconnais les drapeaux des pays d’Europe, d’Afrique, d’Asie et d’Amérique. Joue tout de suite dans ton navigateur.',
      en: 'Free world flags quiz: recognize the flags of Europe, Africa, Asia and the Americas. Play instantly in your browser.',
    },
    intro: {
      fr: "Tu crois reconnaître tous les drapeaux du monde ? Ce quiz drapeaux met ta géographie à l’épreuve : des grands classiques (France, Japon, Brésil) aux pièges qui trompent tout le monde (Tchad et Roumanie, Monaco et Indonésie, Mali et Sénégal). Plus de 190 pays, leurs couleurs, leurs symboles et l’histoire derrière chaque drapeau. Tu joues directement dans le navigateur, sans rien installer, en français ou en anglais. Idéal pour réviser avant un examen de géo, animer une soirée quiz ou juste prouver que tu connais ta planète par cœur. Chaque mauvaise réponse t’apprend quelque chose : pourquoi le Népal est le seul drapeau non rectangulaire, ce que cache le drapeau du Bhoutan, ou pourquoi tant de drapeaux africains partagent les mêmes couleurs panafricaines.",
      en: "Think you can name every flag in the world? This flags quiz tests your geography from the easy classics (France, Japan, Brazil) to the traps that fool everyone (Chad and Romania, Monaco and Indonesia, Mali and Senegal). Over 190 countries, their colours, their symbols and the story behind each flag. Play right in your browser, nothing to install, in French or English. Perfect to revise before a geography test, run a quiz night, or just prove you know the planet by heart.",
    },
    subtopics: {
      fr: ['Drapeaux d’Europe', 'Drapeaux d’Afrique', 'Drapeaux d’Asie', 'Drapeaux d’Amérique', 'Drapeaux qui se ressemblent', 'Symboles et emblèmes'],
      en: ['European flags', 'African flags', 'Asian flags', 'Flags of the Americas', 'Look-alike flags', 'Symbols and emblems'],
    },
    samples: {
      fr: [
        { question: 'Quel pays a un drapeau rouge avec un cercle blanc et une étoile rouge ?', answer: 'Aucun — attention au piège', explanation: 'Le Japon a un cercle rouge sur fond blanc ; le drapeau décrit n’existe pas, c’est le genre de piège qu’on glisse dans le quiz.' },
        { question: 'Quel est le seul drapeau national qui n’est pas rectangulaire ?', answer: 'Le Népal', explanation: 'Le Népal a un drapeau formé de deux fanions triangulaires superposés, unique au monde.' },
        { question: 'Quels pays partagent un drapeau rouge-jaune-vert horizontal très proche ?', answer: 'Le Mali, le Sénégal, le Cameroun…', explanation: 'Ce sont les couleurs panafricaines ; seuls les détails (étoile, emblème) permettent de les distinguer.' },
      ],
      en: [
        { question: 'Which is the only national flag that is not rectangular?', answer: 'Nepal', explanation: 'Nepal’s flag is made of two stacked triangular pennants, unique in the world.' },
        { question: 'Which two flags are famously almost identical?', answer: 'Chad and Romania', explanation: 'Blue-yellow-red vertical stripes — the shades differ by a hair, which is exactly why they trip people up.' },
        { question: 'Which flag shows a dragon?', answer: 'Bhutan', explanation: 'The Bhutanese flag features Druk, the Thunder Dragon, holding jewels.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz drapeaux est-il gratuit ?', a: 'Oui, totalement gratuit et sans compte obligatoire. Tu joues directement dans le navigateur.' },
        { q: 'Combien de drapeaux peut-on réviser ?', a: 'Le quiz couvre plus de 190 pays, des plus connus aux plus piégeux, répartis sur tous les continents.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, le quiz fonctionne sur téléphone, tablette et ordinateur. Une app iOS et Android existe aussi pour jouer hors-ligne et garder ta série.' },
      ],
      en: [
        { q: 'Is the flags quiz free?', a: 'Yes, completely free and no account required. Play straight in your browser.' },
        { q: 'How many flags can I practise?', a: 'The quiz covers 190+ countries across every continent, from the easy ones to the real traps.' },
        { q: 'Can I play on mobile?', a: 'Yes, it works on phone, tablet and desktop. There is also an iOS and Android app to play offline and keep your streak.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'capitales',
    emoji: '🌍',
    playCategory: 'geography',
    aboutName: 'Capitale',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Capitale',
    label: { fr: 'Capitales du monde', en: 'World Capitals' },
    title: {
      fr: 'Quiz Capitales du monde — connais-tu les 197 capitales ? | BIGHEAD',
      en: 'World Capitals Quiz — do you know all 197? | BIGHEAD',
    },
    description: {
      fr: 'Quiz capitales du monde gratuit : retrouve la capitale de chaque pays, d’Europe à l’Océanie. Des classiques aux pièges. Joue dans ton navigateur.',
      en: 'Free world capitals quiz: find the capital of every country, from Europe to Oceania. Play in your browser.',
    },
    intro: {
      fr: "Paris, Tokyo, Canberra… mais connais-tu la capitale du Kazakhstan, de l’Australie ou du Canada ? Ce quiz capitales du monde va vite séparer les amateurs des vrais géographes. Tu y retrouves les capitales évidentes et celles qui piègent tout le monde : non, la plus grande ville n’est pas toujours la capitale (Sydney n’est pas la capitale de l’Australie, Istanbul n’est pas celle de la Turquie). On couvre les cinq continents, les changements de capitale récents et les cas particuliers. Tout se joue dans le navigateur, en français ou en anglais, sans installation. Parfait pour réviser, te tester entre amis, ou enfin retenir une bonne fois pour toutes que la capitale du Brésil, c’est Brasília et pas Rio.",
      en: "Paris, Tokyo, Canberra… but do you know the capital of Kazakhstan, Australia or Canada? This world capitals quiz quickly separates the casual from the real geographers. It covers the obvious ones and the traps everyone gets wrong: the biggest city is not always the capital (Sydney is not Australia’s capital, Istanbul is not Turkey’s). Five continents, recent capital changes and edge cases, all playable in your browser, in French or English, nothing to install.",
    },
    subtopics: {
      fr: ['Capitales d’Europe', 'Capitales d’Afrique', 'Capitales d’Asie', 'Capitales d’Amérique', 'Capitales d’Océanie', 'Pièges classiques'],
      en: ['European capitals', 'African capitals', 'Asian capitals', 'Capitals of the Americas', 'Oceanian capitals', 'Classic traps'],
    },
    samples: {
      fr: [
        { question: 'Quelle est la capitale de l’Australie ?', answer: 'Canberra', explanation: 'Ni Sydney ni Melbourne : Canberra a été créée comme compromis entre les deux grandes villes rivales.' },
        { question: 'Quelle est la capitale du Canada ?', answer: 'Ottawa', explanation: 'Pas Toronto ni Montréal — Ottawa a été choisie par la reine Victoria en 1857.' },
        { question: 'Quelle est la capitale du Brésil ?', answer: 'Brasília', explanation: 'Construite de toutes pièces et inaugurée en 1960 pour déplacer le pouvoir vers l’intérieur du pays.' },
      ],
      en: [
        { question: 'What is the capital of Australia?', answer: 'Canberra', explanation: 'Neither Sydney nor Melbourne — Canberra was built as a compromise between the two rival cities.' },
        { question: 'What is the capital of Turkey?', answer: 'Ankara', explanation: 'Istanbul is the largest city, but Ankara became the capital in 1923.' },
        { question: 'What is the capital of Kazakhstan?', answer: 'Astana', explanation: 'Renamed a few times (Astana → Nur-Sultan → Astana again), a favourite quiz trap.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz capitales est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Quels continents sont couverts ?', a: 'Les cinq : Europe, Afrique, Asie, Amériques et Océanie, avec les pièges classiques où la capitale n’est pas la plus grande ville.' },
        { q: 'Y a-t-il une app mobile ?', a: 'Oui, une app iOS et Android pour jouer hors-ligne, recevoir le quiz du jour et garder ta série.' },
      ],
      en: [
        { q: 'Is the capitals quiz free?', a: 'Yes, free and no mandatory account, right in your browser.' },
        { q: 'Which continents are covered?', a: 'All five: Europe, Africa, Asia, the Americas and Oceania, including the classic traps where the capital is not the biggest city.' },
        { q: 'Is there a mobile app?', a: 'Yes, an iOS and Android app to play offline, get the daily quiz and keep your streak.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'blind-test-annees-80',
    emoji: '🎸',
    playCategory: 'music',
    aboutName: 'Années 1980 en musique',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Ann%C3%A9es_1980_en_musique',
    label: { fr: 'Blind test années 80', en: '80s Music Quiz' },
    title: {
      fr: 'Blind test années 80 — quiz musique de la décennie | BIGHEAD',
      en: '80s Music Quiz — test your decade knowledge | BIGHEAD',
    },
    description: {
      fr: 'Blind test années 80 : tubes, artistes et clips cultes de la décennie, de Michael Jackson à Madonna. Quiz musique gratuit, joue dans ton navigateur.',
      en: '80s music quiz: iconic hits, artists and videos of the decade, from Michael Jackson to Madonna. Free, play in your browser.',
    },
    intro: {
      fr: "Synthés, gros refrains et clips inoubliables : les années 80 restent la décennie reine du blind test. Ce quiz musique des années 80 passe en revue les tubes qui ont marqué l’époque, de « Billie Jean » de Michael Jackson à « Like a Prayer » de Madonna, en passant par Queen, Prince, les Eurythmics et la new wave française. Reconnais les artistes, les albums, les années de sortie et les anecdotes derrière les morceaux. Tout se joue dans le navigateur, sans installation, en français ou en anglais. Parfait pour une soirée entre amis, un apéro à thème ou réviser ta culture pop avant le prochain blind test. Et si tu sèches, chaque réponse t’apprend un détail à ressortir au bon moment.",
      en: "Synths, huge choruses and unforgettable videos: the 80s are still the king of music quizzes. This 80s music quiz runs through the hits that defined the decade, from Michael Jackson’s “Billie Jean” to Madonna’s “Like a Prayer”, plus Queen, Prince, the Eurythmics and more. Name the artists, the albums, the release years and the stories behind the tracks. Play in your browser, nothing to install, in French or English.",
    },
    subtopics: {
      fr: ['Tubes des années 80', 'Pop et new wave', 'Rock et hard rock 80s', 'Artistes mythiques', 'Albums cultes', 'One-hit wonders'],
      en: ['80s hit songs', 'Pop and new wave', '80s rock', 'Legendary artists', 'Iconic albums', 'One-hit wonders'],
    },
    samples: {
      fr: [
        { question: 'Quel album de Michael Jackson, sorti en 1982, est le plus vendu de tous les temps ?', answer: 'Thriller', explanation: 'Avec plus de 60 millions d’exemplaires, « Thriller » détient toujours le record absolu.' },
        { question: 'Quel groupe britannique chante « Sweet Dreams (Are Made of This) » en 1983 ?', answer: 'Eurythmics', explanation: 'Le duo Annie Lennox / Dave Stewart, emblème de la pop synthétique des 80s.' },
        { question: 'Quel artiste sort « Purple Rain » en 1984 ?', answer: 'Prince', explanation: 'À la fois album, film et tube, « Purple Rain » fait de Prince une superstar mondiale.' },
      ],
      en: [
        { question: 'Which 1982 Michael Jackson album is the best-selling of all time?', answer: 'Thriller', explanation: 'With 60+ million copies, “Thriller” still holds the all-time record.' },
        { question: 'Which British duo released “Sweet Dreams (Are Made of This)” in 1983?', answer: 'Eurythmics', explanation: 'Annie Lennox and Dave Stewart, an emblem of 80s synth-pop.' },
        { question: 'Who released “Purple Rain” in 1984?', answer: 'Prince', explanation: 'Album, film and hit single all at once, “Purple Rain” made Prince a global superstar.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le blind test années 80 est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, jouable directement dans le navigateur.' },
        { q: 'Faut-il du son pour jouer ?', a: 'Non : ce quiz se base sur les artistes, titres, albums et anecdotes — tu peux jouer même sans audio.' },
        { q: 'Y a-t-il d’autres décennies ?', a: 'BIGHEAD couvre largement la musique pop et rock ; lance le quiz musique pour piocher dans toutes les époques.' },
      ],
      en: [
        { q: 'Is the 80s music quiz free?', a: 'Yes, free and no account required, playable right in your browser.' },
        { q: 'Do I need sound to play?', a: 'No: the quiz is based on artists, titles, albums and trivia, so you can play even without audio.' },
        { q: 'Are other decades covered?', a: 'BIGHEAD covers pop and rock broadly; launch the music quiz to draw from every era.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'harry-potter',
    emoji: '🪄',
    playCategory: 'cinema',
    aboutName: 'Harry Potter',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Harry_Potter',
    label: { fr: 'Harry Potter', en: 'Harry Potter' },
    title: {
      fr: 'Quiz Harry Potter — testez vos connaissances sur la saga | BIGHEAD',
      en: 'Harry Potter Quiz — test your wizarding knowledge | BIGHEAD',
    },
    description: {
      fr: 'Quiz Harry Potter gratuit : sorts, maisons de Poudlard, personnages et films de la saga. Du facile à l’expert. Joue tout de suite dans ton navigateur.',
      en: 'Free Harry Potter quiz: spells, Hogwarts houses, characters and films. Easy to expert. Play instantly in your browser.',
    },
    intro: {
      fr: "Poufsouffle ou Serpentard, Expelliarmus ou Wingardium Leviosa : ce quiz Harry Potter sépare les fans du dimanche des vrais sorciers. Des sept livres aux huit films, on passe en revue les personnages, les sorts, les créatures, les maisons de Poudlard et les détails que seuls les vrais connaisseurs retiennent. Quel est le Patronus d’Hermione ? Qui a tué Dobby ? Combien de Horcruxes ? Tu joues directement dans le navigateur, sans rien installer, en français ou en anglais. Idéal pour une soirée entre fans, un quiz d’anniversaire sur le thème de la magie, ou juste vérifier que tu mérites ta place à Poudlard. Chaque réponse rappelle un détail de la saga, parfait pour briller au prochain marathon de films.",
      en: "Hufflepuff or Slytherin, Expelliarmus or Wingardium Leviosa: this Harry Potter quiz separates the casual fans from the real wizards. Across the seven books and eight films, it covers characters, spells, creatures, Hogwarts houses and the details only true fans remember. What is Hermione’s Patronus? Who killed Dobby? How many Horcruxes? Play right in your browser, nothing to install, in French or English.",
    },
    subtopics: {
      fr: ['Personnages', 'Sorts et formules', 'Maisons de Poudlard', 'Créatures magiques', 'Les films', 'Détails pour experts'],
      en: ['Characters', 'Spells and charms', 'Hogwarts houses', 'Magical creatures', 'The films', 'Expert-level details'],
    },
    samples: {
      fr: [
        { question: 'Quel est le Patronus d’Hermione Granger ?', answer: 'Une loutre', explanation: 'J. K. Rowling a expliqué que la loutre était son animal préféré.' },
        { question: 'Combien de Horcruxes Voldemort a-t-il créés volontairement ?', answer: 'Six', explanation: 'Six Horcruxes intentionnels ; Harry devient le septième par accident.' },
        { question: 'Quelle créature gardée par Hagrid a trois têtes ?', answer: 'Touffu (Fluffy)', explanation: 'Le chien à trois têtes qui garde la trappe vers la Pierre philosophale.' },
      ],
      en: [
        { question: 'What is Hermione Granger’s Patronus?', answer: 'An otter', explanation: 'J. K. Rowling said the otter was her favourite animal.' },
        { question: 'How many Horcruxes did Voldemort create on purpose?', answer: 'Six', explanation: 'Six intentional Horcruxes; Harry accidentally becomes the seventh.' },
        { question: 'Which three-headed creature does Hagrid own?', answer: 'Fluffy', explanation: 'The three-headed dog guarding the trapdoor to the Philosopher’s Stone.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz Harry Potter est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Couvre-t-il les livres et les films ?', a: 'Oui, les questions portent sur l’ensemble de la saga : les sept romans comme les huit films.' },
        { q: 'Quel niveau de difficulté ?', a: 'Du facile (maisons, sorts de base) jusqu’à l’expert (détails que seuls les vrais fans connaissent).' },
      ],
      en: [
        { q: 'Is the Harry Potter quiz free?', a: 'Yes, free and no mandatory account, right in your browser.' },
        { q: 'Does it cover the books and the films?', a: 'Yes, the questions span the whole saga: all seven novels and all eight films.' },
        { q: 'How hard is it?', a: 'From easy (houses, basic spells) up to expert (details only true fans know).' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'disney',
    emoji: '🏰',
    playCategory: 'cinema',
    aboutName: 'The Walt Disney Company',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Univers_de_Disney',
    label: { fr: 'Disney', en: 'Disney' },
    title: {
      fr: 'Quiz Disney — films, personnages et chansons | BIGHEAD',
      en: 'Disney Quiz — films, characters and songs | BIGHEAD',
    },
    description: {
      fr: 'Quiz Disney gratuit : classiques d’animation, princesses, Pixar, chansons cultes. Du Roi Lion à La Reine des Neiges. Joue dans ton navigateur.',
      en: 'Free Disney quiz: animated classics, princesses, Pixar, iconic songs. From The Lion King to Frozen. Play in your browser.',
    },
    intro: {
      fr: "Du Roi Lion à La Reine des Neiges, de Blanche-Neige à Toy Story : le quiz Disney réveille toute ton enfance. On passe en revue les grands classiques de l’animation, les princesses, l’univers Pixar, les méchants mythiques et les chansons que tout le monde connaît par cœur. Qui double tel personnage ? En quelle année sort tel film ? Quelle princesse pour quel royaume ? Tu joues directement dans le navigateur, sans installation, en français ou en anglais. Parfait en famille, pour un anniversaire sur le thème Disney ou une soirée nostalgie. Chaque réponse rappelle un détail des films, de quoi gagner le prochain quiz devant toute la tablée.",
      en: "From The Lion King to Frozen, from Snow White to Toy Story: the Disney quiz brings your whole childhood back. It covers the great animated classics, the princesses, the Pixar universe, the iconic villains and the songs everyone knows by heart. Who voices which character? What year did each film come out? Play right in your browser, nothing to install, in French or English.",
    },
    subtopics: {
      fr: ['Classiques d’animation', 'Princesses Disney', 'Univers Pixar', 'Méchants Disney', 'Chansons cultes', 'Dates et records'],
      en: ['Animated classics', 'Disney princesses', 'Pixar universe', 'Disney villains', 'Iconic songs', 'Dates and records'],
    },
    samples: {
      fr: [
        { question: 'En quelle année sort « Le Roi Lion » au cinéma ?', answer: '1994', explanation: 'Plus gros succès de l’animation Disney des années 90 à sa sortie.' },
        { question: 'Quelle est la sœur d’Elsa dans « La Reine des Neiges » ?', answer: 'Anna', explanation: 'C’est l’amour entre les deux sœurs, pas un prince, qui sauve la situation — un twist assumé du film.' },
        { question: 'Quel est le premier long-métrage d’animation des studios Pixar ?', answer: 'Toy Story', explanation: 'Sorti en 1995, c’est aussi le premier long-métrage entièrement en images de synthèse.' },
      ],
      en: [
        { question: 'What year was “The Lion King” released?', answer: '1994', explanation: 'The biggest Disney animated hit of the 90s on release.' },
        { question: 'Who is Elsa’s sister in “Frozen”?', answer: 'Anna', explanation: 'It is the love between the two sisters, not a prince, that saves the day.' },
        { question: 'What was Pixar’s first feature film?', answer: 'Toy Story', explanation: 'Released in 1995, also the first fully computer-animated feature film.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz Disney est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, jouable directement dans le navigateur.' },
        { q: 'Couvre-t-il Pixar ?', a: 'Oui, les classiques d’animation Disney comme l’univers Pixar (Toy Story, Là-haut, Vice-versa…).' },
        { q: 'C’est adapté aux enfants ?', a: 'Oui, le thème Disney est familial ; BIGHEAD propose aussi un mode adapté à l’âge dans l’app.' },
      ],
      en: [
        { q: 'Is the Disney quiz free?', a: 'Yes, free and no account required, playable right in your browser.' },
        { q: 'Does it cover Pixar?', a: 'Yes, both the Disney animated classics and the Pixar universe (Toy Story, Up, Inside Out…).' },
        { q: 'Is it kid-friendly?', a: 'Yes, the Disney theme is family-friendly; BIGHEAD also offers an age-tuned mode in the app.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'histoire-de-france',
    emoji: '⚜️',
    playCategory: 'history',
    aboutName: 'Histoire de France',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Histoire_de_France',
    label: { fr: 'Histoire de France', en: 'History of France' },
    title: { fr: 'Quiz Histoire de France — des Gaulois à la Ve République | BIGHEAD', en: 'History of France Quiz — Gauls to the Republic | BIGHEAD' },
    description: {
      fr: 'Quiz histoire de France gratuit : rois, révolution, Napoléon, guerres mondiales et dates clés. Du facile à l’expert, joue dans ton navigateur.',
      en: 'Free history of France quiz: kings, revolution, Napoleon, world wars and key dates. Play in your browser.',
    },
    intro: {
      fr: "De Vercingétorix à la Ve République, ce quiz histoire de France remonte le temps : le baptême de Clovis, le sacre de Charlemagne, la guerre de Cent Ans, 1789 et la prise de la Bastille, Napoléon, les deux guerres mondiales. Des grandes dates que tout le monde croit connaître aux détails qui font la différence (qui a vraiment dit « L’État, c’est moi » ? en quelle année exactement ?). Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Parfait pour réviser le brevet ou le bac, te tester en famille, ou enfin remettre les rois de France dans l’ordre. Chaque réponse rappelle le contexte, de quoi briller au prochain dîner.",
      en: "From Vercingetorix to the Fifth Republic, this history of France quiz travels through time: Clovis, Charlemagne, the Hundred Years’ War, 1789 and the storming of the Bastille, Napoleon, the two world wars. From the dates everyone thinks they know to the details that make the difference. Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Rois de France', 'Révolution française', 'Napoléon', 'Les deux guerres mondiales', 'Moyen Âge', 'Dates clés'],
      en: ['Kings of France', 'French Revolution', 'Napoleon', 'The two world wars', 'Middle Ages', 'Key dates'],
    },
    samples: {
      fr: [
        { question: 'En quelle année a lieu la prise de la Bastille ?', answer: '1789', explanation: 'Le 14 juillet 1789, point de départ symbolique de la Révolution française.' },
        { question: 'Quel roi est surnommé le « Roi-Soleil » ?', answer: 'Louis XIV', explanation: 'Son règne de 72 ans, le plus long de l’histoire de France, et le château de Versailles.' },
        { question: 'En quelle année Napoléon est-il sacré empereur ?', answer: '1804', explanation: 'Sacré à Notre-Dame de Paris ; il se couronne lui-même en présence du pape.' },
      ],
      en: [
        { question: 'In what year did the storming of the Bastille take place?', answer: '1789', explanation: '14 July 1789, the symbolic start of the French Revolution.' },
        { question: 'Which king is nicknamed the “Sun King”?', answer: 'Louis XIV', explanation: 'His 72-year reign, the longest in French history, and the Palace of Versailles.' },
        { question: 'In what year was Napoleon crowned emperor?', answer: '1804', explanation: 'Crowned at Notre-Dame de Paris; he placed the crown on his own head.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz histoire de France est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, jouable directement dans le navigateur.' },
        { q: 'Quelles périodes sont couvertes ?', a: 'De l’Antiquité gauloise à l’époque contemporaine : Moyen Âge, rois, Révolution, Empire, guerres mondiales.' },
        { q: 'C’est utile pour réviser ?', a: 'Oui, idéal pour réviser le brevet ou le bac d’histoire de façon ludique.' },
      ],
      en: [
        { q: 'Is the history of France quiz free?', a: 'Yes, free and no account required, playable right in your browser.' },
        { q: 'Which periods are covered?', a: 'From Gaulish antiquity to modern times: Middle Ages, kings, Revolution, Empire and world wars.' },
        { q: 'Is it good for revision?', a: 'Yes, a fun way to revise French history for school exams.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'mythologie-grecque',
    emoji: '⚡',
    playCategory: 'history',
    aboutName: 'Mythologie grecque',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Mythologie_grecque',
    label: { fr: 'Mythologie grecque', en: 'Greek Mythology' },
    title: { fr: 'Quiz Mythologie grecque — dieux, héros et créatures | BIGHEAD', en: 'Greek Mythology Quiz — gods, heroes and monsters | BIGHEAD' },
    description: {
      fr: 'Quiz mythologie grecque gratuit : dieux de l’Olympe, travaux d’Hercule, créatures et héros. Du facile à l’expert, joue dans ton navigateur.',
      en: 'Free Greek mythology quiz: Olympian gods, labours of Heracles, creatures and heroes. Play in your browser.',
    },
    intro: {
      fr: "Zeus, Athéna, Poséidon… mais sais-tu qui a ouvert la boîte de Pandore, combien de travaux a accomplis Hercule, ou ce que gardait Cerbère ? Ce quiz mythologie grecque te plonge chez les dieux de l’Olympe, les héros (Achille, Persée, Ulysse) et les créatures légendaires (Méduse, le Minotaure, l’Hydre). Des bases que tout le monde connaît aux détails qui séparent les vrais passionnés. Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Parfait pour réviser, prolonger ta passion pour Percy Jackson ou les jeux vidéo mythologiques, ou juste tester ta culture antique. Chaque réponse raconte le mythe derrière la question.",
      en: "Zeus, Athena, Poseidon… but do you know who opened Pandora’s box, how many labours Heracles completed, or what Cerberus guarded? This Greek mythology quiz takes you among the Olympian gods, the heroes (Achilles, Perseus, Odysseus) and the legendary creatures (Medusa, the Minotaur, the Hydra). Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Dieux de l’Olympe', 'Travaux d’Hercule', 'Héros légendaires', 'Créatures et monstres', 'Mythes fondateurs', 'L’Iliade et l’Odyssée'],
      en: ['Olympian gods', 'Labours of Heracles', 'Legendary heroes', 'Creatures and monsters', 'Founding myths', 'Iliad and Odyssey'],
    },
    samples: {
      fr: [
        { question: 'Combien de travaux Hercule doit-il accomplir ?', answer: 'Douze', explanation: 'Les douze travaux, du lion de Némée à la capture de Cerbère.' },
        { question: 'Quelle créature gardée aux Enfers a trois têtes ?', answer: 'Cerbère', explanation: 'Le chien à trois têtes qui empêche les morts de sortir des Enfers.' },
        { question: 'Quelle déesse est née tout armée de la tête de Zeus ?', answer: 'Athéna', explanation: 'Déesse de la sagesse et de la guerre stratégique, jaillie du crâne de Zeus.' },
      ],
      en: [
        { question: 'How many labours must Heracles complete?', answer: 'Twelve', explanation: 'The twelve labours, from the Nemean lion to capturing Cerberus.' },
        { question: 'Which three-headed creature guards the Underworld?', answer: 'Cerberus', explanation: 'The three-headed dog that stops the dead from leaving the Underworld.' },
        { question: 'Which goddess was born fully armed from Zeus’s head?', answer: 'Athena', explanation: 'Goddess of wisdom and strategic war, sprung from Zeus’s skull.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz mythologie grecque est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Faut-il être expert pour jouer ?', a: 'Non : du facile (les grands dieux) à l’expert (mythes et détails), il y en a pour tous les niveaux.' },
        { q: 'Couvre-t-il l’Iliade et l’Odyssée ?', a: 'Oui, les héros et épisodes de la guerre de Troie et du retour d’Ulysse font partie du quiz.' },
      ],
      en: [
        { q: 'Is the Greek mythology quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Do I need to be an expert?', a: 'No: from easy (the major gods) to expert (myths and details), there is a level for everyone.' },
        { q: 'Does it cover the Iliad and Odyssey?', a: 'Yes, the heroes and episodes of the Trojan War and Odysseus’ return are included.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'marvel',
    emoji: '🦸',
    playCategory: 'cinema',
    aboutName: 'Univers cinématographique Marvel',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Univers_cin%C3%A9matographique_Marvel',
    label: { fr: 'Marvel', en: 'Marvel' },
    title: { fr: 'Quiz Marvel — super-héros, films et MCU | BIGHEAD', en: 'Marvel Quiz — superheroes, films and the MCU | BIGHEAD' },
    description: {
      fr: 'Quiz Marvel gratuit : Avengers, X-Men, MCU, pouvoirs et identités secrètes. Du facile à l’expert. Joue tout de suite dans ton navigateur.',
      en: 'Free Marvel quiz: Avengers, X-Men, the MCU, powers and secret identities. Play instantly in your browser.',
    },
    intro: {
      fr: "Iron Man, Captain America, Thor, Spider-Man : ce quiz Marvel met ta connaissance de l’univers à l’épreuve. Des identités secrètes (qui se cache derrière le masque ?) aux Pierres d’Infinité, en passant par l’ordre des films du MCU et les répliques cultes. Tu connais le vrai nom de Black Widow ? Le métal du bouclier de Captain America ? Combien de Pierres d’Infinité ? Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Parfait avant une soirée marathon Avengers, pour départager les fans, ou juste prouver que tu as suivi depuis Iron Man en 2008. Chaque réponse glisse un détail à ressortir.",
      en: "Iron Man, Captain America, Thor, Spider-Man: this Marvel quiz tests your knowledge of the universe. From secret identities to the Infinity Stones, the order of the MCU films and the iconic lines. Do you know Black Widow’s real name? The metal of Captain America’s shield? How many Infinity Stones? Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Les Avengers', 'Identités secrètes', 'Méchants Marvel', 'Pierres d’Infinité', 'Ordre des films (MCU)', 'X-Men et mutants'],
      en: ['The Avengers', 'Secret identities', 'Marvel villains', 'Infinity Stones', 'MCU film order', 'X-Men and mutants'],
    },
    samples: {
      fr: [
        { question: 'Quelle est l’identité secrète d’Iron Man ?', answer: 'Tony Stark', explanation: 'Le génie milliardaire qui construit son armure, joué par Robert Downey Jr.' },
        { question: 'Combien de Pierres d’Infinité existe-t-il ?', answer: 'Six', explanation: 'Espace, Temps, Réalité, Pouvoir, Âme et Esprit — réunies par Thanos.' },
        { question: 'De quel métal est fait le bouclier de Captain America ?', answer: 'Le vibranium', explanation: 'Le métal quasi indestructible issu du Wakanda.' },
      ],
      en: [
        { question: 'What is Iron Man’s secret identity?', answer: 'Tony Stark', explanation: 'The billionaire genius who builds his suit, played by Robert Downey Jr.' },
        { question: 'How many Infinity Stones are there?', answer: 'Six', explanation: 'Space, Time, Reality, Power, Soul and Mind — gathered by Thanos.' },
        { question: 'What metal is Captain America’s shield made of?', answer: 'Vibranium', explanation: 'The nearly indestructible metal from Wakanda.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz Marvel est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Couvre-t-il les films et les comics ?', a: 'Surtout le MCU (les films) avec quelques clins d’œil aux comics d’origine.' },
        { q: 'Quel niveau de difficulté ?', a: 'Du facile (héros principaux) à l’expert (détails, répliques, chronologie).' },
      ],
      en: [
        { q: 'Is the Marvel quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Does it cover films and comics?', a: 'Mostly the MCU (the films) with a few nods to the original comics.' },
        { q: 'How hard is it?', a: 'From easy (main heroes) to expert (details, quotes, timeline).' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'star-wars',
    emoji: '🌌',
    playCategory: 'cinema',
    aboutName: 'Star Wars',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Star_Wars',
    label: { fr: 'Star Wars', en: 'Star Wars' },
    title: { fr: 'Quiz Star Wars — la saga, les Jedi et la Force | BIGHEAD', en: 'Star Wars Quiz — the saga, the Jedi and the Force | BIGHEAD' },
    description: {
      fr: 'Quiz Star Wars gratuit : Jedi, Sith, vaisseaux et répliques cultes de la saga. Du facile à l’expert. Joue dans ton navigateur.',
      en: 'Free Star Wars quiz: Jedi, Sith, ships and iconic lines from the saga. Play in your browser.',
    },
    intro: {
      fr: "Que la Force soit avec toi : ce quiz Star Wars passe en revue toute la galaxie, des Jedi aux Sith, de la trilogie originale aux dernières séries. Qui est vraiment le père de Luke ? Quel est le vaisseau de Han Solo ? Combien de temps Yoda a-t-il formé des Jedi ? Des bases connues de tous aux détails que seuls les vrais fans retiennent. Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Idéal avant un marathon des films, pour une soirée déguisée ou juste prouver que tu maîtrises la chronologie mieux que personne. Chaque réponse rappelle un moment de la saga.",
      en: "May the Force be with you: this Star Wars quiz covers the whole galaxy, from Jedi to Sith, the original trilogy to the latest series. Who is really Luke’s father? What is Han Solo’s ship? From the basics everyone knows to the details only true fans remember. Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Jedi et Sith', 'La Force et les sabres laser', 'Vaisseaux et droïdes', 'Personnages clés', 'Répliques cultes', 'Chronologie de la saga'],
      en: ['Jedi and Sith', 'The Force and lightsabers', 'Ships and droids', 'Key characters', 'Iconic quotes', 'Saga timeline'],
    },
    samples: {
      fr: [
        { question: 'Qui est le père de Luke Skywalker ?', answer: 'Dark Vador (Anakin Skywalker)', explanation: 'La révélation de « L’Empire contre-attaque » (1980), l’un des twists les plus célèbres du cinéma.' },
        { question: 'Comment s’appelle le vaisseau de Han Solo ?', answer: 'Le Faucon Millenium', explanation: 'Le vaisseau qui « a fait le raid de Kessel en moins de 12 parsecs ».' },
        { question: 'En quelle année sort le tout premier film Star Wars ?', answer: '1977', explanation: '« Un nouvel espoir » (épisode IV), réalisé par George Lucas.' },
      ],
      en: [
        { question: 'Who is Luke Skywalker’s father?', answer: 'Darth Vader (Anakin Skywalker)', explanation: 'The reveal from “The Empire Strikes Back” (1980), one of cinema’s most famous twists.' },
        { question: 'What is the name of Han Solo’s ship?', answer: 'The Millennium Falcon', explanation: 'The ship that “made the Kessel Run in less than 12 parsecs”.' },
        { question: 'What year did the first Star Wars film come out?', answer: '1977', explanation: '“A New Hope” (Episode IV), directed by George Lucas.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz Star Wars est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Couvre-t-il les séries (Mandalorian, etc.) ?', a: 'Surtout les films, avec des clins d’œil aux séries les plus connues.' },
        { q: 'Quel niveau de difficulté ?', a: 'Du facile (héros, vaisseaux) à l’expert (chronologie, répliques exactes).' },
      ],
      en: [
        { q: 'Is the Star Wars quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Does it cover the series (Mandalorian, etc.)?', a: 'Mostly the films, with nods to the best-known series.' },
        { q: 'How hard is it?', a: 'From easy (heroes, ships) to expert (timeline, exact quotes).' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'football',
    emoji: '⚽',
    playCategory: 'sport',
    aboutName: 'Football',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Football',
    label: { fr: 'Football', en: 'Football' },
    title: { fr: 'Quiz Football — joueurs, clubs et Coupe du Monde | BIGHEAD', en: 'Football Quiz — players, clubs and the World Cup | BIGHEAD' },
    description: {
      fr: 'Quiz football gratuit : joueurs, clubs, Coupe du Monde, Ligue des Champions et records. Du facile à l’expert. Joue dans ton navigateur.',
      en: 'Free football quiz: players, clubs, World Cup, Champions League and records. Play in your browser.',
    },
    intro: {
      fr: "Du Ballon d’Or à la Ligue des Champions, ce quiz football met ta culture du ballon rond à l’épreuve. Joueurs de légende, clubs mythiques, palmarès de la Coupe du Monde, records et anecdotes : des questions pour les supporters du dimanche comme pour les vrais passionnés. Quel pays a gagné le plus de Coupes du Monde ? Qui détient le record de buts ? Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Parfait pour l’apéro d’avant-match, départager les copains ou réviser avant le prochain grand tournoi. Chaque réponse glisse un fait à ressortir au stade.",
      en: "From the Ballon d’Or to the Champions League, this football quiz tests your knowledge of the beautiful game. Legendary players, iconic clubs, World Cup winners, records and trivia. Which country has won the most World Cups? Who holds the goal record? Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Coupe du Monde', 'Ligue des Champions', 'Joueurs de légende', 'Grands clubs', 'Records et chiffres', 'Règles du jeu'],
      en: ['World Cup', 'Champions League', 'Legendary players', 'Big clubs', 'Records and stats', 'Rules of the game'],
    },
    samples: {
      fr: [
        { question: 'Quel pays a remporté le plus de Coupes du Monde ?', answer: 'Le Brésil', explanation: 'Cinq titres (1958, 1962, 1970, 1994, 2002), record absolu.' },
        { question: 'Combien de joueurs une équipe aligne-t-elle sur le terrain ?', answer: '11', explanation: 'Onze joueurs, gardien compris.' },
        { question: 'Quel pays a gagné la Coupe du Monde 2018 ?', answer: 'La France', explanation: 'Victoire 4-2 contre la Croatie en finale, à Moscou.' },
      ],
      en: [
        { question: 'Which country has won the most World Cups?', answer: 'Brazil', explanation: 'Five titles (1958, 1962, 1970, 1994, 2002), the all-time record.' },
        { question: 'How many players does a team field on the pitch?', answer: '11', explanation: 'Eleven players, including the goalkeeper.' },
        { question: 'Which country won the 2018 World Cup?', answer: 'France', explanation: 'A 4-2 win over Croatia in the final, in Moscow.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz football est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Couvre-t-il les clubs et les sélections ?', a: 'Oui, des grands clubs européens aux sélections nationales et aux compétitions internationales.' },
        { q: 'Quel niveau de difficulté ?', a: 'Du facile (règles, grands champions) à l’expert (records, statistiques pointues).' },
      ],
      en: [
        { q: 'Is the football quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Does it cover clubs and national teams?', a: 'Yes, from the big European clubs to national teams and international competitions.' },
        { q: 'How hard is it?', a: 'From easy (rules, legends) to expert (records, deep stats).' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'jeux-olympiques',
    emoji: '🥇',
    playCategory: 'sport',
    aboutName: 'Jeux olympiques',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Jeux_olympiques',
    label: { fr: 'Jeux Olympiques', en: 'Olympic Games' },
    title: { fr: 'Quiz Jeux Olympiques — épreuves, records et histoire | BIGHEAD', en: 'Olympic Games Quiz — events, records and history | BIGHEAD' },
    description: {
      fr: 'Quiz Jeux Olympiques gratuit : épreuves, villes hôtes, records et symboles, de l’Antiquité à Paris 2024. Joue dans ton navigateur.',
      en: 'Free Olympic Games quiz: events, host cities, records and symbols, from antiquity to Paris 2024. Play in your browser.',
    },
    intro: {
      fr: "Les anneaux, la flamme, le serment olympique : ce quiz Jeux Olympiques retrace l’histoire des JO, de l’Antiquité grecque à Paris 2024. Villes hôtes, épreuves mythiques, athlètes de légende, records et symboles. Que représentent les cinq anneaux ? Tous les combien ont lieu les Jeux ? Des questions pour tous, des bases aux détails pointus. Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Parfait pour réviser avant les prochains Jeux, animer une soirée sport ou tester ta culture olympique. Chaque réponse rappelle un moment marquant de l’histoire des JO.",
      en: "The rings, the flame, the Olympic oath: this Olympic Games quiz traces the history of the Games from ancient Greece to Paris 2024. Host cities, iconic events, legendary athletes, records and symbols. What do the five rings represent? How often are the Games held? Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Villes hôtes', 'Épreuves et disciplines', 'Athlètes de légende', 'Records olympiques', 'Symboles et traditions', 'JO d’hiver'],
      en: ['Host cities', 'Events and disciplines', 'Legendary athletes', 'Olympic records', 'Symbols and traditions', 'Winter Olympics'],
    },
    samples: {
      fr: [
        { question: 'Tous les combien d’années ont lieu les Jeux Olympiques d’été ?', answer: 'Tous les 4 ans', explanation: 'Une olympiade dure quatre ans ; les Jeux d’hiver alternent au milieu de ce cycle.' },
        { question: 'Que représentent les cinq anneaux olympiques ?', answer: 'Les cinq continents', explanation: 'Cinq anneaux entrelacés pour les cinq continents et l’universalité du sport.' },
        { question: 'Dans quelle cité de la Grèce antique sont nés les Jeux ?', answer: 'Olympie', explanation: 'Les Jeux antiques s’y tenaient en l’honneur de Zeus, dès 776 av. J.-C.' },
      ],
      en: [
        { question: 'How often are the Summer Olympic Games held?', answer: 'Every 4 years', explanation: 'An Olympiad lasts four years; the Winter Games alternate within that cycle.' },
        { question: 'What do the five Olympic rings represent?', answer: 'The five continents', explanation: 'Five interlaced rings for the five continents and the universality of sport.' },
        { question: 'In which ancient Greek city did the Games originate?', answer: 'Olympia', explanation: 'The ancient Games were held there in honour of Zeus, from 776 BC.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz Jeux Olympiques est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Couvre-t-il les JO d’hiver ?', a: 'Oui, les Jeux d’été comme d’hiver, des épreuves aux athlètes marquants.' },
        { q: 'De quelle époque parle-t-on ?', a: 'De l’Antiquité grecque aux Jeux modernes, jusqu’aux éditions récentes comme Paris 2024.' },
      ],
      en: [
        { q: 'Is the Olympic Games quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Does it cover the Winter Olympics?', a: 'Yes, both Summer and Winter Games, from events to standout athletes.' },
        { q: 'What era does it cover?', a: 'From ancient Greece to the modern Games, up to recent editions like Paris 2024.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'corps-humain',
    emoji: '🫀',
    playCategory: 'science',
    aboutName: 'Corps humain',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Corps_humain',
    label: { fr: 'Corps humain', en: 'Human Body' },
    title: { fr: 'Quiz Corps humain — anatomie, organes et record | BIGHEAD', en: 'Human Body Quiz — anatomy, organs and records | BIGHEAD' },
    description: {
      fr: 'Quiz corps humain gratuit : os, organes, système nerveux et records de l’anatomie. Du facile à l’expert. Joue dans ton navigateur.',
      en: 'Free human body quiz: bones, organs, the nervous system and anatomy records. Play in your browser.',
    },
    intro: {
      fr: "Combien d’os dans le corps humain ? Quel est le plus grand organe ? À quoi servent les globules rouges ? Ce quiz corps humain teste tes connaissances en anatomie et en biologie : le squelette, les organes, la circulation, le cerveau et les records surprenants de la machine humaine. Des bases du collège aux détails qui étonnent. Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Parfait pour réviser les SVT, briller en famille ou simplement mieux comprendre ton propre corps. Chaque réponse explique le « pourquoi » derrière le fait.",
      en: "How many bones in the human body? What is the largest organ? What do red blood cells do? This human body quiz tests your anatomy and biology: the skeleton, organs, circulation, the brain and the surprising records of the human machine. Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Le squelette', 'Les organes', 'Le système nerveux', 'La circulation sanguine', 'Les sens', 'Records du corps'],
      en: ['The skeleton', 'The organs', 'The nervous system', 'Blood circulation', 'The senses', 'Body records'],
    },
    samples: {
      fr: [
        { question: 'Combien d’os compte le squelette d’un adulte ?', answer: '206', explanation: 'Un bébé en a environ 300 ; certains fusionnent en grandissant pour arriver à 206.' },
        { question: 'Quel est le plus grand organe du corps humain ?', answer: 'La peau', explanation: 'Souvent oubliée, la peau est bien un organe, et le plus étendu de tous.' },
        { question: 'Quel organe pompe le sang dans tout le corps ?', answer: 'Le cœur', explanation: 'Il bat environ 100 000 fois par jour.' },
      ],
      en: [
        { question: 'How many bones are in an adult skeleton?', answer: '206', explanation: 'A baby has about 300; some fuse during growth, leaving 206.' },
        { question: 'What is the largest organ in the human body?', answer: 'The skin', explanation: 'Often forgotten, the skin is indeed an organ, and the largest of all.' },
        { question: 'Which organ pumps blood around the body?', answer: 'The heart', explanation: 'It beats around 100,000 times a day.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz corps humain est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'C’est utile pour réviser les SVT ?', a: 'Oui, idéal pour réviser l’anatomie et la biologie de façon ludique.' },
        { q: 'Quel niveau de difficulté ?', a: 'Du facile (organes, os) à l’expert (physiologie, records anatomiques).' },
      ],
      en: [
        { q: 'Is the human body quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Is it good for biology revision?', a: 'Yes, a fun way to revise anatomy and biology.' },
        { q: 'How hard is it?', a: 'From easy (organs, bones) to expert (physiology, anatomy records).' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'systeme-solaire',
    emoji: '🪐',
    playCategory: 'science',
    aboutName: 'Système solaire',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Syst%C3%A8me_solaire',
    label: { fr: 'Système solaire', en: 'Solar System' },
    title: { fr: 'Quiz Système solaire — planètes, Soleil et espace | BIGHEAD', en: 'Solar System Quiz — planets, the Sun and space | BIGHEAD' },
    description: {
      fr: 'Quiz système solaire gratuit : planètes, Soleil, lunes et records de l’espace. Du facile à l’expert. Joue dans ton navigateur.',
      en: 'Free solar system quiz: planets, the Sun, moons and space records. Play in your browser.',
    },
    intro: {
      fr: "Combien de planètes dans le système solaire ? Laquelle est la plus grande ? Pourquoi Mars est-elle rouge ? Ce quiz système solaire t’emmène en voyage du Soleil jusqu’aux confins, de Mercure à Neptune, avec les lunes, les anneaux et les records de l’espace. Des bases que tout le monde croit connaître (Pluton est-elle encore une planète ?) aux détails d’astronome. Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Parfait pour réviser, nourrir ta passion pour l’espace ou tester ta famille. Chaque réponse explique le fait scientifique derrière la question.",
      en: "How many planets in the solar system? Which is the largest? Why is Mars red? This solar system quiz takes you on a trip from the Sun to the edges, from Mercury to Neptune, with the moons, the rings and the records of space. Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Les planètes', 'Le Soleil', 'Lunes et satellites', 'Astéroïdes et comètes', 'Exploration spatiale', 'Records de l’espace'],
      en: ['The planets', 'The Sun', 'Moons and satellites', 'Asteroids and comets', 'Space exploration', 'Space records'],
    },
    samples: {
      fr: [
        { question: 'Combien de planètes compte le système solaire ?', answer: 'Huit', explanation: 'Depuis 2006, Pluton est classée « planète naine », ce qui ramène le total à huit.' },
        { question: 'Quelle est la plus grande planète du système solaire ?', answer: 'Jupiter', explanation: 'Une géante gazeuse si grande que toutes les autres planètes y tiendraient.' },
        { question: 'Quelle planète est la plus proche du Soleil ?', answer: 'Mercure', explanation: 'La plus petite planète, et la plus rapide autour du Soleil.' },
      ],
      en: [
        { question: 'How many planets are in the solar system?', answer: 'Eight', explanation: 'Since 2006 Pluto is a “dwarf planet”, bringing the total to eight.' },
        { question: 'What is the largest planet in the solar system?', answer: 'Jupiter', explanation: 'A gas giant so large that all the other planets would fit inside it.' },
        { question: 'Which planet is closest to the Sun?', answer: 'Mercury', explanation: 'The smallest planet, and the fastest around the Sun.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz système solaire est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Parle-t-on de Pluton ?', a: 'Oui, et notamment de son reclassement en planète naine, un grand classique du quiz.' },
        { q: 'C’est adapté aux enfants ?', a: 'Oui, le thème de l’espace est familial ; BIGHEAD propose un mode adapté à l’âge dans l’app.' },
      ],
      en: [
        { q: 'Is the solar system quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Does it mention Pluto?', a: 'Yes, including its reclassification as a dwarf planet, a quiz classic.' },
        { q: 'Is it kid-friendly?', a: 'Yes, the space theme is family-friendly; BIGHEAD also offers an age-tuned mode in the app.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'dinosaures',
    emoji: '🦕',
    playCategory: 'nature',
    aboutName: 'Dinosaure',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Dinosaure',
    label: { fr: 'Dinosaures', en: 'Dinosaurs' },
    title: { fr: 'Quiz Dinosaures — espèces, ères et extinction | BIGHEAD', en: 'Dinosaurs Quiz — species, eras and extinction | BIGHEAD' },
    description: {
      fr: 'Quiz dinosaures gratuit : espèces, période géologique, carnivores et extinction. Du facile à l’expert. Joue dans ton navigateur.',
      en: 'Free dinosaurs quiz: species, geological period, carnivores and extinction. Play in your browser.',
    },
    intro: {
      fr: "T-Rex, Tricératops, Diplodocus : ce quiz dinosaures te ramène des millions d’années en arrière. Espèces célèbres, carnivores et herbivores, périodes géologiques (Jurassique, Crétacé) et la grande question : pourquoi ont-ils disparu ? Des bases que connaissent tous les enfants aux détails de paléontologue. Quand les dinosaures ont-ils disparu ? Lequel était le plus grand prédateur ? Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Parfait pour les passionnés, en famille ou pour réviser. Chaque réponse explique le fait derrière la question.",
      en: "T-Rex, Triceratops, Diplodocus: this dinosaurs quiz takes you back millions of years. Famous species, carnivores and herbivores, geological periods (Jurassic, Cretaceous) and the big question: why did they vanish? Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Espèces célèbres', 'Carnivores et herbivores', 'Périodes géologiques', 'L’extinction', 'Paléontologie', 'Records préhistoriques'],
      en: ['Famous species', 'Carnivores and herbivores', 'Geological periods', 'The extinction', 'Palaeontology', 'Prehistoric records'],
    },
    samples: {
      fr: [
        { question: 'Il y a combien de temps les dinosaures ont-ils disparu ?', answer: 'Environ 66 millions d’années', explanation: 'Une extinction massive, probablement liée à l’impact d’un astéroïde.' },
        { question: 'Que signifie le nom « Tyrannosaurus rex » ?', answer: 'Le roi des lézards tyrans', explanation: 'L’un des plus grands prédateurs terrestres ayant existé.' },
        { question: 'Quel dinosaure herbivore a trois cornes et une collerette ?', answer: 'Le Tricératops', explanation: 'Ses cornes et sa collerette osseuse lui servaient de défense.' },
      ],
      en: [
        { question: 'How long ago did the dinosaurs go extinct?', answer: 'About 66 million years', explanation: 'A mass extinction, most likely linked to an asteroid impact.' },
        { question: 'What does “Tyrannosaurus rex” mean?', answer: 'King of the tyrant lizards', explanation: 'One of the largest land predators that ever lived.' },
        { question: 'Which herbivore dinosaur has three horns and a frill?', answer: 'The Triceratops', explanation: 'Its horns and bony frill were used for defence.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz dinosaures est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'C’est adapté aux enfants ?', a: 'Oui, les dinosaures passionnent les enfants ; BIGHEAD propose un mode adapté à l’âge dans l’app.' },
        { q: 'Quel niveau de difficulté ?', a: 'Du facile (espèces célèbres) à l’expert (périodes, paléontologie).' },
      ],
      en: [
        { q: 'Is the dinosaurs quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Is it kid-friendly?', a: 'Yes, kids love dinosaurs; BIGHEAD also offers an age-tuned mode in the app.' },
        { q: 'How hard is it?', a: 'From easy (famous species) to expert (periods, palaeontology).' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'annees-90',
    emoji: '📼',
    playCategory: 'music',
    aboutName: 'Années 1990',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Ann%C3%A9es_1990',
    label: { fr: 'Années 90', en: 'The 90s' },
    title: { fr: 'Quiz années 90 — musique, séries et pop culture | BIGHEAD', en: '90s Quiz — music, TV and pop culture | BIGHEAD' },
    description: {
      fr: 'Quiz années 90 gratuit : musique, séries cultes, jeux et pop culture de la décennie. Joue tout de suite dans ton navigateur.',
      en: 'Free 90s quiz: music, cult TV, games and pop culture of the decade. Play instantly in your browser.',
    },
    intro: {
      fr: "Grunge, boys bands, Tamagotchi et premières consoles : les années 90 sont une mine de nostalgie. Ce quiz années 90 passe en revue la musique (Nirvana, Spice Girls, la naissance du rap français), les séries cultes, les jeux et les phénomènes pop de la décennie. Tu te souviens du groupe de « Smells Like Teen Spirit » ? Du jouet électronique qu’il fallait nourrir ? Tu joues directement dans le navigateur, gratuitement, en français ou en anglais. Parfait pour une soirée nostalgie, départager les trentenaires ou tester ta mémoire de la décennie. Chaque réponse réveille un souvenir.",
      en: "Grunge, boy bands, Tamagotchi and the first consoles: the 90s are a goldmine of nostalgia. This 90s quiz covers the music (Nirvana, Spice Girls), the cult TV, the games and the pop phenomena of the decade. Do you remember the band behind “Smells Like Teen Spirit”? Play in your browser, free, in French or English.",
    },
    subtopics: {
      fr: ['Musique des années 90', 'Séries cultes', 'Jeux et jouets', 'Cinéma des 90s', 'Pop culture', 'Technologie de l’époque'],
      en: ['90s music', 'Cult TV series', 'Games and toys', '90s cinema', 'Pop culture', 'Tech of the era'],
    },
    samples: {
      fr: [
        { question: 'Quel groupe chante « Smells Like Teen Spirit » en 1991 ?', answer: 'Nirvana', explanation: 'Le titre qui propulse le grunge et Kurt Cobain au sommet.' },
        { question: 'Quel jouet électronique fallait-il « nourrir » pour le garder en vie ?', answer: 'Le Tamagotchi', explanation: 'Phénomène mondial de la fin des années 90.' },
        { question: 'Quel groupe féminin britannique chante « Wannabe » en 1996 ?', answer: 'Les Spice Girls', explanation: 'Le « Girl Power » et l’un des plus gros tubes de la décennie.' },
      ],
      en: [
        { question: 'Which band sang “Smells Like Teen Spirit” in 1991?', answer: 'Nirvana', explanation: 'The track that pushed grunge and Kurt Cobain to the top.' },
        { question: 'Which electronic toy did you have to “feed” to keep it alive?', answer: 'The Tamagotchi', explanation: 'A global craze of the late 90s.' },
        { question: 'Which British girl group sang “Wannabe” in 1996?', answer: 'The Spice Girls', explanation: '“Girl Power” and one of the decade’s biggest hits.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz années 90 est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Couvre-t-il autre chose que la musique ?', a: 'Oui : séries, jeux, cinéma et phénomènes pop de la décennie, pas seulement la musique.' },
        { q: 'Faut-il avoir vécu les années 90 ?', a: 'Non, mais si tu les as vécues, la nostalgie est garantie.' },
      ],
      en: [
        { q: 'Is the 90s quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Does it cover more than music?', a: 'Yes: TV, games, cinema and pop phenomena of the decade, not just music.' },
        { q: 'Do I need to have lived through the 90s?', a: 'No, but if you did, the nostalgia is guaranteed.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'culture-generale',
    emoji: '🧠',
    playCategory: 'general',
    aboutName: 'Culture générale',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Culture_g%C3%A9n%C3%A9rale',
    label: { fr: 'Culture générale', en: 'General Knowledge' },
    title: {
      fr: 'Quiz Culture Générale — teste tes connaissances | BIGHEAD',
      en: 'General Knowledge Quiz — test yourself | BIGHEAD',
    },
    description: {
      fr: 'Quiz de culture générale gratuit : histoire, géographie, sciences, sport, cinéma… Des questions faciles aux pièges, joue tout de suite dans ton navigateur.',
      en: 'Free general knowledge quiz: history, geography, science, sport, cinema… From easy to tricky, play instantly in your browser.',
    },
    intro: {
      fr: "Le grand quiz de culture générale de BIGHEAD balaie tous les domaines : histoire, géographie, sciences, cinéma, sport, musique, art… De la question que tout le monde connaît (la capitale de la France) au piège qui départage les vrais cracks (la capitale de l’Australie, ce n’est ni Sydney ni Melbourne). Chaque partie mélange les thèmes et monte en difficulté, façon 10 faciles puis quelques costauds, pour que ça reste fun sans jamais être frustrant. Tu joues gratuitement dans le navigateur, sans installer quoi que ce soit, en français ou en anglais. Parfait pour t’entraîner avant un blind test entre amis, réviser en s’amusant, ou simplement voir jusqu’où va ta culture G. Et chaque réponse s’accompagne d’un petit fait à retenir : tu ressors du quiz un peu plus malin qu’en entrant.",
      en: "BIGHEAD’s big general knowledge quiz spans every field: history, geography, science, cinema, sport, music, art. From the question everyone knows (the capital of France) to the trap that sorts the real pros (Australia’s capital is neither Sydney nor Melbourne). Each round mixes topics and ramps up gently — a batch of easy ones, then a few tough ones — so it stays fun and never frustrating. Play free in your browser, nothing to install, in French or English. Perfect to warm up before a quiz night, revise the fun way, or just see how far your general knowledge goes.",
    },
    subtopics: {
      fr: ['Histoire', 'Géographie', 'Sciences', 'Cinéma & séries', 'Sport', 'Arts & musique'],
      en: ['History', 'Geography', 'Science', 'Cinema & TV', 'Sport', 'Arts & music'],
    },
    samples: {
      fr: [
        { question: 'Quelle est la capitale de l’Australie ?', answer: 'Canberra', explanation: 'Piège classique : ni Sydney ni Melbourne, mais Canberra, ville créée pour être capitale.' },
        { question: 'Qui a peint la Joconde ?', answer: 'Léonard de Vinci', explanation: 'Peinte au début du XVIᵉ siècle, elle est exposée au Louvre à Paris.' },
        { question: 'Combien de côtés a un hexagone ?', answer: 'Six', explanation: '« Hexa » vient du grec « six » — d’où le surnom de l’Hexagone pour la France.' },
      ],
      en: [
        { question: 'What is the capital of Australia?', answer: 'Canberra', explanation: 'Classic trap: not Sydney or Melbourne, but Canberra, a city built to be the capital.' },
        { question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci', explanation: 'Painted in the early 16th century, it hangs in the Louvre in Paris.' },
        { question: 'How many sides does a hexagon have?', answer: 'Six', explanation: '“Hexa” is Greek for six.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz de culture générale est-il gratuit ?', a: 'Oui, entièrement gratuit et sans compte obligatoire. Tu joues directement dans le navigateur.' },
        { q: 'Les questions sont-elles trop dures ?', a: 'Non : chaque partie commence par des questions faciles et monte progressivement, avec seulement quelques pièges à la fin.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur. Une app iOS et Android existe aussi pour jouer hors-ligne et garder ta série.' },
      ],
      en: [
        { q: 'Is the general knowledge quiz free?', a: 'Yes, completely free and no account required. Play straight in your browser.' },
        { q: 'Are the questions too hard?', a: 'No: each round starts easy and ramps up gently, with only a few traps at the end.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop. There is also an iOS and Android app to play offline and keep your streak.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'logos',
    emoji: '🏷️',
    playCategory: 'general',
    aboutName: 'Logotype',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Logotype',
    label: { fr: 'Logos de marques', en: 'Brand Logos' },
    title: {
      fr: 'Quiz Logos — reconnais les marques à leur logo | BIGHEAD',
      en: 'Logo Quiz — name the brand from its logo | BIGHEAD',
    },
    description: {
      fr: 'Quiz logos gratuit : reconnais les grandes marques (tech, auto, sport, food) à leur logo. Du plus évident au plus piégeux, joue dans ton navigateur.',
      en: 'Free logo quiz: recognize big brands (tech, cars, sport, food) from their logo. From obvious to tricky, play in your browser.',
    },
    intro: {
      fr: "On voit des milliers de logos par jour — mais saurais-tu les nommer sans le texte à côté ? Ce quiz logos te met au défi sur les marques les plus connues : tech (la pomme croquée, les quatre anneaux, la virgule), automobile, sport, alimentaire, luxe. Certains sont évidents, d’autres cachent une histoire surprenante : pourquoi Audi a quatre anneaux, ce que représente vraiment le swoosh de Nike, ou d’où vient le nom d’une marque à son symbole. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Idéal pour une soirée quiz, un défi entre collègues, ou juste tester ta mémoire visuelle. Chaque réponse t’apprend l’anecdote derrière le logo — de quoi briller à la prochaine pause café.",
      en: "We see thousands of logos a day — but could you name them without the text next to them? This logo quiz challenges you on the most famous brands: tech (the bitten apple, the four rings, the swoosh), cars, sport, food, luxury. Some are obvious, others hide a surprising story: why Audi has four rings, what Nike’s swoosh really means, or where a brand’s name comes from. Play free in your browser, no install, in French or English. Great for a quiz night, a challenge with colleagues, or just testing your visual memory.",
    },
    subtopics: {
      fr: ['Logos tech', 'Logos automobiles', 'Logos de sport', 'Logos food & boissons', 'Logos de luxe', 'Anecdotes de marques'],
      en: ['Tech logos', 'Car logos', 'Sport logos', 'Food & drink logos', 'Luxury logos', 'Brand trivia'],
    },
    samples: {
      fr: [
        { question: 'Quel constructeur automobile a quatre anneaux entrelacés ?', answer: 'Audi', explanation: 'Les 4 anneaux symbolisent la fusion de quatre marques en 1932 (Auto Union).' },
        { question: 'Quelle marque de sport a une simple virgule (« swoosh ») ?', answer: 'Nike', explanation: 'Le swoosh évoque l’aile de Niké, déesse grecque de la victoire.' },
        { question: 'Quelle marque tech a une pomme croquée ?', answer: 'Apple', explanation: 'La morsure sert surtout à ne pas confondre la pomme avec une cerise.' },
      ],
      en: [
        { question: 'Which carmaker uses four interlocking rings?', answer: 'Audi', explanation: 'The four rings mark the 1932 merger of four brands (Auto Union).' },
        { question: 'Which sport brand uses a simple “swoosh”?', answer: 'Nike', explanation: 'The swoosh evokes the wing of Nike, Greek goddess of victory.' },
        { question: 'Which tech brand has a bitten apple?', answer: 'Apple', explanation: 'The bite mainly stops the apple from looking like a cherry.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz logos est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Quelles marques sont couvertes ?', a: 'Tech, automobile, sport, alimentaire, luxe — des plus évidentes aux plus piégeuses.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the logo quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Which brands are covered?', a: 'Tech, cars, sport, food and luxury — from the obvious to the truly tricky.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'cinema',
    emoji: '🎬',
    playCategory: 'cinema',
    aboutName: 'Cinéma',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Cin%C3%A9ma',
    label: { fr: 'Cinéma', en: 'Cinema' },
    title: {
      fr: 'Quiz Cinéma — films, acteurs, répliques cultes | BIGHEAD',
      en: 'Cinema Quiz — films, actors, iconic lines | BIGHEAD',
    },
    description: {
      fr: 'Quiz cinéma gratuit : réalisateurs, acteurs, répliques cultes et grands classiques. Du blockbuster au film d’auteur, joue dans ton navigateur.',
      en: 'Free cinema quiz: directors, actors, iconic lines and classics. From blockbusters to arthouse, play in your browser.',
    },
    intro: {
      fr: "Combien de films peux-tu reconnaître à une réplique, un réalisateur ou un acteur ? Ce quiz cinéma passe en revue un siècle de septième art : blockbusters (Titanic, Star Wars, Le Seigneur des Anneaux), films cultes, réalisateurs mythiques (Tarantino, Spielberg, Nolan) et répliques que tout le monde cite… souvent de travers. Des questions faciles pour les amateurs aux détails qui piègent les cinéphiles. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour une soirée quiz spéciale ciné, réviser tes classiques ou régler un débat entre amis. Chaque réponse s’accompagne d’une anecdote de tournage ou d’un fait à retenir — de quoi voir tes films préférés autrement.",
      en: "How many films can you name from a line, a director or an actor? This cinema quiz covers a century of film: blockbusters (Titanic, Star Wars, The Lord of the Rings), cult classics, legendary directors (Tarantino, Spielberg, Nolan) and the lines everyone quotes… often wrong. From easy questions for casual fans to details that trap cinephiles. Play free in your browser, no install, in French or English. Perfect for a movie quiz night, revising the classics, or settling a debate with friends.",
    },
    subtopics: {
      fr: ['Réalisateurs cultes', 'Acteurs & actrices', 'Répliques célèbres', 'Sagas & franchises', 'Oscars & récompenses', 'Films d’animation'],
      en: ['Iconic directors', 'Actors & actresses', 'Famous lines', 'Sagas & franchises', 'Oscars & awards', 'Animated films'],
    },
    samples: {
      fr: [
        { question: 'Qui a réalisé Pulp Fiction ?', answer: 'Quentin Tarantino', explanation: 'Palme d’or à Cannes en 1994, le film relance la carrière de John Travolta.' },
        { question: 'De quel film vient la réplique « Je suis ton père » ?', answer: 'Star Wars, épisode V', explanation: 'La vraie réplique est « Non, je suis ton père » — l’une des plus mal citées du cinéma.' },
        { question: 'Quel acteur incarne Jack dans Titanic ?', answer: 'Leonardo DiCaprio', explanation: 'Le film de James Cameron (1997) a longtemps détenu le record du box-office mondial.' },
      ],
      en: [
        { question: 'Who directed Pulp Fiction?', answer: 'Quentin Tarantino', explanation: 'It won the Palme d’Or at Cannes in 1994 and revived John Travolta’s career.' },
        { question: 'Which film has the line “I am your father”?', answer: 'Star Wars: Episode V', explanation: 'The real line is “No, I am your father” — one of the most misquoted in cinema.' },
        { question: 'Which actor plays Jack in Titanic?', answer: 'Leonardo DiCaprio', explanation: 'James Cameron’s 1997 film long held the worldwide box-office record.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz cinéma est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Y a-t-il des spoilers ?', a: 'Non, les questions portent sur des faits connus (réalisateurs, répliques, casting), pas sur des fins de films.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the cinema quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Are there spoilers?', a: 'No, the questions are about known facts (directors, lines, cast), not film endings.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'animaux',
    emoji: '🐾',
    playCategory: 'animals',
    aboutName: 'Animal',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Animal',
    label: { fr: 'Animaux', en: 'Animals' },
    title: {
      fr: 'Quiz Animaux — records, espèces et faits étonnants | BIGHEAD',
      en: 'Animals Quiz — records, species and amazing facts | BIGHEAD',
    },
    description: {
      fr: 'Quiz animaux gratuit : records du monde animal, espèces, habitats et faits étonnants. Pour petits et grands, joue dans ton navigateur.',
      en: 'Free animals quiz: animal kingdom records, species, habitats and amazing facts. For all ages, play in your browser.',
    },
    intro: {
      fr: "Le monde animal est plein de records et de surprises : quel est l’animal le plus rapide, le plus grand, celui qui a trois cœurs ? Ce quiz animaux teste tes connaissances sur les mammifères, oiseaux, poissons, insectes et reptiles — leurs habitats, leurs comportements et les faits qui étonnent tout le monde. Des questions accessibles aux enfants aux détails qui piègent les passionnés de nature. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Idéal en famille, pour réviser les sciences en s’amusant, ou pour épater la galerie avec des faits improbables. Chaque réponse s’accompagne d’une explication : tu ressors du quiz avec quelques anecdotes à raconter.",
      en: "The animal kingdom is full of records and surprises: which animal is the fastest, the biggest, the one with three hearts? This animals quiz tests your knowledge of mammals, birds, fish, insects and reptiles — their habitats, behaviours and the facts that amaze everyone. From questions kids can answer to details that trap nature buffs. Play free in your browser, no install, in French or English. Great for the family, revising science the fun way, or wowing friends with unlikely facts.",
    },
    subtopics: {
      fr: ['Mammifères', 'Oiseaux', 'Océans & poissons', 'Insectes', 'Reptiles & amphibiens', 'Records du monde animal'],
      en: ['Mammals', 'Birds', 'Oceans & fish', 'Insects', 'Reptiles & amphibians', 'Animal world records'],
    },
    samples: {
      fr: [
        { question: 'Quel est l’animal terrestre le plus rapide ?', answer: 'Le guépard', explanation: 'Il atteint environ 110 km/h, mais seulement sur de très courtes distances.' },
        { question: 'Quel est le plus grand animal ayant jamais existé ?', answer: 'La baleine bleue', explanation: 'Jusqu’à 30 m de long — plus grande que n’importe quel dinosaure connu.' },
        { question: 'Combien de cœurs a une pieuvre ?', answer: 'Trois', explanation: 'Deux pompent le sang vers les branchies, un vers le reste du corps.' },
      ],
      en: [
        { question: 'What is the fastest land animal?', answer: 'The cheetah', explanation: 'It reaches about 110 km/h, but only over very short distances.' },
        { question: 'What is the largest animal that has ever lived?', answer: 'The blue whale', explanation: 'Up to 30 m long — bigger than any known dinosaur.' },
        { question: 'How many hearts does an octopus have?', answer: 'Three', explanation: 'Two pump blood to the gills, one to the rest of the body.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz animaux est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Est-ce adapté aux enfants ?', a: 'Oui, beaucoup de questions sont accessibles dès l’enfance, avec des faits simples à retenir.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the animals quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Is it suitable for kids?', a: 'Yes, many questions are child-friendly, with simple facts to remember.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'annees-2000',
    emoji: '📀',
    playCategory: 'music',
    aboutName: 'Années 2000',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Ann%C3%A9es_2000',
    label: { fr: 'Années 2000', en: 'The 2000s' },
    title: {
      fr: 'Quiz Années 2000 — musique, séries, tech de la déca | BIGHEAD',
      en: '2000s Quiz — music, TV and tech of the decade | BIGHEAD',
    },
    description: {
      fr: 'Quiz années 2000 gratuit : musique, séries, tech et pop culture de la décennie. Nostalgie garantie, joue dans ton navigateur.',
      en: 'Free 2000s quiz: music, TV shows, tech and pop culture of the decade. Pure nostalgia, play in your browser.',
    },
    intro: {
      fr: "iPod, MSN, clapets, Wii, Facebook naissant : les années 2000 ont une saveur bien à elles. Ce quiz années 2000 réveille tes souvenirs de la décennie — tubes qui passaient en boucle, séries cultes, gadgets tech, jeux vidéo et grands moments de pop culture. Des questions faciles pour ceux qui ont vécu l’époque aux détails qui piègent même les nostalgiques. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour une soirée rétro entre amis, un défi générationnel, ou juste replonger dans tes années collège-lycée. Chaque réponse rappelle un fait marquant : garanti, tu vas dire « ah oui, c’est vrai ! » plus d’une fois.",
      en: "iPod, MSN, flip phones, the Wii, a brand-new Facebook: the 2000s have a flavour all their own. This 2000s quiz revives your memories of the decade — the songs on repeat, cult TV shows, tech gadgets, video games and big pop-culture moments. From easy questions for those who lived it to details that trap even the nostalgic. Play free in your browser, no install, in French or English. Perfect for a retro night with friends, a generational challenge, or just diving back into your school years.",
    },
    subtopics: {
      fr: ['Tubes des années 2000', 'Séries cultes', 'Tech & gadgets', 'Jeux vidéo', 'Cinéma de la déca', 'Pop culture & web'],
      en: ['2000s hits', 'Cult TV shows', 'Tech & gadgets', 'Video games', 'Films of the decade', 'Pop culture & web'],
    },
    samples: {
      fr: [
        { question: 'Quel réseau social lancé en 2004 par Mark Zuckerberg ?', answer: 'Facebook', explanation: 'Né à Harvard, il devient mondial à la fin de la décennie.' },
        { question: 'Quelle console Nintendo à détection de mouvement sort en 2006 ?', answer: 'La Wii', explanation: 'Sa manette (Wiimote) a fait jouer toute la famille debout dans le salon.' },
        { question: 'Quelle chanteuse sort le tube « Umbrella » en 2007 ?', answer: 'Rihanna', explanation: 'Le « ella-ella » est resté dans toutes les têtes cet été-là.' },
      ],
      en: [
        { question: 'Which social network did Mark Zuckerberg launch in 2004?', answer: 'Facebook', explanation: 'Born at Harvard, it went global by the end of the decade.' },
        { question: 'Which motion-controlled Nintendo console launched in 2006?', answer: 'The Wii', explanation: 'Its Wiimote got whole families playing on their feet in the living room.' },
        { question: 'Which singer released the hit “Umbrella” in 2007?', answer: 'Rihanna', explanation: 'The “ella-ella” hook was everywhere that summer.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz années 2000 est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Faut-il avoir vécu les années 2000 ?', a: 'Non, mais la nostalgie aide ! Les questions vont des tubes grand public aux détails plus pointus.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the 2000s quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Do I need to have lived through the 2000s?', a: 'No, but nostalgia helps! Questions range from mainstream hits to deeper cuts.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'rois-de-france',
    emoji: '👑',
    playCategory: 'history',
    aboutName: 'Liste des monarques de France',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Liste_des_monarques_de_France',
    label: { fr: 'Rois de France', en: 'Kings of France' },
    title: {
      fr: 'Quiz Rois de France — de Clovis à Louis-Philippe | BIGHEAD',
      en: 'Kings of France Quiz — from Clovis to Louis-Philippe | BIGHEAD',
    },
    description: {
      fr: 'Quiz rois de France gratuit : dynasties, règnes, surnoms et grands événements. De Clovis à Louis-Philippe, joue dans ton navigateur.',
      en: 'Free Kings of France quiz: dynasties, reigns, nicknames and key events. From Clovis to Louis-Philippe, play in your browser.',
    },
    intro: {
      fr: "Des Mérovingiens à la Monarchie de Juillet, quinze siècles de rois ont façonné la France. Ce quiz rois de France teste tes connaissances sur les grandes dynasties (Capétiens, Valois, Bourbons), les surnoms restés célèbres (le Roi-Soleil, le Bien-Aimé), les règnes marquants et les événements qui ont fait basculer l’Histoire. Des questions accessibles pour réviser à celles qui piègent les passionnés d’histoire. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour réviser le programme d’histoire, préparer un contrôle ou juste combler les trous de la frise chronologique. Chaque réponse s’accompagne d’un repère daté — de quoi remettre les rois dans l’ordre une bonne fois pour toutes.",
      en: "From the Merovingians to the July Monarchy, fifteen centuries of kings shaped France. This Kings of France quiz tests your knowledge of the great dynasties (Capetians, Valois, Bourbons), the famous nicknames (the Sun King, the Beloved), the landmark reigns and the events that turned history. From accessible revision questions to ones that trap history buffs. Play free in your browser, no install, in French or English. Perfect to revise your history syllabus, prep for a test, or just fill the gaps in the timeline.",
    },
    subtopics: {
      fr: ['Mérovingiens & Carolingiens', 'Les Capétiens', 'Valois & guerre de Cent Ans', 'Bourbons & Ancien Régime', 'Surnoms des rois', 'Grands événements'],
      en: ['Merovingians & Carolingians', 'The Capetians', 'Valois & Hundred Years’ War', 'Bourbons & Ancien Régime', 'Royal nicknames', 'Key events'],
    },
    samples: {
      fr: [
        { question: 'Quel roi est surnommé le « Roi-Soleil » ?', answer: 'Louis XIV', explanation: 'Son règne de 72 ans est le plus long de l’histoire de France.' },
        { question: 'Quel roi signe l’édit de Nantes en 1598 ?', answer: 'Henri IV', explanation: 'L’édit accorde une tolérance religieuse aux protestants et met fin aux guerres de Religion.' },
        { question: 'Qui est le dernier roi des Français ?', answer: 'Louis-Philippe Iᵉʳ', explanation: 'Renversé par la révolution de 1848 ; après lui, la France devient une république (puis un empire).' },
      ],
      en: [
        { question: 'Which king is nicknamed the “Sun King”?', answer: 'Louis XIV', explanation: 'His 72-year reign is the longest in French history.' },
        { question: 'Which king signed the Edict of Nantes in 1598?', answer: 'Henry IV', explanation: 'It granted religious tolerance to Protestants and ended the Wars of Religion.' },
        { question: 'Who was the last King of the French?', answer: 'Louis-Philippe I', explanation: 'Overthrown by the 1848 revolution; France then became a republic (later an empire).' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz rois de France est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Est-ce utile pour réviser l’histoire ?', a: 'Oui, il couvre les dynasties et les grands règnes au programme, avec un repère daté à chaque réponse.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the Kings of France quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Is it useful for revising history?', a: 'Yes, it covers the dynasties and major reigns on the syllabus, with a dated marker on each answer.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'geographie',
    emoji: '🗺️',
    playCategory: 'geography',
    aboutName: 'Géographie',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/G%C3%A9ographie',
    label: { fr: 'Géographie', en: 'Geography' },
    title: {
      fr: 'Quiz Géographie — pays, capitales, reliefs du monde | BIGHEAD',
      en: 'Geography Quiz — countries, capitals, landforms | BIGHEAD',
    },
    description: {
      fr: 'Quiz géographie gratuit : pays, capitales, fleuves, montagnes et océans du monde entier. Du facile au piégeux, joue dans ton navigateur.',
      en: 'Free geography quiz: countries, capitals, rivers, mountains and oceans worldwide. From easy to tricky, play in your browser.',
    },
    intro: {
      fr: "Sais-tu vraiment situer les pays, nommer les capitales et reconnaître les grands reliefs de la planète ? Ce quiz géographie balaie le monde entier : continents, océans, fleuves, montagnes, déserts et frontières. Des questions accessibles pour réviser aux pièges qui font douter les meilleurs (le plus grand pays du monde, le plus long fleuve, la mer sans côte). Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour préparer un contrôle de géo, animer une soirée quiz ou juste voyager par l’esprit. Chaque réponse s’accompagne d’un repère à retenir — de quoi remplir les blancs de ta carte du monde.",
      en: "Can you really place countries, name capitals and recognise the planet’s great landforms? This geography quiz spans the whole world: continents, oceans, rivers, mountains, deserts and borders. From accessible revision questions to traps that make experts doubt (the biggest country, the longest river). Play free in your browser, no install, in French or English. Perfect to prep a geography test, run a quiz night, or just travel in your head.",
    },
    subtopics: {
      fr: ['Continents & océans', 'Capitales', 'Fleuves & montagnes', 'Pays & frontières', 'Records géographiques', 'Cartes & repères'],
      en: ['Continents & oceans', 'Capitals', 'Rivers & mountains', 'Countries & borders', 'Geographic records', 'Maps & landmarks'],
    },
    samples: {
      fr: [
        { question: 'Quel est le plus grand pays du monde par superficie ?', answer: 'La Russie', explanation: 'Elle s’étend sur onze fuseaux horaires, loin devant le Canada.' },
        { question: 'Quel est le plus haut sommet du monde ?', answer: 'L’Everest', explanation: 'Culminant à 8 849 m, dans l’Himalaya, à la frontière Népal-Chine.' },
        { question: 'Quel est le plus grand océan ?', answer: 'Le Pacifique', explanation: 'Il couvre à lui seul environ un tiers de la surface du globe.' },
      ],
      en: [
        { question: 'What is the largest country by area?', answer: 'Russia', explanation: 'It spans eleven time zones, well ahead of Canada.' },
        { question: 'What is the highest mountain in the world?', answer: 'Mount Everest', explanation: 'At 8,849 m in the Himalayas, on the Nepal-China border.' },
        { question: 'What is the largest ocean?', answer: 'The Pacific', explanation: 'It alone covers about a third of the globe’s surface.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz géographie est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Est-ce utile pour réviser ?', a: 'Oui, il couvre capitales, reliefs et pays au programme, avec un repère à chaque réponse.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the geography quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Is it useful for revising?', a: 'Yes, it covers capitals, landforms and countries, with a marker on each answer.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'musique',
    emoji: '🎵',
    playCategory: 'music',
    aboutName: 'Musique',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Musique',
    label: { fr: 'Musique', en: 'Music' },
    title: {
      fr: 'Quiz Musique — artistes, tubes et instruments | BIGHEAD',
      en: 'Music Quiz — artists, hits and instruments | BIGHEAD',
    },
    description: {
      fr: 'Quiz musique gratuit : artistes, groupes, tubes, instruments et genres, du rock au rap. Du facile au piégeux, joue dans ton navigateur.',
      en: 'Free music quiz: artists, bands, hits, instruments and genres, from rock to rap. From easy to tricky, play in your browser.',
    },
    intro: {
      fr: "De Mozart à Michael Jackson, des Beatles au rap actuel, la musique est un terrain de jeu sans fin. Ce quiz musique teste tes connaissances sur les artistes, les groupes, les albums cultes, les instruments et les genres. Des questions faciles pour tous aux détails qui départagent les vrais mélomanes. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Idéal pour une soirée quiz, un défi entre potes ou juste tester ta culture musicale. Chaque réponse s’accompagne d’une anecdote — de quoi enrichir tes playlists mentales.",
      en: "From Mozart to Michael Jackson, the Beatles to today’s rap, music is an endless playground. This music quiz tests your knowledge of artists, bands, iconic albums, instruments and genres. From easy questions for everyone to details that sort true music lovers. Play free in your browser, no install, in French or English. Great for a quiz night, a challenge with friends, or just testing your musical knowledge.",
    },
    subtopics: {
      fr: ['Artistes & groupes', 'Tubes & albums', 'Instruments', 'Genres musicaux', 'Musique classique', 'Chanson française'],
      en: ['Artists & bands', 'Hits & albums', 'Instruments', 'Music genres', 'Classical music', 'French chanson'],
    },
    samples: {
      fr: [
        { question: 'Quel groupe britannique a sorti l’album « Abbey Road » ?', answer: 'Les Beatles', explanation: 'La pochette, avec le passage piéton, est l’une des plus célèbres de l’histoire.' },
        { question: 'Qui est surnommé le « King of Pop » ?', answer: 'Michael Jackson', explanation: 'Son album « Thriller » (1982) reste l’un des plus vendus de tous les temps.' },
        { question: 'Combien de cordes possède une guitare classique ?', answer: 'Six', explanation: 'Accordées, du grave à l’aigu : mi, la, ré, sol, si, mi.' },
      ],
      en: [
        { question: 'Which British band released the album “Abbey Road”?', answer: 'The Beatles', explanation: 'Its zebra-crossing cover is one of the most famous in history.' },
        { question: 'Who is nicknamed the “King of Pop”?', answer: 'Michael Jackson', explanation: 'His album “Thriller” (1982) is still one of the best-selling ever.' },
        { question: 'How many strings does a classical guitar have?', answer: 'Six', explanation: 'Tuned low to high: E, A, D, G, B, E.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz musique est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Faut-il écouter des extraits ?', a: 'Non, ce quiz porte sur des connaissances (artistes, albums, instruments), pas sur l’écoute d’extraits musicaux.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the music quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Do I need to listen to clips?', a: 'No, this quiz is about knowledge (artists, albums, instruments), not audio clips.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'series-tv',
    emoji: '📺',
    playCategory: 'cinema',
    aboutName: 'Série télévisée',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/S%C3%A9rie_t%C3%A9l%C3%A9vis%C3%A9e',
    label: { fr: 'Séries TV', en: 'TV Series' },
    title: {
      fr: 'Quiz Séries TV — Netflix, cultes et personnages | BIGHEAD',
      en: 'TV Series Quiz — Netflix, cult shows, characters | BIGHEAD',
    },
    description: {
      fr: 'Quiz séries TV gratuit : Netflix, séries cultes, personnages et répliques. De Breaking Bad à Squid Game, joue dans ton navigateur.',
      en: 'Free TV series quiz: Netflix, cult shows, characters and lines. From Breaking Bad to Squid Game, play in your browser.',
    },
    intro: {
      fr: "On a tous binge-watché une série jusqu’à 3 h du matin. Ce quiz séries TV teste ta mémoire des shows cultes et des cartons Netflix : personnages, intrigues, acteurs et répliques. Des classiques (Breaking Bad, Game of Thrones) aux phénomènes récents (Squid Game, Stranger Things), avec des questions faciles pour les fans et des détails qui piègent les sériephiles. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour une soirée quiz spéciale séries, un défi entre binge-watchers ou juste prouver que tu as tout retenu. Sans spoilers : on ne révèle pas les fins.",
      en: "We’ve all binged a show until 3 a.m. This TV series quiz tests your memory of cult shows and Netflix hits: characters, plots, actors and lines. From classics (Breaking Bad, Game of Thrones) to recent phenomena (Squid Game, Stranger Things), with easy questions for fans and details that trap the true binge-watchers. Play free in your browser, no install, in French or English. Spoiler-free: we don’t give away endings.",
    },
    subtopics: {
      fr: ['Séries cultes', 'Cartons Netflix', 'Personnages', 'Répliques célèbres', 'Sitcoms', 'Séries françaises'],
      en: ['Cult shows', 'Netflix hits', 'Characters', 'Famous lines', 'Sitcoms', 'French series'],
    },
    samples: {
      fr: [
        { question: 'Dans quelle série suit-on le professeur de chimie Walter White ?', answer: 'Breaking Bad', explanation: 'Diffusée de 2008 à 2013, elle est considérée comme l’une des meilleures séries de tous les temps.' },
        { question: 'Quelle série met en scène la lutte pour le Trône de Fer ?', answer: 'Game of Thrones', explanation: 'Adaptée des romans de George R. R. Martin.' },
        { question: 'Dans quelle série sud-coréenne joue-t-on à des jeux d’enfants mortels ?', answer: 'Squid Game', explanation: 'Sortie en 2021, elle est devenue la série la plus vue de l’histoire de Netflix.' },
      ],
      en: [
        { question: 'Which series follows chemistry teacher Walter White?', answer: 'Breaking Bad', explanation: 'Aired 2008–2013, widely rated one of the best series ever.' },
        { question: 'Which series centres on the fight for the Iron Throne?', answer: 'Game of Thrones', explanation: 'Adapted from George R. R. Martin’s novels.' },
        { question: 'Which South Korean series features deadly children’s games?', answer: 'Squid Game', explanation: 'Released in 2021, it became Netflix’s most-watched series ever.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz séries est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Y a-t-il des spoilers ?', a: 'Non, les questions portent sur des faits connus (personnages, casting, répliques), pas sur les fins.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the TV series quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Are there spoilers?', a: 'No, questions are about known facts (characters, cast, lines), not endings.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'jeux-video',
    emoji: '🎮',
    playCategory: 'general',
    aboutName: 'Jeu vidéo',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Jeu_vid%C3%A9o',
    label: { fr: 'Jeux vidéo', en: 'Video Games' },
    title: {
      fr: 'Quiz Jeux Vidéo — consoles, jeux cultes, personnages | BIGHEAD',
      en: 'Video Games Quiz — consoles, cult games, characters | BIGHEAD',
    },
    description: {
      fr: 'Quiz jeux vidéo gratuit : consoles, jeux cultes, personnages et studios. De Mario à Minecraft, joue dans ton navigateur.',
      en: 'Free video games quiz: consoles, cult games, characters and studios. From Mario to Minecraft, play in your browser.',
    },
    intro: {
      fr: "Des bornes d’arcade aux jeux en ligne, le jeu vidéo a bercé des générations. Ce quiz jeux vidéo teste ta culture manette en main : consoles mythiques, jeux cultes, personnages emblématiques et studios légendaires. Des questions faciles pour les joueurs occasionnels aux détails qui piègent les hardcore gamers. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour une soirée quiz geek, un défi entre gamers ou juste réviser ta culture G du pixel. Chaque réponse s’accompagne d’une anecdote de l’histoire du jeu vidéo.",
      en: "From arcade cabinets to online games, video games have shaped generations. This video games quiz tests your controller-in-hand culture: legendary consoles, cult games, iconic characters and legendary studios. From easy questions for casual players to details that trap hardcore gamers. Play free in your browser, no install, in French or English. Great for a geeky quiz night, a challenge with gamers, or just brushing up your pixel trivia.",
    },
    subtopics: {
      fr: ['Consoles', 'Jeux cultes', 'Personnages', 'Studios & éditeurs', 'Esport', 'Rétrogaming'],
      en: ['Consoles', 'Cult games', 'Characters', 'Studios & publishers', 'Esports', 'Retro gaming'],
    },
    samples: {
      fr: [
        { question: 'Quel plombier moustachu est la mascotte de Nintendo ?', answer: 'Mario', explanation: 'Apparu en 1981 dans Donkey Kong, il s’appelait alors « Jumpman ».' },
        { question: 'Quel jeu de blocs est le plus vendu de l’histoire ?', answer: 'Minecraft', explanation: 'Plus de 300 millions d’exemplaires écoulés depuis 2011.' },
        { question: 'Quelle entreprise a créé la PlayStation ?', answer: 'Sony', explanation: 'La première PlayStation est sortie en 1994 au Japon.' },
      ],
      en: [
        { question: 'Which moustached plumber is Nintendo’s mascot?', answer: 'Mario', explanation: 'He debuted in 1981 in Donkey Kong, then called “Jumpman”.' },
        { question: 'Which block-building game is the best-selling of all time?', answer: 'Minecraft', explanation: 'Over 300 million copies sold since 2011.' },
        { question: 'Which company created the PlayStation?', answer: 'Sony', explanation: 'The first PlayStation launched in 1994 in Japan.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz jeux vidéo est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Faut-il être un gamer pro ?', a: 'Non, les questions vont des grands classiques grand public aux détails plus pointus.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the video games quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Do I need to be a pro gamer?', a: 'No, questions range from mainstream classics to deeper cuts.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'seconde-guerre-mondiale',
    emoji: '⚔️',
    playCategory: 'history',
    aboutName: 'Seconde Guerre mondiale',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Seconde_Guerre_mondiale',
    label: { fr: 'Seconde Guerre mondiale', en: 'World War II' },
    title: {
      fr: 'Quiz Seconde Guerre mondiale — dates, batailles, chefs | BIGHEAD',
      en: 'World War II Quiz — dates, battles, leaders | BIGHEAD',
    },
    description: {
      fr: 'Quiz Seconde Guerre mondiale gratuit : dates clés, grandes batailles, chefs d’État et tournants du conflit. Idéal pour réviser, joue en ligne.',
      en: 'Free World War II quiz: key dates, major battles, leaders and turning points. Great for revision, play online.',
    },
    intro: {
      fr: "De l’invasion de la Pologne à la capitulation du Japon, la Seconde Guerre mondiale a redessiné le XXᵉ siècle. Ce quiz teste tes connaissances sur les dates clés, les grandes batailles, les chefs d’État et les tournants du conflit — front de l’Est, débarquement, résistance, alliances. Des questions accessibles pour réviser aux détails qui départagent les passionnés d’histoire. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour préparer un contrôle, réviser le brevet ou le bac, ou combler les trous de la frise. Chaque réponse s’accompagne d’un repère daté pour bien situer les événements. Sujet traité avec sobriété et rigueur historique.",
      en: "From the invasion of Poland to Japan’s surrender, World War II reshaped the 20th century. This quiz tests your knowledge of key dates, major battles, leaders and turning points — the Eastern Front, D-Day, resistance, alliances. From accessible revision questions to details that sort history buffs. Play free in your browser, no install, in French or English. Perfect to prep a test or exam, or fill the gaps in your timeline. Handled with restraint and historical rigour.",
    },
    subtopics: {
      fr: ['Dates clés', 'Grandes batailles', 'Chefs d’État', 'Front de l’Est', 'Débarquement & Libération', 'Alliances & pays'],
      en: ['Key dates', 'Major battles', 'Leaders', 'Eastern Front', 'D-Day & Liberation', 'Alliances & nations'],
    },
    samples: {
      fr: [
        { question: 'Quel jour a lieu le Débarquement de Normandie ?', answer: 'Le 6 juin 1944', explanation: 'Le « D-Day » : le plus grand débarquement amphibie de l’histoire.' },
        { question: 'L’invasion de quel pays déclenche la guerre en septembre 1939 ?', answer: 'La Pologne', explanation: 'Envahie par l’Allemagne le 1ᵉʳ septembre 1939, deux jours avant la déclaration de guerre franco-britannique.' },
        { question: 'Quelle bataille marque un tournant majeur sur le front de l’Est ?', answer: 'Stalingrad', explanation: 'La défaite allemande (1942-1943) inverse le cours de la guerre à l’Est.' },
      ],
      en: [
        { question: 'On what day did the Normandy landings take place?', answer: '6 June 1944', explanation: '“D-Day”: the largest amphibious landing in history.' },
        { question: 'The invasion of which country triggered the war in September 1939?', answer: 'Poland', explanation: 'Invaded by Germany on 1 September 1939.' },
        { question: 'Which battle was a major turning point on the Eastern Front?', answer: 'Stalingrad', explanation: 'The German defeat (1942–1943) reversed the war in the East.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Est-ce utile pour réviser le brevet ou le bac ?', a: 'Oui, il couvre les dates, batailles et acteurs au programme, avec un repère daté à chaque réponse.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Is it useful for exam revision?', a: 'Yes, it covers the dates, battles and figures on the syllabus, with a dated marker on each answer.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'napoleon',
    emoji: '🎩',
    playCategory: 'history',
    aboutName: 'Napoléon Ier',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Napol%C3%A9on_Ier',
    label: { fr: 'Napoléon', en: 'Napoleon' },
    title: {
      fr: 'Quiz Napoléon — batailles, Empire et Sainte-Hélène | BIGHEAD',
      en: 'Napoleon Quiz — battles, Empire and St Helena | BIGHEAD',
    },
    description: {
      fr: 'Quiz Napoléon gratuit : de la Révolution à Waterloo, batailles, réformes et exil. Teste ta connaissance de l’Empereur dans ton navigateur.',
      en: 'Free Napoleon quiz: from the Revolution to Waterloo, battles, reforms and exile. Test your knowledge of the Emperor in your browser.',
    },
    intro: {
      fr: "Général corse devenu empereur des Français, Napoléon Bonaparte a marqué l’Histoire comme peu d’hommes. Ce quiz Napoléon teste tes connaissances sur son ascension, ses grandes batailles (Austerlitz, Iéna, Waterloo), ses réformes (Code civil, lycées) et ses exils. Des questions accessibles pour réviser aux détails qui piègent les passionnés. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour réviser l’histoire, préparer un contrôle ou juste remettre les dates de l’Empire dans l’ordre. Chaque réponse s’accompagne d’un repère daté — de quoi suivre la trajectoire fulgurante de l’Empereur.",
      en: "A Corsican general who became Emperor of the French, Napoleon Bonaparte left a mark like few others. This Napoleon quiz tests your knowledge of his rise, his great battles (Austerlitz, Jena, Waterloo), his reforms (Civil Code, lycées) and his exiles. From accessible revision questions to details that trap enthusiasts. Play free in your browser, no install, in French or English. Perfect to revise history, prep a test, or just get the Empire’s dates in order.",
    },
    subtopics: {
      fr: ['De la Révolution au Consulat', 'Grandes batailles', 'Le Premier Empire', 'Réformes & Code civil', 'Waterloo & la chute', 'Exils & Sainte-Hélène'],
      en: ['From Revolution to Consulate', 'Great battles', 'The First Empire', 'Reforms & Civil Code', 'Waterloo & the fall', 'Exiles & St Helena'],
    },
    samples: {
      fr: [
        { question: 'Où Napoléon est-il définitivement vaincu en 1815 ?', answer: 'À Waterloo', explanation: 'La défaite face aux coalisés (Wellington, Blücher) met fin aux Cent-Jours.' },
        { question: 'Sur quelle île Napoléon est-il exilé et meurt-il en 1821 ?', answer: 'Sainte-Hélène', explanation: 'Île britannique isolée de l’Atlantique Sud, choisie pour empêcher toute évasion.' },
        { question: 'En quelle année Napoléon est-il sacré empereur ?', answer: '1804', explanation: 'Sacré à Notre-Dame de Paris, il se couronne lui-même en présence du pape.' },
      ],
      en: [
        { question: 'Where was Napoleon finally defeated in 1815?', answer: 'At Waterloo', explanation: 'The defeat against the coalition (Wellington, Blücher) ended the Hundred Days.' },
        { question: 'On which island was Napoleon exiled, dying in 1821?', answer: 'St Helena', explanation: 'A remote British island in the South Atlantic, chosen to prevent escape.' },
        { question: 'In which year was Napoleon crowned emperor?', answer: '1804', explanation: 'Crowned at Notre-Dame de Paris, he placed the crown on his own head.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz Napoléon est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Est-ce utile pour réviser l’histoire ?', a: 'Oui, il couvre l’Empire, les batailles et les réformes, avec un repère daté à chaque réponse.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the Napoleon quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Is it useful for revising history?', a: 'Yes, it covers the Empire, battles and reforms, with a dated marker on each answer.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'pokemon',
    emoji: '⚡',
    playCategory: 'general',
    aboutName: 'Pokémon',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Pok%C3%A9mon',
    label: { fr: 'Pokémon', en: 'Pokémon' },
    title: {
      fr: 'Quiz Pokémon — Pokédex, types et générations | BIGHEAD',
      en: 'Pokémon Quiz — Pokédex, types and generations | BIGHEAD',
    },
    description: {
      fr: 'Quiz Pokémon gratuit : Pokédex, types, évolutions et générations. De Pikachu aux légendaires, joue tout de suite dans ton navigateur.',
      en: 'Free Pokémon quiz: Pokédex, types, evolutions and generations. From Pikachu to legendaries, play instantly in your browser.',
    },
    intro: {
      fr: "« Attrapez-les tous ! » Depuis 1996, Pokémon est un phénomène mondial — jeux, dessin animé, cartes. Ce quiz Pokémon teste ta connaissance du Pokédex : types, évolutions, légendaires, générations et attaques. Des questions faciles pour les dresseurs occasionnels aux détails qui piègent les vrais maîtres Pokémon. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour un défi entre fans, une soirée quiz ou juste replonger dans ton enfance. Chaque réponse s’accompagne d’une anecdote sur l’univers Pokémon — de quoi compléter ton Pokédex mental.",
      en: "“Gotta catch ’em all!” Since 1996, Pokémon has been a global phenomenon — games, anime, cards. This Pokémon quiz tests your Pokédex knowledge: types, evolutions, legendaries, generations and moves. From easy questions for casual trainers to details that trap true Pokémon masters. Play free in your browser, no install, in French or English. Great for a challenge among fans, a quiz night, or just diving back into your childhood.",
    },
    subtopics: {
      fr: ['Pokédex 1ʳᵉ génération', 'Types & faiblesses', 'Évolutions', 'Pokémon légendaires', 'Générations', 'Dresseurs & régions'],
      en: ['Gen 1 Pokédex', 'Types & weaknesses', 'Evolutions', 'Legendary Pokémon', 'Generations', 'Trainers & regions'],
    },
    samples: {
      fr: [
        { question: 'Quel est le Pokémon numéro 1 du Pokédex national ?', answer: 'Bulbizarre', explanation: 'Pokémon de type Plante/Poison, il évolue en Herbizarre puis Florizarre.' },
        { question: 'Combien de Pokémon compte la première génération ?', answer: '151', explanation: 'De Bulbizarre (n°1) à Mew (n°151).' },
        { question: 'À quel type l’eau est-elle efficace ?', answer: 'Le feu', explanation: 'L’eau est super efficace contre Feu, Sol et Roche.' },
      ],
      en: [
        { question: 'Which Pokémon is number 1 in the National Pokédex?', answer: 'Bulbasaur', explanation: 'A Grass/Poison type, it evolves into Ivysaur then Venusaur.' },
        { question: 'How many Pokémon are in the first generation?', answer: '151', explanation: 'From Bulbasaur (No. 1) to Mew (No. 151).' },
        { question: 'Which type is Water strong against?', answer: 'Fire', explanation: 'Water is super effective against Fire, Ground and Rock.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz Pokémon est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Ça couvre quelles générations ?', a: 'Surtout les classiques (1ʳᵉ génération et suivantes), des plus connus aux légendaires.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the Pokémon quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Which generations does it cover?', a: 'Mostly the classics (Gen 1 and onwards), from the famous ones to legendaries.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'seigneur-des-anneaux',
    emoji: '💍',
    playCategory: 'cinema',
    aboutName: 'Le Seigneur des anneaux',
    aboutWikipedia: 'https://fr.wikipedia.org/wiki/Le_Seigneur_des_anneaux',
    label: { fr: 'Le Seigneur des Anneaux', en: 'The Lord of the Rings' },
    title: {
      fr: 'Quiz Seigneur des Anneaux — Terre du Milieu & héros | BIGHEAD',
      en: 'Lord of the Rings Quiz — Middle-earth & heroes | BIGHEAD',
    },
    description: {
      fr: 'Quiz Seigneur des Anneaux gratuit : Terre du Milieu, personnages, lieux et intrigue, livres et films. Joue tout de suite dans ton navigateur.',
      en: 'Free Lord of the Rings quiz: Middle-earth, characters, places and plot, books and films. Play instantly in your browser.',
    },
    intro: {
      fr: "Un anneau pour les gouverner tous… De la Comté au Mordor, Le Seigneur des Anneaux est une saga culte, en livres comme au cinéma. Ce quiz teste ta connaissance de la Terre du Milieu : personnages (Frodon, Gandalf, Aragorn), lieux, races, intrigue et créatures. Des questions faciles pour les fans aux détails qui piègent les vrais connaisseurs de Tolkien. Tu joues gratuitement dans le navigateur, sans installation, en français ou en anglais. Parfait pour une soirée quiz fantasy, un défi entre fans ou juste revivre la quête de l’Anneau. Sans spoilers inutiles, chaque réponse s’accompagne d’une anecdote sur l’univers.",
      en: "One ring to rule them all… From the Shire to Mordor, The Lord of the Rings is a cult saga, in books and on screen. This quiz tests your Middle-earth knowledge: characters (Frodo, Gandalf, Aragorn), places, races, plot and creatures. From easy questions for fans to details that trap true Tolkien connoisseurs. Play free in your browser, no install, in French or English. Great for a fantasy quiz night, a challenge among fans, or just reliving the quest for the Ring.",
    },
    subtopics: {
      fr: ['La Communauté de l’Anneau', 'Personnages', 'Lieux de la Terre du Milieu', 'Races & créatures', 'L’intrigue', 'Tolkien & l’univers'],
      en: ['The Fellowship', 'Characters', 'Middle-earth places', 'Races & creatures', 'The plot', 'Tolkien & the world'],
    },
    samples: {
      fr: [
        { question: 'Qui a écrit Le Seigneur des Anneaux ?', answer: 'J. R. R. Tolkien', explanation: 'Publié dans les années 1950, il est l’un des piliers de la fantasy moderne.' },
        { question: 'Quel hobbit est chargé de détruire l’Anneau unique ?', answer: 'Frodon Sacquet', explanation: 'Accompagné de son fidèle jardinier Sam jusqu’au Mont Destin.' },
        { question: 'Comment s’appelle le royaume des Hommes défendu à Minas Tirith ?', answer: 'Le Gondor', explanation: 'Sa capitale Minas Tirith est le théâtre de la bataille des champs du Pelennor.' },
      ],
      en: [
        { question: 'Who wrote The Lord of the Rings?', answer: 'J. R. R. Tolkien', explanation: 'Published in the 1950s, it is a cornerstone of modern fantasy.' },
        { question: 'Which hobbit is tasked with destroying the One Ring?', answer: 'Frodo Baggins', explanation: 'Accompanied by his faithful gardener Sam to Mount Doom.' },
        { question: 'What is the realm of Men defended at Minas Tirith?', answer: 'Gondor', explanation: 'Its capital Minas Tirith is the setting of the Battle of the Pelennor Fields.' },
      ],
    },
    faq: {
      fr: [
        { q: 'Le quiz est-il gratuit ?', a: 'Oui, gratuit et sans compte obligatoire, directement dans le navigateur.' },
        { q: 'Livres ou films ?', a: 'Les deux : les questions portent sur l’univers commun (personnages, lieux, intrigue), connus des lecteurs comme des spectateurs.' },
        { q: 'Puis-je jouer sur mobile ?', a: 'Oui, sur téléphone, tablette et ordinateur, plus une app iOS/Android pour jouer hors-ligne.' },
      ],
      en: [
        { q: 'Is the quiz free?', a: 'Yes, free and no account required, right in your browser.' },
        { q: 'Books or films?', a: 'Both: the questions are about the shared world (characters, places, plot) known to readers and viewers alike.' },
        { q: 'Can I play on mobile?', a: 'Yes, on phone, tablet and desktop, plus an iOS/Android app to play offline.' },
      ],
    },
  },
] as const

/** Returns the theme for a slug, or `undefined` for unknown slugs. */
export function getTheme(slug: string): ThemeContent | undefined {
  return THEMES.find((th) => th.slug === slug)
}

/**
 * WebPage + about + BreadcrumbList + FAQPage for a `/quiz/t/$slug` page.
 * The FAQ mirrors the visible FR text (SSR is French) — a strict FAQPage rule.
 */
export function themeJsonLd(theme: ThemeContent): string {
  const url = `${SITE_URL}/quiz/t/${theme.slug}`
  const label = theme.label.fr
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: theme.title.fr,
        description: theme.description.fr,
        inLanguage: 'fr',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: {
          '@type': 'Thing',
          name: theme.aboutName,
          sameAs: theme.aboutWikipedia,
        },
        mainEntity: { '@id': `${SITE_URL}/#game` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: `Quiz ${label}` },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: theme.faq.fr.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  })
}
