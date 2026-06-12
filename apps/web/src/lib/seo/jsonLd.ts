/**
 * Blocs JSON-LD (Schema.org) injectés en SSR via les `head()` TanStack.
 * Trois niveaux :
 *  - root : Organization + WebSite (fondation entité, toutes les pages)
 *  - landing : le jeu web (VideoGame+WebApplication) + les 2 apps mobiles
 *  - catégorie : WebPage + about(Wikipédia) + BreadcrumbList + FAQPage
 *
 * Décisions (audit GEO 2026-06) : pas de SearchAction (pas de page recherche,
 * sitelinks searchbox retirée par Google fin 2024) ; pas de schema.org/Quiz
 * (réservé au contenu éducatif avec questions marquées — nos pages sont des
 * landings de jeu) ; aggregateRating omis (3 notes iOS, n trop faible).
 */

import { SITE_URL } from '#/lib/funnel/appLinks'
import { buildFaq } from './categoryContent'

import type { CategorySeoContent } from './categoryContent'

const ORG_ID = 'https://bighead-quizz.com/#organization'
const WEBSITE_ID = `${SITE_URL}/#website`
const GAME_ID = `${SITE_URL}/#game`

/** Organization + WebSite — toutes les pages (root head). */
export function rootJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'BIGHEAD',
        url: 'https://bighead-quizz.com',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo512.png`,
        },
        description:
          'BIGHEAD est un jeu de quiz de culture générale gratuit et bilingue (français/anglais), disponible sur le web, iOS et Android : plus de 36 000 questions dans 11 catégories, duels, défis quotidiens et hebdomadaires.',
        foundingDate: '2026',
        sameAs: [
          SITE_URL,
          'https://apps.apple.com/app/id6758253365',
          'https://play.google.com/store/apps/details?id=com.jroma51.bighead',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: 'BIGHEAD',
        alternateName: 'BIGHEAD Quiz',
        url: SITE_URL,
        inLanguage: ['fr', 'en'],
        publisher: { '@id': ORG_ID },
      },
    ],
  })
}

/** Le jeu web + les 2 apps mobiles — landing `/` uniquement. */
export function landingJsonLd(): string {
  const freeOffer = {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['VideoGame', 'WebApplication'],
        '@id': GAME_ID,
        name: 'BIGHEAD',
        url: SITE_URL,
        description:
          'Le quiz qui défie ton cerveau : plus de 36 000 questions dans 11 catégories, 4 modes de jeu (Chain Reaction, Daily Brain, Duels, Défi de la semaine), classement mondial. Gratuit, sans compte obligatoire, en français et en anglais.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        genre: ['Quiz', 'Trivia'],
        gamePlatform: 'Web browser',
        playMode: ['SinglePlayer', 'MultiPlayer'],
        inLanguage: ['fr', 'en'],
        isAccessibleForFree: true,
        image: `${SITE_URL}/og.png`,
        screenshot: `${SITE_URL}/og.png`,
        offers: freeOffer,
        author: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'MobileApplication',
        '@id': `${SITE_URL}/#ios-app`,
        name: 'BIGHEAD - Quiz Culture',
        operatingSystem: 'iOS',
        applicationCategory: 'GameApplication',
        installUrl: 'https://apps.apple.com/app/id6758253365',
        contentRating: '4+',
        inLanguage: ['fr', 'en'],
        offers: freeOffer,
        author: { '@id': ORG_ID },
      },
      {
        '@type': 'MobileApplication',
        '@id': `${SITE_URL}/#android-app`,
        name: 'BIGHEAD',
        operatingSystem: 'Android',
        applicationCategory: 'GameApplication',
        installUrl:
          'https://play.google.com/store/apps/details?id=com.jroma51.bighead',
        contentRating: 'PEGI 3',
        inLanguage: ['fr', 'en'],
        offers: freeOffer,
        author: { '@id': ORG_ID },
      },
    ],
  })
}

/**
 * WebPage + about + BreadcrumbList + FAQPage pour une page `/quiz/$category`.
 * La FAQ reprend mot pour mot le texte FR visible sur la page (le SSR est en
 * français) — condition stricte du markup FAQPage.
 */
export function categoryJsonLd(
  slug: string,
  label: string,
  title: string,
  description: string,
  content: CategorySeoContent,
): string {
  const url = `${SITE_URL}/quiz/${slug}`
  const faq = buildFaq(label, content, 'fr')
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: title,
        description,
        inLanguage: 'fr',
        isPartOf: { '@id': WEBSITE_ID },
        about: {
          '@type': 'Thing',
          name: content.about.name,
          sameAs: content.about.wikipedia,
        },
        mainEntity: { '@id': GAME_ID },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          // Dernier item sans `item` : l'URL implicite est la page courante
          // (guidelines Google).
          { '@type': 'ListItem', position: 2, name: `Quiz ${label}` },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  })
}
