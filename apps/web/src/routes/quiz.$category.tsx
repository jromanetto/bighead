import { Link, createFileRoute } from '@tanstack/react-router'
import { CalendarDays, Swords, Trophy, Zap } from 'lucide-react'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { CATEGORIES, getCategory } from '#/lib/game/categories'
import { t as translate } from '#/lib/i18n/strings'
import { buildFaq, getCategorySeo, roundedCount } from '#/lib/seo/categoryContent'
import { categoryJsonLd } from '#/lib/seo/jsonLd'

import type { Category } from '#/lib/game/categories'
import type { StringKey } from '#/lib/i18n/strings'

const SITE_URL = 'https://play.bighead-quizz.com'

/** Fills a `{cat}` placeholder in a string. */
function fill(template: string, cat: string): string {
  return template.replace('{cat}', cat)
}

export const Route = createFileRoute('/quiz/$category')({
  // Build unique, crawlable meta from the slug at request time (SSR). Unknown
  // slugs still render (a friendly "unknown category" page) but get generic,
  // non-canonical meta so they don't pollute the index.
  head: ({ params }) => {
    const cat = getCategory(params.category)
    if (!cat) {
      return { meta: [{ title: 'BIGHEAD' }] }
    }
    // Meta is language-agnostic at the document level; use FR (the html lang),
    // matching the rest of the app's default-locale SSR copy.
    const label = translate(cat.labelKey, 'fr')
    const title = fill(translate('quiz.page.title', 'fr'), label)
    const desc = translate(cat.descKey, 'fr')
    const url = `${SITE_URL}/quiz/${cat.slug}`
    const seo = getCategorySeo(cat.slug)
    return {
      meta: [
        { title },
        { name: 'description', content: desc },
        { property: 'og:title', content: title },
        { property: 'og:description', content: desc },
        { property: 'og:url', content: url },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: desc },
      ],
      links: [{ rel: 'canonical', href: url }],
      // WebPage + about(Wikipédia) + BreadcrumbList + FAQPage (texte visible).
      scripts: seo
        ? [
            {
              type: 'application/ld+json',
              children: categoryJsonLd(cat.slug, label, title, desc, seo),
            },
          ]
        : [],
    }
  },
  component: QuizCategoryPage,
})

function QuizCategoryPage() {
  const { category } = Route.useParams()
  const cat = getCategory(category)

  if (!cat) return <UnknownCategory />
  return <CategoryLanding cat={cat} />
}

function CategoryLanding({ cat }: { cat: Category }) {
  const t = useT()
  const { lang } = useLang()
  const label = t(cat.labelKey)
  const seo = getCategorySeo(cat.slug)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 pb-8">
      <header className="flex flex-col items-start gap-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-4xl">
          <span aria-hidden="true">{cat.emoji}</span>
        </span>
        <h1 className="text-balance text-3xl font-black tracking-tight text-fg sm:text-4xl">
          {fill(t('quiz.page.h1'), label)}
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-fg/70 sm:text-lg">
          {seo ? seo.intro[lang] : t(cat.descKey)}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/play/chain"
            search={{ category: cat.slug }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-bg shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
          >
            <Zap className="h-5 w-5" aria-hidden="true" />
            {fill(t('quiz.page.cta'), label)}
          </Link>
          <Link
            to="/duels"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base font-semibold text-fg transition-colors hover:border-primary/60 hover:bg-white/5"
          >
            <Swords className="h-5 w-5" aria-hidden="true" />
            {fill(t('quiz.page.ctaDuel'), label)}
          </Link>
        </div>
      </header>

      {seo ? <SampleQuestions label={label} seo={seo} /> : null}
      {seo ? <CategoryStats label={label} seo={seo} /> : null}
      {seo ? <Subtopics label={label} seo={seo} /> : null}
      {seo ? <CategoryFaq label={label} seo={seo} /> : null}

      <AllCategories currentSlug={cat.slug} />
      <ModeLinks />
    </div>
  )
}

type Seo = NonNullable<ReturnType<typeof getCategorySeo>>

