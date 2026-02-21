-- Create trigger to auto-increment total_routes_created on user_active_routes INSERT
CREATE TRIGGER trg_increment_routes
AFTER INSERT ON public.user_active_routes
FOR EACH ROW
EXECUTE FUNCTION public.increment_total_routes_created();