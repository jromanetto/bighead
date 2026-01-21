# BIGHEAD - Game Design Document

> Next-generation mobile quiz application for teens and adults
> Document generated: 2026-01-21

---

## Table of Contents

1. [Core Differentiation](#1-core-differentiation)
2. [Game Modes](#2-game-modes)
3. [Knowledge Map System](#3-knowledge-map-system)
4. [AI Innovations](#4-ai-innovations)
5. [Monetization Strategy](#5-monetization-strategy)
6. [Social & Viral Growth](#6-social--viral-growth)
7. [Long-Term Vision](#7-long-term-vision)

---

## 1. Core Differentiation

### The Knowledge Map
Instead of random disconnected questions, BIGHEAD visualizes your brain as an explorable map. Each topic is a territory. Answering questions "conquers" tiles. You see exactly what you know and what's unexplored. This transforms quizzing from "test-taking" into "territory expansion."

### Confidence Betting
Before seeing answer choices, you bet coins on your confidence (1x, 2x, 5x). High confidence + correct = big reward. High confidence + wrong = public shame (visible to opponents). Creates memorable moments and psychological depth.

### Living Questions
Questions that reference real-time data: "As of right now, which city is hotter — Tokyo or Cairo?" This makes BIGHEAD feel alive — you can't Google yesterday's quiz.

### The "Almost Right" System
AI detects when you were close (knew the era but not the exact year). Partial credit + explanation creates learning moments instead of binary frustration.

### Spectator Mode as Core Feature
High-stakes matches are watchable. Top players become personalities. Turns quiz into entertainment content, not just gameplay.

---

## 2. Game Modes

### 2.1 Chain Reaction

**Core Hook:** Every correct answer increases your multiplier. One wrong answer resets it to 1x. The tension builds with every question.

**Rules:**
- 10 questions per game
- Base points per question: 100
- Multiplier progression: 1x → 2x → 3x → 5x → 8x → 10x (caps at 10x)
- Wrong answer = multiplier resets to 1x, but you keep earned points
- Time bonus: +10 points per second remaining (15 sec per question)

**Example Round:**
```
Q1: Correct (1x) → 100 pts
Q2: Correct (2x) → 200 pts
Q3: Correct (3x) → 300 pts
Q4: WRONG (reset) → 0 pts, back to 1x
Q5: Correct (1x) → 100 pts
```

**Multiplayer Variant: Chain Duel**
- 2 players, same questions, separate chains
- See opponent's multiplier in real-time
- Mind games: Opponent at 8x while you're at 1x? Pressure is on them.

**Achievements:**
- "Perfect Chain" (10/10 correct)
- Track "Longest Chain Ever" as profile stat

---

### 2.2 Traitor

**Core Hook:** 4 players. One is secretly the Traitor — they see wrong answers displayed as correct. Others must identify the Traitor before the game ends.

**Setup:**
- 4 players, randomly matched or friends
- 1 player secretly assigned as Traitor
- 8 rounds of questions

**The Traitor's Challenge:**
- Traitor sees answer choices with ONE wrong answer highlighted as "correct"
- If Traitor picks the highlighted wrong answer → they blend in
- If Traitor picks the ACTUAL correct answer → suspicious
- Traitor wins by staying hidden until the end

**The Detective Phase:**
After round 4 and round 8:
- All players see everyone's answer history (correct/wrong, no details)
- 30 seconds to discuss (text chat or quick reactions)
- Each player votes who they think is the Traitor
- Majority vote = accused player eliminated

**Scoring:**

| Outcome | Points |
|---------|--------|
| Traitor survives to end | Traitor wins, +500 pts |
| Traitor caught | Detectives split +300 pts |
| Innocent falsely accused | Traitor wins, +500 pts |
| Correct answers | +50 pts each (everyone) |

**Edge Cases:**
- What if Traitor accidentally picks correct answer? Game shows it as correct. Traitor must adapt.
- What if vote is tied? No elimination, game continues.
- What if Traitor is caught early? Game ends, short but intense.

---

### 2.3 Auction Duel

**Core Hook:** 2 players. Before each question, you see only the category. Bid time from your clock to win the right to answer.

**Setup:**
- 2 players
- Each player starts with 60 seconds on their clock
- 10 question categories revealed one by one

**The Auction Flow:**
```
1. Category revealed: "European History"
2. Bidding opens (5 seconds)
   - Player A bids: 4 seconds
   - Player B bids: 6 seconds
   - Player A bids: 8 seconds
   - Player B passes
3. Player A wins the question, loses 8 seconds from clock
4. Question revealed, Player A has 15 seconds to answer
5. Correct = +100 pts | Wrong = 0 pts (time already lost)
```

**Strategic Depth:**
- **Bluffing:** Bid high on categories you're weak in to make opponent think you're strong
- **Economy:** Overbid early, run out of time later
- **Reading opponent:** They keep passing on Geography — attack that weakness
- **The pass:** Sometimes letting opponent take a hard question is smart

**Clock Pressure:**
- Your 60 seconds is for BOTH bidding and answering
- Run out of clock = you auto-pass all remaining auctions
- Opponent with time left can run the table

**Variants:**
- **Blind Auction:** Both players bid simultaneously, highest wins
- **All-In Mode:** You can bid your entire clock on one question

---

### 2.4 Party Mode (Pass & Play)

**Core Hook:** One phone, multiple players. Questions flow one after another. Perfect for parties, family, car rides.

**Setup:**
1. Choose number of players (2-8)
2. Each player enters their name
3. Choose categories (1 or more, or "All")
4. Choose number of questions (10, 20, 30, or Infinite)
5. Start

**The Flow:**
```
┌─────────────────────────────┐
│  Turn: JULIEN               │
│                             │
│  What is the capital        │
│  of Australia?              │
│                             │
│  ○ Sydney                   │
│  ○ Melbourne                │
│  ○ Canberra        ←        │
│  ○ Perth                    │
│                             │
│        ⏱️ 15s               │
└─────────────────────────────┘

        ↓ Answer given ↓

┌─────────────────────────────┐
│  ✓ CORRECT! +100 pts        │
│                             │
│  Pass the phone to:         │
│        → MARIE ←            │
│                             │
│     [Ready? Tap here]       │
└─────────────────────────────┘
```

**Game Options:**

| Option | Choices |
|--------|---------|
| Timer | 10s / 15s / 20s / None |
| Difficulty | Easy / Mixed / Expert |
| Order | Turn by turn / Random |
| Hints | Enabled / Disabled |

**Variants:**

**1. Survival Mode**
- One life per player
- Wrong answer = eliminated
- Last survivor wins

**2. Buzzer Mode**
- No turns — everyone watches the screen
- First to touch the screen answers
- Correct = +100 pts / Incorrect = -50 pts

**3. Team Mode**
- 2-4 teams
- Teams answer in turn
- Cumulative team score

**Key Advantages:**

| Advantage | Impact |
|----------|--------|
| No account needed | Zero friction for new players |
| Physical virality | "What app is this?" → download |
| Family use | Parents + kids = long-term retention |
| Offline mode possible | Pre-cached questions, playable anywhere |
| Gateway to account | "Create account to save your stats" |

---

## 3. Knowledge Map System

### 3.1 The Concept

Your brain becomes a visible map. Each knowledge domain is a territory. Answering questions "conquers" tiles. You SEE what you know and what remains unexplored.

**Map Structure:**
```
         ┌──────────────────────────────────────┐
         │            KNOWLEDGE MAP             │
         │                                      │
         │    ┌─────┐  ┌─────┐  ┌─────┐        │
         │    │HIST │──│ GEO │──│ SCI │        │
         │    │ 73% │  │ 45% │  │ 28% │        │
         │    └──┬──┘  └──┬──┘  └──┬──┘        │
         │       │        │        │           │
         │    ┌──┴──┐  ┌──┴──┐  ┌──┴──┐        │
         │    │MATH │──│ ART │──│SPORT│        │
         │    │ 61% │  │ 52% │  │ 89% │        │
         │    └─────┘  └─────┘  └─────┘        │
         │                                      │
         │   Total Brain: 52% discovered        │
         └──────────────────────────────────────┘
```

**Territories:** History, Geography, Science, Math, Art & Music, Pop Culture, Sports, Logic

**Visual Progression:**
- Gray tiles = unexplored
- Colored tiles = conquered (color by mastery level)
- Gold tiles = mastered (95%+ correct)

---

### 3.2 Conquering Tiles

**Territory Structure:**

Each major domain (e.g., History) contains ~20 tiles to conquer:

```
┌─────────────────────────────────────────────┐
│              HISTORY (73%)                  │
│                                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │████│ │████│ │████│ │▓▓▓▓│ │░░░░│        │
│  │Ant.│ │Rome│ │Med.│ │Ren.│ │Mod.│        │
│  │ ★★★│ │ ★★☆│ │ ★★★│ │ ★☆☆│ │ ☆☆☆│        │
│  └────┘ └────┘ └────┘ └────┘ └────┘        │
│                                             │
│  ████ = Mastered  ▓▓▓▓ = In progress  ░░░░ = Locked
└─────────────────────────────────────────────┘
```

**How to Conquer a Tile:**

| Step | Action | Result |
|------|--------|--------|
| 1. Unlock | Answer 5 questions in the domain | Tile becomes "In progress" |
| 2. Conquer | 10 correct answers on this tile | ★☆☆ (1 star) |
| 3. Reinforce | 25 correct answers, 70%+ accuracy | ★★☆ (2 stars) |
| 4. Master | 50 correct answers, 90%+ accuracy | ★★★ (3 stars) |

**Progressive Unlocking:**
- Adjacent tiles unlock when you conquer a tile
- Creates a "natural expansion" effect
- You can't skip directly to a distant tile

---

### 3.3 Rewards & Motivation

**Per-Tile Rewards:**

| Progression | Reward |
|-------------|--------|
| Tile unlocked | +50 coins |
| ★☆☆ (conquered) | +100 coins + tile badge |
| ★★☆ (reinforced) | +150 coins + thematic avatar frame |
| ★★★ (mastered) | +300 coins + exclusive title |

**Unlockable Titles:**

Each mastered tile gives a displayable profile title:
- "Pharaoh" (Egypt ★★★)
- "Roman Emperor" (Rome ★★★)
- "Knight" (Middle Ages ★★★)
- "Newton" (Physics ★★★)

**Complete Territory Rewards:**

| Domain | Reward |
|--------|--------|
| History 100% | "Legendary Historian" Avatar + 1000 coins |
| Geography 100% | Special map theme + 1000 coins |
| Science 100% | Exclusive answer animation |

**Global Milestones:**

| % Map | Reward |
|-------|--------|
| 25% | "Explorer" Badge |
| 50% | Animated avatar |
| 75% | Exclusive "Genius" theme |
| 100% | Legendary "BIGHEAD" title + permanent special effect |

**Decay System (Optional):**

Tiles "rust" if you don't practice:
- After 30 days without questions on a tile → loses one star
- Soft notification: "Your Rome tile needs maintenance!"
- Creates a reason to return even when you've "finished"

---

### 3.4 Social Layer

**Compare Maps:**

```
┌─────────────────────────────────────────────┐
│         JULIEN vs MARIE                     │
│                                             │
│  History    ███████░░░ 73%  vs  ██████████ 95% │
│  Geography  ████░░░░░░ 45%  vs  ███░░░░░░░ 32% │
│  Science    ██░░░░░░░░ 28%  vs  ████████░░ 78% │
│  Sports     █████████░ 89%  vs  █████░░░░░ 52% │
│                                             │
│  Total:     52%             vs  64%         │
│                                             │
│  [Challenge Marie in Science]               │
└─────────────────────────────────────────────┘
```

**Targeted Challenges:**
- "Challenge" button → launches a duel on THAT domain
- Loser sees: "Marie defended her Science territory"
- Winner sees: "You conquered ground on Julien!"

**Leaderboards by Domain:**

Per-territory leaderboards, not just global:
- "You're #1 in Sports! Defend your place"
- "You're #3 in History, -120 pts from #2"

**"Who Knows What" in Your Group:**

```
┌─────────────────────────────────────┐
│  🧠 YOUR GROUP'S EXPERTS            │
│                                     │
│  History → Marie (95%)              │
│  Sports → You! (89%)                │
│  Science → Alex (78%)               │
│  Pop Culture → Sam (91%)            │
│                                     │
│  Nobody dominates Geography...      │
│  [Become the first expert!]         │
└─────────────────────────────────────┘
```

**Clan/Team Map:**

If you join a clan:
- The clan has a COLLECTIVE map
- Each member contributes to progression
- "Our clan has conquered 78% of the entire map"

---

## 4. AI Innovations

### 4.1 Adaptive Questions (Edge-of-Knowledge)

**The Problem:** Fixed difficulty = everyone bored differently

**The Solution:** AI generates questions at the FRONTIER of what you know — never too easy, never impossible. Always in the "flow zone."

**How It Works:**

```
┌─────────────────────────────────────────────┐
│            YOUR AI PROFILE                  │
│                                             │
│  History:                                   │
│  ├─ Antiquity: STRONG (92% correct)         │
│  ├─ Rome: MEDIUM (71% correct)              │
│  ├─ Middle Ages: STRONG (88% correct)       │
│  └─ Renaissance: WEAK (45% correct)         │
│                                             │
│  → Next History question:                   │
│    MEDIUM difficulty on Renaissance         │
│    (to help you progress where you struggle)│
└─────────────────────────────────────────────┘
```

**The Algorithm:**

| Recent Performance | Next Question |
|--------------------|---------------|
| 3 correct in a row | +1 difficulty level |
| 2 wrong in a row | -1 difficulty level |
| Domain at <50% mastery | Prioritized for progress |
| Domain at >90% mastery | Rare "challenge" questions |

**Dynamic Difficulty in Matches:**

In 1v1 or Arena, AI balances in real-time to keep matches close and exciting.

---

### 4.2 Contextual Questions

**Types of Context:**

| Context | Example Question |
|---------|------------------|
| **Location** | "A famous battle happened 80km from here. Which one?" |
| **Current weather** | "It's 32°C where you are. Which capital is even hotter right now?" |
| **Date** | "On January 21st, a French king was executed. Who?" |
| **Current events** | "The team that won yesterday has how many total titles?" |
| **Time** | "It's 11pm. In which major city is it exactly noon?" |

**Living Questions (Real-Time Data):**

Questions impossible to Google because the answer changes:
- "Which CAC40 stock rose the most today?"
- "Who is currently #1 in ATP tennis?"
- "Which European capital has the lowest temperature right now?"

**Privacy:**
- Location = optional (asked once)
- If refused → contextual questions disabled, no penalty
- Data never shared, only used to generate questions

---

### 4.3 Intelligent Cache Architecture

**The Principle:** AI generates a question ONCE. Then it's stored and reused. AI becomes a "generator" that fills databases, not a service called every question.

**Database Structure:**

```
┌─────────────────────────────────────────────────────────┐
│                    ARCHITECTURE                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         GLOBAL BASE (server)                    │   │
│  │  • Universal questions                          │   │
│  │  • "What is the capital of Japan?"              │   │
│  │  • 500K+ questions, all languages               │   │
│  └─────────────────────────────────────────────────┘   │
│                        ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │      REGIONAL BASES (server, per country)       │   │
│  │  • Pre-generated contextual questions           │   │
│  │  • France: monuments, history, FR celebrities   │   │
│  │  • USA: presidents, NFL, US geography           │   │
│  │  • 50K questions per region                     │   │
│  └─────────────────────────────────────────────────┘   │
│                        ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │         LOCAL CACHE (device)                    │   │
│  │  • 5K downloaded questions                      │   │
│  │  • Enables offline mode                         │   │
│  │  • Weekly refresh                               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**When AI Is Called (and when NOT):**

| Situation | Source | AI Call? |
|-----------|--------|----------|
| Standard question | Global base | ❌ No |
| France/local culture question | Regional base FR | ❌ No |
| Offline mode | Local cache | ❌ No |
| "Live" question (weather, stocks) | Real-time API + template | ⚡ Minimal |
| Study mode (personal content) | AI generates | ✅ Yes |
| New tile without enough questions | AI generates → stores | ✅ Yes (once) |

**Pre-Generation Strategy:**

```
NIGHTLY BATCH (every day)
• Analyze which tiles lack questions
• Generate 1000 questions/night
• Cost: ~$5-10/day in API
• Result: Database grows automatically
```

**Estimated Costs at Scale:**

| Active Users/Month | Questions Served | AI Calls | AI Cost/Month |
|--------------------|------------------|----------|---------------|
| 10K | 500K | ~5K (base filling) | ~$50 |
| 100K | 5M | ~2K (mature base) | ~$20 |
| 1M | 50M | ~5K (new content) | ~$50 |

AI cost becomes NEGLIGIBLE at scale because the base absorbs demand.

---

### 4.4 Study Mode

**The Idea:** Upload any content (PDF, text, photo of notes). AI generates a personalized quiz. You study YOUR courses with BIGHEAD.

**Use Cases:**

| User | Content | Result |
|------|---------|--------|
| High school student | Philosophy course PDF | Quiz on Descartes, Kant, etc. |
| Med student | Anatomy notes | Quiz on bones, muscles |
| Professional in training | Technical documentation | Quiz on procedures |
| Curious person | Wikipedia article | Quiz to remember what they read |

**The Flow:**
1. Import content (PDF, Photo, Text, or paste a link)
2. AI analyzes and identifies concepts
3. Choose quiz length (10, 25, 50 questions)
4. Choose difficulty (Basic definitions, Comprehension, Deep analysis)
5. Generate quiz

**Question Types Generated:**
- **Definition:** "What is the Third Estate?"
- **Date/Fact:** "In what year was the Bastille stormed?"
- **Association:** "Which philosopher inspired the Declaration of Rights?"
- **True/False:** "Louis XVI was executed in 1792. True or false?"
- **Comprehension:** "Why did the Estates-General convocation cause a crisis?"

**Spaced Repetition:**
- App tracks what you remember
- Schedules optimal review times
- Notification: "Your French Revolution quiz needs review tomorrow"

**Monetization:**

| Tier | Limit |
|------|-------|
| Free | 1 document/month, 10 questions max |
| Premium | Unlimited documents, 50 questions/doc |
| Student Plan ($2.99/month) | Unlimited everything, spaced repetition, export |

---

### 4.5 AI Opponents with Personalities

**The Problem:** Playing solo against "the computer" = boring, no emotion.

**The Solution:** AI characters with distinct personalities, different play styles, and reactions that create real rivalry.

**The Characters:**

| Character | Play Style | Reactions |
|-----------|------------|-----------|
| **The Prof 🎓** | 90% correct, never rushed, explains answers | "Obviously, it was the Renaissance." |
| **The Gambler 🎰** | Always bets max, answers fast, sometimes wrong | "All in! ... Ah damn." |
| **The Turtle 🐢** | Slow but precise, uses all the time | "Let me think... There." |
| **The Troll 😈** | Uses power-ups constantly, taunts you | "Oops, I stole your points 😏" |
| **The Robot 🤖** | Constant, predictable, 75% correct | "Response recorded." |
| **The Rookie 👶** | Easy to beat, encouraging | "GG! You're too good!" |
| **The Champion 🏆** | Hard mode, 95% correct | "Not bad. But not enough." |
| **The Oracle 🔮** | Cryptic responses, mysterious style | "The stars told me..." |

**Unlocking:**

| Character | How to Unlock |
|-----------|---------------|
| Rookie | Available from start |
| Robot | Level 5 |
| Turtle | Win 10 games |
| Prof | Master 1 territory ★★★ |
| Gambler | Play 5 Chain Reaction games |
| Troll | Level 15 |
| Champion | Reach Gold rank |
| Oracle | Beat all other AIs |

**Persistent Rivalry:**

Each AI keeps a history against you:
- "Your record: 12 wins, 8 losses"
- "You owe me a rematch..."

**Weekly Boss:**

Each week, one AI character becomes the "Boss" with special rules and community leaderboard.

---

## 5. Monetization Strategy

### 5.1 Free vs Premium Structure

**Philosophy:**
- Never pay-to-win
- Free = complete experience but limited in volume
- Premium = comfort, not competitive advantage
- Everything affecting gameplay is earnable by playing

**FREE:**

| Feature | Free Limit |
|---------|------------|
| Daily games | 5 per day (recharges every 4h) |
| Modes | Solo, 1v1 Duel, Party Mode |
| Knowledge Map | Full access |
| Progression | Complete (just slower) |
| Ads | 1 ad between each game |
| Cosmetics | Basic (5 avatars, 2 themes) |

**PREMIUM (Subscription) — €4.99/month:**

- Unlimited games
- Zero ads
- All modes (4-player Arena, Tournaments)
- Detailed statistics
- 1 Streak Shield per week
- Monthly exclusive cosmetics
- Study Mode: 5 documents/month
- Visible Premium badge on profile

**The Crucial Point:**

A Free player can BEAT a Premium player. Always.
- Premium = play MORE
- Premium ≠ play BETTER

---

### 5.2 Battle Pass

**The Concept:** Each season (8 weeks), a new Battle Pass with 50 levels of rewards. Two tracks: free and premium.

**Structure:**

```
┌────────────────────────────────────────────────┐
│ Lvl │ FREE Track         │ PREMIUM Track 👑   │
├────────────────────────────────────────────────┤
│  1  │ 100 coins          │ "Compass" Avatar   │
│  5  │ Bronze frame       │ 300 coins          │
│ 10  │ 200 coins          │ "Jungle" Theme     │
│ 15  │ Streak Shield      │ Answer animation   │
│ 20  │ Rare avatar        │ 500 coins          │
│ 25  │ 300 coins          │ "Explorer" Title   │
│ 30  │ Silver frame       │ Victory effect     │
│ 40  │ 500 coins          │ Legendary avatar   │
│ 50  │ Gold frame         │ EXCLUSIVE Season Skin │
└────────────────────────────────────────────────┘

Premium Track Price: €9.99
```

**How to Earn XP:**

| Action | XP Earned |
|--------|-----------|
| Game completed | +50 XP |
| Victory | +100 XP |
| Daily challenge | +200 XP |
| Weekly challenge | +500 XP |
| New tile conquered | +150 XP |
| Tile mastered ★★★ | +300 XP |

**Season Themes:**

| Season | Theme | Cosmetics |
|--------|-------|-----------|
| S1 | Space | Astronauts, planets, stars |
| S2 | Ocean | Submarine, fish, treasures |
| S3 | Explorers | Jungle, maps, compasses |
| S4 | Retro Arcade | Pixel art, neons, 8-bit |

**Timing & Reasonable FOMO:**
- Season = 8 weeks (enough to finish without stress)
- Casual player (30 min/day) reaches level 35-40
- Regular player (1h/day) reaches level 50
- Free track items NEVER disappear
- Premium exclusive items return 1 year later (no toxic FOMO)

---

### 5.3 Cosmetics & Shop

**Cosmetic Types:**

| Type | Description | Visibility |
|------|-------------|------------|
| **Avatars** | Profile picture | Everywhere |
| **Frames** | Border around avatar | Profile, leaderboards |
| **Titles** | Text under your name | Profile, matches |
| **Themes** | Interface colors | You only |
| **Answer animations** | Effect on correct answer | In match |
| **Victory effects** | End-of-match animation | You + opponent |
| **Sounds** | Custom sound effects | You only |

**Rarity & Acquisition:**

```
⚪ COMMON     → Free or 100-200 coins
🟢 RARE       → 300-500 coins or gameplay
🔵 EPIC       → 800-1500 coins or Battle Pass
🟣 LEGENDARY  → 2000+ coins or events
🟡 EXCLUSIVE  → Limited time, never for sale
```

**Coin Economy:**

Free coin sources:

| Source | Coins |
|--------|-------|
| Game won | +20 |
| Daily challenge | +50 |
| Tile conquered | +100 |
| Tile mastered ★★★ | +300 |
| Battle Pass level (free) | +100-500 |
| Achievement unlocked | +50-200 |

Coin purchases:

| Amount | Price |
|--------|-------|
| 500 coins | €1.99 |
| 1,200 coins | €3.99 (+20%) |
| 3,000 coins | €8.99 (+33%) |
| 7,000 coins | €17.99 (+40%) |

**Ethical Rules:**

| Practice | BIGHEAD |
|----------|---------|
| Loot boxes / Gacha | ❌ Never |
| Hidden prices | ❌ Never |
| FOMO manipulation | ⚠️ Minimal (shop rotation, no pressure) |
| 1-click purchase | ❌ Always confirmation |
| Monthly purchase limit | ✅ Parental option (future) |

---

### 5.4 Events & Tournaments

**Event Types:**

| Type | Frequency | Entry | Rewards |
|------|-----------|-------|---------|
| **Themed event** | 1/month | Free | Exclusive cosmetics |
| **Weekly tournament** | 1/week | Free | Coins + ranking |
| **Premium tournament** | 2/month | 500 coins | Big prizes + rare cosmetics |
| **Private tournament** | On demand | Host pays | Customizable |

**Monthly Themed Event:**

Special missions over 2 weeks with themed questions and exclusive rewards.

**Weekly Tournament (Free):**

- 3 qualifying rounds
- Top 100 → Finals Sunday 8pm
- Rewards: Top 10 gets 2000 coins + exclusive avatar

**Premium Tournament (Entry Fee):**

- Entry: 500 coins
- Prize pool: 500,000 coins + Legendary Skin
- Format: Group phase + Direct elimination + LIVE commented final

**Private Tournaments:**

For friend groups, companies, streamers:
- 8 players: €2.99
- 16 players: €4.99
- 32 players: €7.99
- 64 players: €12.99

**Use Cases:**
- Friend group: Competitive quiz night
- Streamer/YouTuber: Tournament with community
- Company: Team building
- School/Association: Fun educational event
- Bar/Restaurant: Trivia night

**Sponsoring & Partnerships (Future):**

Brands pay to sponsor → players win real prizes → BIGHEAD takes commission.

---

## 6. Social & Viral Growth

### 6.1 Challenge Links

**The Concept:** After each game, a shareable link in 1 tap. Your friend clicks, plays the SAME quiz, and you compare scores. Zero friction.

**The Flow:**
1. Finish a game
2. "Challenge a Friend" button appears
3. Share to WhatsApp, iMessage, or copy link
4. Friend clicks link
5. Friend plays same quiz (same questions, same order)
6. Immediate comparison at the end

**Without App Installed:**
- Option to install BIGHEAD
- OR play in browser (limited version, 1 try)

**Viral Loop:**
```
Julien plays → shares his score
     ↓
Marie receives challenge → installs app → beats Julien
     ↓
Marie shares HER victory → challenges 3 other friends
     ↓
Each friend installs → replays → shares...
```

---

### 6.2 Auto-Generated Clips

**The Concept:** App detects highlight moments and automatically generates 10-15 second clips optimized for TikTok, Reels, and Stories.

**Detected Moments:**

| Moment | Why It's Viral |
|--------|----------------|
| **Comeback** | You were down 200 pts, win by 10 pts |
| **Perfect Round** | 10/10 without error |
| **Max Chain** | x10 multiplier maintained to the end |
| **Buzzer beater** | Correct answer at <1 second left |
| **Upset** | Beat someone 2 ranks above you |
| **Traitor reveal** | The moment the traitor is exposed |

**Clip Format:**
- Vertical (9:16)
- 10-15 seconds
- Auto-subtitled
- QR code for download
- Customizable music (Epic, Chill, Comic, None)

**Storage:**
- Free: 4/10 clips
- Premium: Unlimited

---

### 6.3 Social Leaderboards

**The Concept:** Global leaderboards are demotivating (you'll never be #1 worldwide). Leaderboards AMONG FRIENDS create healthy rivalry and a reason to return every week.

**Weekly Friend Leaderboard:**
- Resets every week
- Shows position changes (▲ +2, ▼ -1)
- "To pass Alex: 231 pts (≈ 3 victories)"
- [Challenge Alex now] button

**Competitive Notifications:**

| Event | Notification |
|-------|--------------|
| Passed | "😱 Marie just passed you! You're now #3" |
| Close to next | "Only 50 pts to pass Alex!" |
| End of week | "⏰ 2h left! You're #3, defend your place!" |
| You retake lead | "👑 You're back to #1 among friends!" |

**Head-to-Head History:**
- Win/loss record against each friend
- Current streak
- [Rematch!] button

**Automatic Rivalries:**
- App detects frequent close matches
- Creates "Official Rivals" status
- Badge unlocked for both players
- Your matches appear in friends' activity feed

**Per-Category Leaderboards:**
- "Who's best in History?" → Marie 👑
- "Who's best in Sports?" → You 👑
- Creates multiple ways to "win"

**Activity Feed:**
- See when friends win duels
- See when friends master tiles
- Quick reactions: 👏 🔥 😱 ⚔️

---

### 6.4 Referral & Organic Growth

**Referral Program:**

What your friend gets:
- 500 welcome coins
- 3 days free Premium
- 1 Streak Shield

What you get:
- 200 coins per friend signed up
- +300 coins if friend reaches level 10
- Milestone rewards (see below)

**Referral Milestones:**

| Friends | Reward |
|---------|--------|
| 3 | "Recruiter" Frame |
| 5 | 1000 coins |
| 10 | Exclusive "Ambassador" Avatar |
| 25 | 1 month free Premium |
| 50 | Legendary "Godfather" Title |
| 100 | Permanent badge + beta features access |

**Virality Built Into Gameplay:**

Moments where sharing is NATURAL:
- New level → "You're level 15! Share your progress"
- Rank achieved → "You're now GOLD! Show your friends"
- Record beaten → "New record! Who can do better?"
- Tile mastered → "Rome Expert ★★★! Challenge a friend"
- Close victory → "Won by 10 pts! Share this moment"
- Party Mode played → "You were 6! Invite them to the app"

**Party Mode → App Conversion:**

After Party Mode session, prompt to invite players who don't have the app.

**Daily Question:**

One question per day, everyone in the world gets the same one.
- Results posted: "Only 12% got this right"
- Shareable: "I was in the 12%"

**User-Generated Questions:**

- Submit questions
- If approved (AI + human review), your name appears
- You earn: 500 coins + "Creator" badge
- Shareable: "My question was played 12K times!"

**Viral Lever Summary:**

| Lever | Estimated K-Factor |
|-------|-------------------|
| Challenge links | +0.15 |
| Auto-generated clips | +0.10 |
| Friend leaderboards | +0.08 |
| Referral | +0.12 |
| Party Mode → App | +0.10 |
| Daily Question | +0.05 |

**Combined K-Factor target: ~0.6**
(Every 10 users bring 6 new users organically)

---

## 7. Long-Term Vision

### Year 1: The Game

- Ship MVP: Solo, 1v1, basic Arena
- Prove retention and monetization
- Build community, iterate on modes

### Year 2: The Platform

- Creator tools: Users build quiz packs
- Educational partnerships: Schools adopt BIGHEAD for learning
- API: Third parties embed BIGHEAD quizzes

### Year 3: The Ecosystem

- **Esports:** Sponsored competitive leagues, streamed finals
- **AI Tutor:** Personalized learning paths based on knowledge gaps
- **Physical Events:** Live BIGHEAD tournaments in cities
- **Cross-Platform:** TV app (family game night), web version, smart speaker integration

### The Vision Statement

BIGHEAD becomes the *infrastructure for knowledge games* — not just a quiz app, but the platform where any knowledge-based competition happens. Like how Twitch became the home for game streaming, BIGHEAD becomes the home for trivia, learning games, and intellectual competition.

---

## Appendix: Quick Reference

### Game Modes Summary

| Mode | Players | Hook |
|------|---------|------|
| Chain Reaction | 1-2 | Multiplier builds, one wrong resets |
| Traitor | 4 | Find the player seeing wrong answers |
| Auction Duel | 2 | Bid time for question rights |
| Party Mode | 2-8 local | One phone, everyone plays |

### Monetization Summary

| Revenue Stream | Price |
|----------------|-------|
| Premium subscription | €4.99/month or €39.99/year |
| Battle Pass | €9.99/season |
| Coins | €1.99 - €17.99 |
| Private tournaments | €2.99 - €12.99 |

### Key Metrics Targets

| Metric | Target |
|--------|--------|
| D1 Retention | >40% |
| D7 Retention | >20% |
| D30 Retention | >10% |
| Viral K-Factor | >0.5 |
| Free → Premium conversion | >5% |
| ARPU (paying users) | >€8/month |

---

*Document generated through collaborative brainstorming session.*
*Ready for technical implementation planning.*
