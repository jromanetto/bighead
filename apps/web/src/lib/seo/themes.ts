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
