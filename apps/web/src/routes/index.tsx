import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Brain,
  CalendarDays,
  Globe2,
  Languages,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react'

import { useT } from '#/lib/i18n/LangProvider'
import { HeroCard } from '#/components/landing/HeroCard'
import { Reveal } from '#/components/landing/Reveal'
import { StoreButtons } from '#/components/landing/StoreButtons'

import type { StringKey } from '#/lib/i18n/strings'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/')({ component: Home })

/**
 * Marketing landing page — the SEO entry point and primary funnel asset.
 *
 * Everything here is static marketing content (no `sessionReady`/auth gating,
 * no data fetching), so it is fully server-rendered and crawlable. The
 * `#features` section carries an `id` so `/#features` anchors land on it; the
 * smooth scroll comes from `scroll-behavior: smooth` in styles.css.
 */
function Home() {
  return (
    <div className="flex flex-col gap-20 pb-8 sm:gap-28">
      <Hero />
      <Features />
      <AppFunnel />
      <Footer />
    </div>
  )
}

function Hero() {
  const t = useT()

  return (
    <section className="relative">
      {/* Ambient brand gradient behind the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            BIGHEAD
          </span>

          <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-6xl">
            <span className="block bg-gradient-to-r from-primary via-accent2 to-accent bg-clip-text text-transparent">
              BIGHEAD
            </span>
            <span className="mt-2 block text-fg">{t('app.tagline')}</span>
          </h1>

          <p className="max-w-xl text-pretty text-base leading-relaxed text-fg/70 sm:text-lg">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/play"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-bg shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
            >
              <Zap className="h-5 w-5" aria-hidden="true" />
              {t('landing.hero.ctaPrimary')}
            </Link>
            <a
              href="#app"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base font-semibold text-fg transition-colors hover:border-primary/60 hover:bg-white/5"
            >
              {t('landing.hero.ctaSecondary')}
            </a>
          </div>

          {/* Trust strip */}
          <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg/60">
            <TrustItem>{t('landing.trust.questions')}</TrustItem>
            <Dot />
            <TrustItem>{t('landing.trust.categories')}</TrustItem>
            <Dot />
            <TrustItem>{t('landing.trust.langs')}</TrustItem>
          </ul>
        </div>

        <Reveal delay={0.1} className="w-full max-w-md justify-self-center lg:justify-self-end">
          <HeroCard />
        </Reveal>
      </div>
    </section>
  )
}

function TrustItem({ children }: { children: ReactNode }) {
  return <li className="font-medium text-fg/70">{children}</li>
}

function Dot() {
  return (
    <li aria-hidden="true" className="h-1 w-1 rounded-full bg-fg/30" />
  )
}

interface Mode {
  to: string
  emoji: string
  icon: ReactNode
  titleKey: StringKey
  descKey: StringKey
  accent: string
}

const MODES: Array<Mode> = [
  {
    to: '/play/chain',
    emoji: '⚡',
    icon: <Zap className="h-6 w-6" aria-hidden="true" />,
    titleKey: 'play.chain.title',
    descKey: 'landing.mode.chain.desc',
    accent: 'text-primary bg-primary/15',
  },
  {
    to: '/play/daily',
    emoji: '🧠',
    icon: <Brain className="h-6 w-6" aria-hidden="true" />,
    titleKey: 'play.daily.title',
    descKey: 'landing.mode.daily.desc',
    accent: 'text-accent2 bg-accent2/15',
  },
  {
    to: '/duels',
    emoji: '⚔️',
    icon: <Swords className="h-6 w-6" aria-hidden="true" />,
    titleKey: 'duels.title',
    descKey: 'landing.mode.duels.desc',
    accent: 'text-accent bg-accent/15',
  },
  {
    to: '/weekly',
    emoji: '📅',
    icon: <CalendarDays className="h-6 w-6" aria-hidden="true" />,
    titleKey: 'weekly.title',
    descKey: 'landing.mode.weekly.desc',
    accent: 'text-success bg-success/15',
  },
]

interface Value {
  icon: ReactNode
  titleKey: StringKey
  descKey: StringKey
}

const VALUES: Array<Value> = [
  {
    icon: <Sparkles className="h-5 w-5" aria-hidden="true" />,
    titleKey: 'landing.value.free.title',
    descKey: 'landing.value.free.desc',
  },
  {
    icon: <Languages className="h-5 w-5" aria-hidden="true" />,
    titleKey: 'landing.value.bilingual.title',
    descKey: 'landing.value.bilingual.desc',
  },
  {
    icon: <Globe2 className="h-5 w-5" aria-hidden="true" />,
    titleKey: 'landing.value.global.title',
    descKey: 'landing.value.global.desc',
  },
]

function Features() {
  const t = useT()

  return (
    <section id="features" className="scroll-mt-24">
      <Reveal className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t('landing.features.eyebrow')}
        </span>
        <h2 className="text-balance text-3xl font-black tracking-tight text-fg sm:text-4xl">
          {t('landing.features.title')}
        </h2>
        <p className="max-w-xl text-pretty text-fg/60">
          {t('landing.features.subtitle')}
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODES.map((mode, i) => (
          <Reveal key={mode.to} delay={i * 0.06}>
            <Link
              to={mode.to}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-5 transition-colors hover:border-primary/60"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${mode.accent}`}
              >
                {mode.icon}
              </span>
              <h3 className="text-lg font-bold text-fg">
                <span aria-hidden="true" className="mr-1">
                  {mode.emoji}
                </span>
                {t(mode.titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-fg/60">
                {t(mode.descKey)}
              </p>
              <span className="mt-auto pt-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                {t('play.start')} →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Value props */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {VALUES.map((value, i) => (
          <Reveal key={value.titleKey} delay={i * 0.06}>
            <div className="flex h-full items-start gap-3 rounded-2xl border border-white/5 bg-surface/50 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary">
                {value.icon}
              </span>
              <div>
                <h3 className="font-bold text-fg">{t(value.titleKey)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg/60">
                  {t(value.descKey)}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

const APP_POINTS: Array<StringKey> = [
  'landing.app.point.daily',
  'landing.app.point.offline',
  'landing.app.point.friends',
]

function AppFunnel() {
  const t = useT()

  return (
    <section id="app" className="scroll-mt-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-8 sm:p-12">
          {/* Decorative brand glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-col gap-5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {t('landing.app.eyebrow')}
              </span>
              <h2 className="text-balance text-3xl font-black tracking-tight text-fg sm:text-4xl">
                {t('landing.app.title')}
              </h2>
              <p className="max-w-lg text-pretty text-fg/70">
                {t('landing.app.subtitle')}
              </p>

              <ul className="flex flex-col gap-2.5">
                {APP_POINTS.map((key) => (
                  <li key={key} className="flex items-center gap-3 text-sm text-fg/80">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {t(key)}
                  </li>
                ))}
              </ul>

              <StoreButtons className="mt-2" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  const t = useT()

  return (
    <footer className="flex flex-col gap-4 border-t border-white/10 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-fg/60">
        <Link to="/play" className="transition-colors hover:text-fg">
          {t('landing.footer.play')}
        </Link>
        <a href="#features" className="transition-colors hover:text-fg">
          {t('landing.footer.features')}
        </a>
        <Link to="/leaderboard" className="transition-colors hover:text-fg">
          {t('landing.footer.leaderboard')}
        </Link>
      </nav>
      <p className="text-fg/40">
        © {new Date().getFullYear()} BIGHEAD. {t('landing.footer.rights')}
      </p>
    </footer>
  )
}
