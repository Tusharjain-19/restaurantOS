ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_mobile TEXT,
ADD COLUMN IF NOT EXISTS account_details TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'Trial (7 Days)';