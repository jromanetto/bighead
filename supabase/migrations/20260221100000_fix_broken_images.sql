-- Migration: Fix broken question images (HTTP 404)
-- Date: 2026-02-21
--
-- Analysis performed on 2026-02-21:
--   - 140 questions have image_url set
--   - Domains: flagcdn.com (50, all OK), upload.wikimedia.org (45), images.unsplash.com (45, all OK)
--   - 10 wikimedia URLs return HTTP 404
--
-- Broken URLs (all upload.wikimedia.org):
--   1. Toyota    - commons: Toyota_carance.svg (typo in filename, should be Toyota_carancee or similar)
--   2. Intel     - commons: Intel-logo.svg (file removed/renamed on wikimedia)
--   3. Samsung   - commons: Samsung_Logo.svg (file removed/renamed on wikimedia)
--   4. LG        - commons: LG_logo_(2015).svg (file removed/renamed on wikimedia)
--   5. Burger King - commons: Burger_King_logo_(1999).svg (file removed/renamed on wikimedia)
--   6. Chanel    - commons: Chanel_logo_interlocking_cs.svg (file removed/renamed on wikimedia)
--   7. Red Bull  - en: Red_Bull.svg (file removed/renamed on wikimedia)
--   8. Ferrari   - en: Ferrari-Logo.svg (file removed/renamed on wikimedia)
--   9. Porsche   - en: Porsche_logo.svg (file removed/renamed on wikimedia)
--  10. Rolex     - en: Rolex_logo.svg (file removed/renamed on wikimedia)
--
-- Action: Set image_url = NULL for these 10 questions so the app
-- gracefully shows no image instead of a broken image placeholder.

UPDATE questions SET image_url = NULL
WHERE id IN (
  '9e0ded41-f01a-471e-b204-6c853906c413',  -- Toyota (commons, typo in SVG filename)
  '8c4a0dfd-afb9-431b-8f6a-59d06e84751e',  -- Intel (commons)
  '99d8705d-cd39-44bd-9439-eb32e1243540',  -- Samsung (commons)
  '052bad52-d54b-4336-ac49-4a99e667c105',  -- LG (commons)
  'c4f3545c-6bdc-4a76-8eb5-9b94a891f166',  -- Burger King (commons)
  'f32e0f64-a2e9-4156-9073-2ba643ce484d',  -- Chanel (commons)
  '5cde47bb-af40-43a2-b52b-4504c0f749de',  -- Red Bull (en)
  '30f64341-474d-467b-bb04-0cee6f4f569a',  -- Ferrari (en)
  '1fad3791-264c-4ba4-a752-5a658cb783a6',  -- Porsche (en)
  'b1d145dc-8902-4193-ac41-f910dd9b02a6'   -- Rolex (en)
);
