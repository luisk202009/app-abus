-- Sync existing total_routes_created with actual route counts
UPDATE onboarding_submissions os
SET total_routes_created = sub.cnt
FROM (
  SELECT user_id, COUNT(*) as cnt 
  FROM user_active_routes 
  WHERE user_id IS NOT NULL 
  GROUP BY user_id
) sub
WHERE os.user_id = sub.user_id
  AND os.user_id IS NOT NULL;