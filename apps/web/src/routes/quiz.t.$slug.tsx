import { Link, createFileRoute } from '@tanstack/react-router'
import { CalendarDays, Swords, Trophy, Zap } from 'lucide-react'

import { useLang } from '#/lib/i18n/LangProvider'
import { CATEGORIES } from '#/lib/game/categories'
import { THEMES, getTheme, themeJsonLd } from '#/lib/seo/themes'

import type { ThemeContent } from '#/lib/seo/themes'

const SITE_URL = 'https://play.bighead-quizz.com'

/** Section labels — kept inline (FR/EN) so theme pages own their copy. */
const UI = {
  fr: {
    play: 'Jouer au quiz',
    duel: 'Défier un ami',
    samples: 'Questions d’exemple',
    samplesNote: 'Échantillon — le quiz complet pioche dans plus de 36 000 questions.',
    subtopics: 'Ce que tu vas réviser',
    faq: 'Questions fréquentes',
    otherThemes: 'Autres quiz à thème',
    categories: 'Ou parcours par catégorie',
    modes: 'Autres façons de jouer',
    home: 'Retour à l’accueil',
    daily: 'Quiz du jour',
    weekly: 'Défi de la semaine',
    leaderboard: 'Classement',
  },
  en: {
    play: 'Play the quiz',
    duel: 'Challenge a friend',
    samples: 'Sample questions',
    samplesNote: 'A sample — the full quiz draws from 36,000+ questions.',
    subtopics: 'What you’ll revise',
    faq: 'Frequently asked questions',
    otherThemes: 'Other themed quizzes',
    categories: 'Or browse by category',
    modes: 'Other ways to play',
    home: 'Back home',
    daily: 'Daily quiz',
    weekly: 'Weekly challenge',
    leaderboard: 'Leaderboard',
  },
}

export const Route = createFileRoute('/quiz/t/$slug')({
  // SSR meta is built in FR (the html lang) from the theme config. Unknown slugs
  // still render a friendly fallback with generic, non-canonical meta.
  head: ({ params }) => {
    const theme = getTheme(params.slug)
    if (!theme) return { meta: [{ title: 'BIGHEAD' }] }
    const url = `${SITE_URL}/quiz/t/${theme.slug}`
    return {
      meta: [
        { title: theme.title.fr },
        { name: 'description', content: theme.description.fr },
        { property: 'og:title', content: theme.title.fr },
        { property: 'og:description', content: theme.description.fr },
        { property: 'og:url', content: url },
        { name: 'twitter:title', content: theme.title.fr },
        { name: 'twitter:description', content: theme.description.fr },
      ],
      links: [{ rel: 'canonical', href: url }],
      scripts: [
        { type: 'application/ld+json', children: themeJsonLd(theme) },
      ],
    }
  },
  component: ThemePage,
})

function ThemePage() {
  const { slug } = Route.useParams()
  const theme = getTheme(slug)
  if (!theme) return <UnknownTheme />
  return <ThemeLanding theme={theme} />
}