/** Vraies questions du jeu — le contenu citable que cherchent Google et les IA. */
function SampleQuestions({ label, seo }: { label: string; seo: Seo }) {
  const t = useT()
  const { lang } = useLang()
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-black tracking-tight text-fg">
        {fill(t('quiz.page.samplesTitle'), label)}
      </h2>
      <ul className="flex flex-col gap-3">
        {seo.samples[lang].map((s) => (
          <li key={s.question}>
            <details className="group rounded-2xl border border-white/10 bg-surface p-4">
              <summary className="cursor-pointer list-none font-semibold text-fg marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="mr-2 text-primary" aria-hidden="true">
                  ?
                </span>
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
      <p className="text-sm text-fg/50">{t('quiz.page.samplesNote')}</p>
    </section>
  )
}

/** Données propriétaires de la catégorie (snapshot DB) — uniques et citables. */
function CategoryStats({ label, seo }: { label: string; seo: Seo }) {
  const t = useT()
  const items: Array<{ label: string; value: string }> = [
    { label: t('quiz.page.stats.total'), value: roundedCount(seo.stats.total) },
    { label: t('quiz.page.stats.easy'), value: roundedCount(seo.stats.easy) },
    { label: t('quiz.page.stats.medium'), value: roundedCount(seo.stats.medium) },
    { label: t('quiz.page.stats.hard'), value: roundedCount(seo.stats.hard) },
  ]
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-black tracking-tight text-fg">
        {fill(t('quiz.page.statsTitle'), label)}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.label}
            className="rounded-2xl border border-white/10 bg-surface p-4"
          >
            <p className="text-2xl font-black tabular-nums text-primary">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-fg/60">{item.label}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Sous-thèmes couverts — l'intention "que vais-je réviser ?" en clair. */
function Subtopics({ label, seo }: { label: string; seo: Seo }) {
  const t = useT()
  const { lang } = useLang()
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-black tracking-tight text-fg">
        {fill(t('quiz.page.subtopicsTitle'), label)}
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {seo.subtopics[lang].map((topic) => (
          <li
            key={topic}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-fg"
          >
            <span className="text-primary" aria-hidden="true">
              ✓
            </span>
            {topic}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** FAQ visible — texte repris mot pour mot dans le JSON-LD FAQPage du head. */
function CategoryFaq({ label, seo }: { label: string; seo: Seo }) {
  const t = useT()
  const { lang } = useLang()
  const faq = buildFaq(label, seo, lang)
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-black tracking-tight text-fg">
        {t('quiz.page.faqTitle')}
      </h2>
      <dl className="flex flex-col gap-4">
        {faq.map((item) => (
          <div
            key={item.q}
            className="rounded-2xl border border-white/10 bg-surface p-5"
          >
            <dt className="font-bold text-fg">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-fg/70">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Internal-linking grid to every category page (good for SEO + discovery). */
function AllCategories({ currentSlug }: { currentSlug?: string }) {
  const t = useT()
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight text-fg">
          {t('quiz.page.allTitle')}
        </h2>
        <p className="text-sm text-fg/60">{t('quiz.page.allSubtitle')}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              to="/quiz/$category"
              params={{ category: c.slug }}
              aria-current={c.slug === currentSlug ? 'page' : undefined}
              className={
                'flex items-center gap-2 rounded-xl border bg-surface px-4 py-3 text-sm font-semibold text-fg transition-colors hover:border-primary/60 ' +
                (c.slug === currentSlug
                  ? 'border-primary/60'
                  : 'border-white/10')
              }
            >
              <span aria-hidden="true">{c.emoji}</span>
              {t(c.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface ModeLink {
  to: string
  icon: typeof Zap
  labelKey: StringKey
}

const MODE_LINKS: ModeLink[] = [
  { to: '/play/daily', icon: CalendarDays, labelKey: 'play.daily.title' },
  { to: '/weekly', icon: Trophy, labelKey: 'weekly.title' },
  { to: '/leaderboard', icon: Trophy, labelKey: 'nav.leaderboard' },
]

/** Links to the main modes + home, keeping the page internally linked. */
function ModeLinks() {
  const t = useT()
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-black tracking-tight text-fg">
        {t('quiz.page.modesTitle')}
      </h2>
      <div className="flex flex-wrap gap-3">
        {MODE_LINKS.map((m) => {
          const Icon = m.icon
          return (
            <Link
              key={m.to}
              to={m.to}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-primary/60"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {t(m.labelKey)}
            </Link>
          )
        })}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-primary/60"
        >
          {t('quiz.page.backHome')}
        </Link>
      </div>
    </section>
  )
}

/** Rendered for an unknown slug — no crash, links to valid categories. */
function UnknownCategory() {
  const t = useT()
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight text-fg">
          {t('quiz.unknown.title')}
        </h1>
        <p className="text-fg/70">{t('quiz.unknown.subtitle')}</p>
      </header>
      <AllCategories />
      <ModeLinks />
    </div>
  )
}
