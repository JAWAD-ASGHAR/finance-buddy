-- Add Pakistani rupee and Indian rupee to currency checks

alter table public.profiles
  drop constraint if exists profiles_currency_code_check;

alter table public.profiles
  add constraint profiles_currency_code_check
  check (currency_code in ('GBP', 'USD', 'EUR', 'CAD', 'AUD', 'PKR', 'INR'));

alter table public.shared_expenses
  drop constraint if exists shared_expenses_currency_code_check;

alter table public.shared_expenses
  add constraint shared_expenses_currency_code_check
  check (currency_code in ('GBP', 'USD', 'EUR', 'CAD', 'AUD', 'PKR', 'INR'));

alter table public.settlements
  drop constraint if exists settlements_currency_code_check;

alter table public.settlements
  add constraint settlements_currency_code_check
  check (currency_code in ('GBP', 'USD', 'EUR', 'CAD', 'AUD', 'PKR', 'INR'));