function ThemeLanding({ theme }: { theme: ThemeContent }) {
  const { lang } = useLang()
  const ui = UI[lang]
  const label = theme.label[lang]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 pb-8">
      <header className="flex flex-col items-start gap-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-4xl">
          <span aria-hidden="true">{theme.emoji}</span>
        </span>
        <h1 className="text-balance text-3xl font-black tracking-tight text-fg sm:text-4xl">
          Quiz {label}
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-fg/70 sm:text-lg">
          {theme.intro[lang]}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/play/chain"
            search={{ category: theme.playCategory }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-bg shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
          >
            <Zap className="h-5 w-5" aria-hidden="true" />
            {ui.play}
          </Link>
          <Link
            to="/duels"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base font-semibold text-fg transition-colors hover:border-primary/60 hover:bg-white/5"
          >
            <Swords className="h-5 w-5" aria-hidden="true" />
            {ui.duel}
          </Link>
        </div>
      </header>

      {/* Real Q&A — the citable content Google and AI engines look for. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-black tracking-tight text-fg">{ui.samples}</h2>
        <ul className="flex flex-col gap-3">
          {theme.samples[lang].map((s) => (
            <li key={s.question}>
              <details className="group rounded-2xl border border-white/10 bg-surface p-4">
                <summary className="cursor-pointer list-none font-semibold text-fg marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="mr-2 text-primary" aria-hidden="true">?</span>
                  {s.question}
                </summary>
                <p className="mt-3 text-sm text-fg">
                  <span className="font-bold text-success">{s.answer}</span>
                  <span className="text-fg/70"> — {s.explanation}</span>
                </p>
              </details>
            </li>
          ))}
        </ul>
        <p className="text-sm text-fg/50">{ui.samplesNote}</p>
      </section>

      {/* Subtopics — answers the "what will I revise?" intent. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-black tracking-tight text-fg">{ui.subtopics}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {theme.subtopics[lang].map((topic) => (
            <li
              key={topic}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-fg"
            >
              <span className="text-primary" aria-hidden="true">✓</span>
              {topic}
            </li>
          ))}
        </ul>
      </section>

      {/* Visible FAQ — mirrored verbatim into the FAQPage JSON-LD (FR). */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-black tracking-tight text-fg">{ui.faq}</h2>
        <dl className="flex flex-col gap-4">
          {theme.faq[lang].map((item) => (
            <div key={item.q} className="rounded-2xl border border-white/10 bg-surface p-5">
              <dt className="font-bold text-fg">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-fg/70">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <OtherThemes currentSlug={theme.slug} title={ui.otherThemes} />

      {/* Internal link to the broad category pages. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-black tracking-tight text-fg">{ui.categories}</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                to="/quiz/$category"
                params={{ category: c.slug }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm font-semibold text-fg transition-colors hover:border-primary/60"
              >
                <span aria-hidden="true">{c.emoji}</span>
                {c.slug}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ModeLinks ui={ui} />
    </div>
  )
}

function OtherThemes({
  currentSlug,
  title,
}: {
  currentSlug?: string
  title: string
}) {
  const { lang } = useLang()
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-black tracking-tight text-fg">{title}</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {THEMES.map((th) => (
          <li key={th.slug}>
            <Link
              to="/quiz/t/$slug"
              params={{ slug: th.slug }}
              aria-current={th.slug === currentSlug ? 'page' : undefined}
              className={
                'flex items-center gap-2 rounded-xl border bg-surface px-4 py-3 text-sm font-semibold text-fg transition-colors hover:border-primary/60 ' +
                (th.slug === currentSlug ? 'border-primary/60' : 'border-white/10')
              }
            >
              <span aria-hidden="true">{th.emoji}</span>
              {th.label[lang]}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ModeLinks({ ui }: { ui: (typeof UI)['fr'] }) {
  const links = [
    { to: '/play/daily' as const, icon: CalendarDays, label: ui.daily },
    { to: '/weekly' as const, icon: Trophy, label: ui.weekly },
    { to: '/leaderboard' as const, icon: Trophy, label: ui.leaderboard },
  ]
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-black tracking-tight text-fg">{ui.modes}</h2>
      <div className="flex flex-wrap gap-3">
        {links.map((m) => {
          const Icon = m.icon
          return (
            <Link
              key={m.to}
              to={m.to}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-primary/60"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {m.label}
            </Link>
          )
        })}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-primary/60"
        >
          {ui.home}
        </Link>
      </div>
    </section>
  )
}

function UnknownTheme() {
  const { lang } = useLang()
  const ui = UI[lang]
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight text-fg">
          {lang === 'fr' ? 'Quiz introuvable' : 'Quiz not found'}
        </h1>
        <p className="text-fg/70">
          {lang === 'fr'
            ? 'Ce thème n’existe pas (encore). Choisis-en un ci-dessous.'
            : 'This theme doesn’t exist (yet). Pick one below.'}
        </p>
      </header>
      <OtherThemes title={ui.otherThemes} />
      <ModeLinks ui={ui} />
    </div>
  )
}
