# Live-Kritik einrichten

GitHub Pages ist statisches Hosting. Es kann keine Kommentare dauerhaft selbst speichern. Für die Live-Kritik wird deshalb ein kleines Backend benötigt.

## Supabase

1. Ein kostenloses Supabase-Projekt anlegen.
2. Im SQL Editor den Inhalt von `supabase_schema.sql` ausführen.
3. Unter Authentication einen Admin-Account anlegen.
4. Die User-ID dieses Accounts in `public.admins` eintragen:

```sql
insert into public.admins(user_id) values ('DEINE-USER-ID');
```

5. In `supabase-config.js` die Projekt-URL und den Publishable Key eintragen.
6. Niemals einen Secret-/Service-Role-Key in die Website eintragen. Der Admin-Löschschutz wird durch Postgres Row Level Security erzwungen.

Danach können eingeloggte Nutzer Kritik schreiben, alle Besucher können die freigegebenen Einträge lesen und ausschließlich Admins können Einträge löschen. Über Supabase Realtime können neue Einträge ohne Seiten-Reload erscheinen.
