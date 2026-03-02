-- Migration: Normalize all legacy French category codes to standard English codes
-- This ensures consistency across all questions in the database
-- Date: 2026-03-02

-- Map legacy French codes to standard English codes
UPDATE questions SET category = 'general' WHERE category = 'culture_generale';
UPDATE questions SET category = 'history' WHERE category = 'histoire';
UPDATE questions SET category = 'geography' WHERE category = 'geographie';
UPDATE questions SET category = 'music' WHERE category = 'musique';
UPDATE questions SET category = 'science' WHERE category = 'sciences';
UPDATE questions SET category = 'literature' WHERE category = 'litterature';
UPDATE questions SET category = 'technology' WHERE category = 'technologie';
UPDATE questions SET category = 'animals' WHERE category = 'animaux';
UPDATE questions SET category = 'sport' WHERE category = 'football';
UPDATE questions SET category = 'general' WHERE category = 'pop_culture';
UPDATE questions SET category = 'technology' WHERE category = 'jeux_video';

-- Also normalize daily_questions categories for consistency
UPDATE daily_questions SET category = 'general' WHERE category = 'culture_generale';
UPDATE daily_questions SET category = 'history' WHERE category = 'histoire';
UPDATE daily_questions SET category = 'geography' WHERE category = 'geographie';
UPDATE daily_questions SET category = 'music' WHERE category = 'musique';
UPDATE daily_questions SET category = 'science' WHERE category = 'sciences';
UPDATE daily_questions SET category = 'literature' WHERE category = 'litterature';
UPDATE daily_questions SET category = 'technology' WHERE category = 'technologie';
UPDATE daily_questions SET category = 'animals' WHERE category = 'animaux';
UPDATE daily_questions SET category = 'sport' WHERE category = 'football';
UPDATE daily_questions SET category = 'general' WHERE category = 'pop_culture';
UPDATE daily_questions SET category = 'technology' WHERE category = 'jeux_video';
