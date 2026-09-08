create index if not exists idx_buttons_category_position on buttons (category, position);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_buttons_updated_at
  before update on buttons
  for each row
  execute function update_updated_at_column();