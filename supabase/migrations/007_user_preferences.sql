-- User preferences: currency, location, onboarding

alter table public.profiles
  add column currency_code text not null default 'GBP'
    check (currency_code in ('GBP', 'USD', 'EUR', 'CAD', 'AUD')),
  add column country_code text,
  add column onboarding_completed_at timestamptz;

alter table public.shared_expenses
  add column currency_code text not null default 'GBP'
    check (currency_code in ('GBP', 'USD', 'EUR', 'CAD', 'AUD'));

alter table public.settlements
  add column currency_code text not null default 'GBP'
    check (currency_code in ('GBP', 'USD', 'EUR', 'CAD', 'AUD'));

-- Existing users skip onboarding
update public.profiles
set onboarding_completed_at = created_at
where onboarding_completed_at is null;
