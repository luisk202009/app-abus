-- Add step_description column to user_route_progress
ALTER TABLE user_route_progress 
ADD COLUMN step_description text;

-- Update existing data with descriptions from templates
UPDATE user_route_progress urp
SET step_description = rts.description
FROM user_active_routes uar, route_template_steps rts
WHERE urp.user_route_id = uar.id
AND rts.template_id = uar.template_id
AND rts.title = urp.step_title;