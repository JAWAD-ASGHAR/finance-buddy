-- Budget threshold and spending pace alerts in notifications + email

alter type notification_type add value if not exists 'budget_alert';
