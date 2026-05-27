
DROP POLICY IF EXISTS "Users insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users update own subscription" ON public.user_subscriptions;

CREATE POLICY "Users insert own free subscription"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND plan = 'free');

CREATE POLICY "Users update own subscription to free"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND plan = 'free');
