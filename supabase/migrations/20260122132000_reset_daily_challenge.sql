-- Reset today's daily challenge to pick a question with correct format
DELETE FROM daily_challenges WHERE challenge_date = CURRENT_DATE;
