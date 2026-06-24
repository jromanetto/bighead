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
