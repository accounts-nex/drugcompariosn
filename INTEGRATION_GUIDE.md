# Complete Setup Guide for Drug Comparison Report System

Dit document bevat ALLES wat je nodig hebt om het Report Configuration System werkend te krijgen. Volg elke stap exact zoals beschreven.

---

## Inhoudsopgave

1. [Wat Je Moet Doen](#wat-je-moet-doen)
2. [Deel 1: Supabase Account Aanmaken](#deel-1-supabase-account-aanmaken)
3. [Deel 2: n8n Account Aanmaken](#deel-2-n8n-account-aanmaken)
4. [Deel 3: Authenticatie Koppelen](#deel-3-authenticatie-koppelen)
5. [Deel 4: Supabase met n8n Verbinden](#deel-4-supabase-met-n8n-verbinden)
6. [Deel 5: Geef Ons Toegang](#deel-5-geef-ons-toegang)
7. [Wat Wij Doen Na Toegang](#wat-wij-doen-na-toegang)
8. [Database SQL Code](#database-sql-code)
9. [Environment Configuratie](#environment-configuratie)
10. [Troubleshooting](#troubleshooting)

---

## Wat Je Moet Doen

Je moet de volgende taken uitvoeren:

1. Een Supabase account en project aanmaken
2. Een n8n account aanmaken
3. Je bestaande Drug Comparison authenticatie systeem koppelen aan deze frontend
4. Ons toegang geven tot je Supabase en n8n accounts zodat wij de automatisering kunnen opzetten

**Geschatte tijd: 30-45 minuten**

---

## Deel 1: Supabase Account Aanmaken

Supabase is de database die alle rapport configuraties opslaat.

### Stap 1.1: Ga naar de Supabase Website

1. Open je browser
2. Ga naar: **https://supabase.com**
3. Klik op de groene **"Start your project"** knop (rechtsboven)

### Stap 1.2: Account Aanmaken

1. Je kunt je aanmelden met:
   - **GitHub** (aanbevolen als je een GitHub account hebt)
   - **Email en wachtwoord**
2. Bij email:
   - Voer je email adres in
   - Maak een sterk wachtwoord
   - Klik op **"Sign Up"**
   - Check je email en klik op de bevestigingslink

### Stap 1.3: Nieuw Project Aanmaken

Na het inloggen:

1. Klik op de **"New Project"** knop
2. Vul het formulier in:
   - **Name**: `drugcomparison-reports` (of een andere naam)
   - **Database Password**: Maak een STERK wachtwoord en **BEWAAR DIT ERGENS VEILIG** (je hebt dit later nodig!)
   - **Region**: Kies `West EU (London)` of de regio dichtst bij je gebruikers
3. Klik op **"Create new project"**
4. **WACHT** - het duurt 1-2 minuten om het project op te zetten

### Stap 1.4: Haal Je Project Credentials Op

Nadat het project is aangemaakt:

1. Klik op **"Project Settings"** (het tandwiel icoon in de linker sidebar, onderaan)
2. Klik op **"API"** in het linker menu
3. Je ziet twee belangrijke waarden - **KOPIEER EN BEWAAR DEZE**:

```
Project URL: https://xxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx... (GEHEIM!)
```

**BELANGRIJK**: Bewaar deze waarden veilig! Je hebt ze nodig voor de frontend configuratie.

### Stap 1.5: Database Tabellen Aanmaken

Je moet de database tabellen aanmaken. Dit doe je door SQL code uit te voeren:

1. Klik in de linker sidebar op **"SQL Editor"**
2. Klik op **"New Query"**
3. Kopieer de VOLLEDIGE SQL code uit [Sectie 8: Database SQL Code](#database-sql-code) hieronder
4. Plak het in de SQL Editor
5. Klik op **"Run"** (de groene play knop)
6. Je zou een "Success" bericht moeten zien

### Stap 1.6: Controleer of Tabellen Zijn Aangemaakt

1. Klik in de linker sidebar op **"Table Editor"**
2. Je zou twee tabellen moeten zien:
   - `active_report_schedules`
   - `inactive_report_schedules`

Als je deze tabellen ziet, is de database setup compleet!

---

## Deel 2: n8n Account Aanmaken

n8n is de automatiseringstool die de geplande rapport emails verstuurt.

### Stap 2.1: Ga naar de n8n Website

1. Open je browser
2. Ga naar: **https://n8n.io**
3. Klik op de **"Get started free"** knop

### Stap 2.2: Account Aanmaken

1. Klik op **"Start for free"**
2. Meld je aan met:
   - Je email adres
   - Maak een wachtwoord
   - Of gebruik Google/GitHub om je aan te melden
3. Bevestig je email indien nodig

### Stap 2.3: Workflow Aanmaken

Na het inloggen:

1. Je ziet het n8n dashboard
2. Klik op **"Create Workflow"** of de **"+"** knop
3. Je kunt het voor nu leeg laten - wij importeren de workflow later

### Stap 2.4: Belangrijke n8n Instellingen

1. Klik op je profiel icoon (rechtsboven)
2. Klik op **"Settings"**
3. Noteer je n8n cloud URL - het ziet er uit als: `https://jouwNaam.app.n8n.cloud`

---

## Deel 3: Authenticatie Koppelen

Dit is het belangrijkste deel. De frontend moet weten WIE is ingelogd zodat het hun rapporten kan opslaan.

### Wat We Van Je Nodig Hebben

Momenteel gebruikt het systeem een simpele email input voor testen. Voor productie moet je het koppelen aan je Drug Comparison authenticatie systeem.

### Optie A: Als Drug Comparison Supabase Auth Gebruikt

Als je hoofd Drug Comparison website al Supabase gebruikt voor login:

1. Je kunt HETZELFDE Supabase project gebruiken
2. Of configureer deze frontend om te verbinden met je bestaande Supabase project

**Om te verbinden met je bestaande Supabase project:**

1. Open het bestand `.env` in dit project
2. Vervang de waarden met JOUW Supabase project credentials:

```env
VITE_SUPABASE_URL=https://JOUW-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=jouw-anon-key-hier
```

### Optie B: Als Drug Comparison Custom Authenticatie Gebruikt

Als je website een ander login systeem gebruikt (zoals PHP sessions, JWT tokens, etc.):

**Je moet ons vertellen:**

1. Welke technologie gebruik je voor authenticatie? (PHP sessions? JWT? OAuth?)
2. Hoe kunnen we de ingelogde gebruiker's email of user ID krijgen?
3. Kun je een API endpoint geven dat de huidige gebruiker's informatie teruggeeft?

**Voorbeeld van wat we nodig hebben:**

Een API endpoint zoals:
```
GET https://www.drugcomparison.co.uk/api/current-user
Response: { "email": "user@example.com", "customer_id": "FO1SP6", "name": "John" }
```

### Optie C: Dit Systeem Embedden in Drug Comparison Website

Als je dit rapport configuratie systeem wilt embedden in je bestaande Drug Comparison dashboard:

1. De frontend is gebouwd als een standalone React applicatie
2. Het kan worden ge-embed in een iframe
3. Of de code kan worden geïntegreerd in je bestaande website

**Voor iframe embedding:**
```html
<iframe src="https://jouw-report-portal.com" width="100%" height="800px"></iframe>
```

**Je moet de gebruikersinformatie doorgeven. Opties:**

1. Geef email door als URL parameter: `https://jouw-report-portal.com?email=user@example.com`
2. Gebruik postMessage om user data naar de iframe te sturen
3. Gebruik gedeelde cookies/localStorage als het op hetzelfde domein staat

---

## Deel 4: Supabase met n8n Verbinden

De n8n automatisering moet uit je Supabase database lezen om te weten welke rapporten te versturen.

### Stap 4.1: Haal Supabase API Credentials voor n8n

1. Ga naar je Supabase Dashboard
2. Klik op **"Project Settings"** (tandwiel icoon)
3. Klik op **"API"**
4. Kopieer deze waarden:
   - **Project URL**
   - **service_role key** (NIET de anon key - dit is de geheime sleutel!)

**WAARSCHUWING**: De service_role key is een GEHEIME sleutel. Deel deze nooit publiekelijk of zet deze niet in frontend code!

### Stap 4.2: Wij Configureren n8n Voor Je

Nadat je ons toegang geeft tot je n8n account, zullen wij:

1. De workflow importeren (het JSON bestand dat je hebt)
2. De Supabase verbinding configureren
3. De Gmail verbinding voor het versturen van emails configureren
4. De hele flow testen

---

## Deel 5: Geef Ons Toegang

Om de setup te voltooien, hebben we toegang tot je accounts nodig. Dit is wat je met ons moet delen:

### Supabase Toegang

**Optie 1: Voeg ons toe als team member (AANBEVOLEN)**

1. Ga naar je Supabase Dashboard
2. Klik op je organisatie naam (linksboven)
3. Klik op **"Team"**
4. Klik op **"Invite"**
5. Voer ons email in: **[VRAAG ONS WELK EMAIL TE UITNODIGEN]**
6. Selecteer rol: **"Developer"**
7. Klik op **"Send invite"**

**Optie 2: Deel credentials direct (minder veilig)**

Stuur ons:
- Project URL
- Service role key

### n8n Toegang

**Optie 1: Voeg ons toe als team member (AANBEVOLEN)**

1. Ga naar n8n dashboard
2. Klik op je profiel icoon (rechtsboven)
3. Ga naar **"Settings"** > **"Users"**
4. Klik op **"Invite user"**
5. Voer ons email in: **[VRAAG ONS WELK EMAIL TE UITNODIGEN]**
6. Klik op **"Invite"**

**Optie 2: Deel login credentials (minder veilig)**

Stuur ons:
- n8n login email
- n8n login wachtwoord

### Dashboard Toegang

Voor testen hebben we ook nodig:

1. Een test account op je Drug Comparison platform
2. Een geldig customer_id dat we kunnen gebruiken voor testen

---

## Wat Wij Doen Na Toegang

Zodra je ons toegang geeft, zullen wij:

### 1. n8n Workflow Opzetten

- De workflow importeren uit het JSON bestand
- De Supabase verbinding configureren
- Gmail SMTP/OAuth configureren voor email versturen
- De webhook endpoints opzetten

### 2. Het Systeem Testen

- Een test rapport configuratie aanmaken
- Controleren of data wordt opgeslagen in Supabase
- Een test email triggeren
- Controleren of de geplande trigger werkt

### 3. Authenticatie Verbinden

- Helpen integreren met je bestaande auth systeem
- Zorgen dat gebruikers alleen hun eigen rapporten kunnen zien
- Goede security opzetten

### 4. Finale Testing

- Volledige end-to-end test met echte klant data
- Email delivery controleren
- Checken of alle filters correct werken

---

## Database SQL Code

Kopieer ALLE onderstaande SQL code en plak het in de Supabase SQL Editor:

```sql
/*
  =====================================================
  DRUG COMPARISON REPORT CONFIGURATION SYSTEM
  Complete Database Setup
  =====================================================

  Dit script maakt alle benodigde tabellen aan voor het
  Report Configuration System.

  TABELLEN:
  1. active_report_schedules - Actieve rapport configuraties
  2. inactive_report_schedules - Inactieve rapport configuraties

  KOLOMMEN IN ELKE TABEL:
  - id: Unieke identifier (UUID)
  - email: Email van de gebruiker die het rapport heeft aangemaakt
  - report_name: Naam van het rapport
  - person_name: Naam van de contactpersoon
  - contact_email: Array van email adressen die het rapport ontvangen
  - customer_id: Klant ID voor data filtering
  - report_type: Type rapport
  - date_range: Datum bereik voor rapport data
  - apply_loss_threshold: Of loss thresholds moeten worden toegepast
  - get_all_data: Of alle data moet worden opgehaald
  - total_loss_per_order_pack: Threshold waarde
  - loss_per_ordered_pack: Threshold waarde
  - grand_total_loss: Threshold waarde
  - frequency: 'daily', 'weekly', of 'monthly'
  - delivery_day_of_week: 0-6 voor wekelijkse rapporten (0 = Zondag)
  - delivery_day_of_month: 1-28 voor maandelijkse rapporten
  - delivery_time_hour: Uur van de dag om te versturen (0-23)
  - send_notification_no_data: Stuur email ook als er geen data is
  - created_at: Aanmaak timestamp
  - updated_at: Laatste update timestamp
*/

-- =====================================================
-- STAP 1: Maak active_report_schedules tabel
-- =====================================================

CREATE TABLE IF NOT EXISTS active_report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  report_name text NOT NULL DEFAULT 'Unnamed Report',
  person_name text NOT NULL,
  contact_email text[] NOT NULL DEFAULT '{}',
  customer_id text NOT NULL,
  report_type text NOT NULL DEFAULT 'Pack Optimization Loss Report',
  date_range text,
  apply_loss_threshold boolean NOT NULL DEFAULT false,
  get_all_data boolean NOT NULL DEFAULT false,
  total_loss_per_order_pack numeric,
  loss_per_ordered_pack numeric,
  grand_total_loss numeric,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  delivery_day_of_week integer CHECK (delivery_day_of_week >= 0 AND delivery_day_of_week <= 6),
  delivery_day_of_month integer CHECK (delivery_day_of_month >= 1 AND delivery_day_of_month <= 28),
  delivery_time_hour integer NOT NULL DEFAULT 9 CHECK (delivery_time_hour >= 0 AND delivery_time_hour <= 23),
  send_notification_no_data boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- STAP 2: Maak inactive_report_schedules tabel
-- =====================================================

CREATE TABLE IF NOT EXISTS inactive_report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  report_name text NOT NULL DEFAULT 'Unnamed Report',
  person_name text NOT NULL,
  contact_email text[] NOT NULL DEFAULT '{}',
  customer_id text NOT NULL,
  report_type text NOT NULL DEFAULT 'Pack Optimization Loss Report',
  date_range text,
  apply_loss_threshold boolean NOT NULL DEFAULT false,
  get_all_data boolean NOT NULL DEFAULT false,
  total_loss_per_order_pack numeric,
  loss_per_ordered_pack numeric,
  grand_total_loss numeric,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  delivery_day_of_week integer CHECK (delivery_day_of_week >= 0 AND delivery_day_of_week <= 6),
  delivery_day_of_month integer CHECK (delivery_day_of_month >= 1 AND delivery_day_of_month <= 28),
  delivery_time_hour integer NOT NULL DEFAULT 9 CHECK (delivery_time_hour >= 0 AND delivery_time_hour <= 23),
  send_notification_no_data boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- STAP 3: Maak indexes voor betere performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_active_reports_email ON active_report_schedules(email);
CREATE INDEX IF NOT EXISTS idx_inactive_reports_email ON inactive_report_schedules(email);
CREATE INDEX IF NOT EXISTS idx_active_reports_customer_id ON active_report_schedules(customer_id);
CREATE INDEX IF NOT EXISTS idx_inactive_reports_customer_id ON inactive_report_schedules(customer_id);

-- =====================================================
-- STAP 4: Row Level Security (RLS) configuratie
-- =====================================================

-- Zet RLS UIT voor nu (tot authenticatie is geimplementeerd)
-- Dit is tijdelijk - na integratie met je auth systeem zetten we dit weer aan
ALTER TABLE active_report_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE inactive_report_schedules DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- KLAAR!
-- =====================================================
-- Als je "Success" ziet, zijn de tabellen aangemaakt.
-- Ga naar Table Editor in de sidebar om te controleren.
```

---

## Environment Configuratie

### .env Bestand

Maak of update het `.env` bestand in de root van het project met je Supabase credentials:

```env
VITE_SUPABASE_URL=https://jouw-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=jouw-anon-key-hier
```

### Waar Vind Je Deze Waarden

1. Ga naar je Supabase Dashboard
2. Selecteer je project
3. Ga naar Settings > API
4. Kopieer de "Project URL" voor `VITE_SUPABASE_URL`
5. Kopieer de "anon public" key voor `VITE_SUPABASE_ANON_KEY`

---

## n8n Workflow Informatie

De n8n workflow die we gaan importeren bevat:

### Triggers
- **Schedule Trigger**: Draait elk uur om te checken welke rapporten verstuurd moeten worden
- **Webhook**: Voor het versturen van test emails vanuit de frontend

### Supabase Integratie
- Leest van de `active_report_schedules` tabel
- Haalt rapport configuraties op gebaseerd op frequentie en tijd

### Email Versturen
- Gebruikt Gmail OAuth voor het versturen van emails
- Genereert HTML email templates met rapport data
- Maakt Excel bijlages met gedetailleerde data

### Data Processing
- Haalt data op van de Drug Comparison API
- Past filters toe gebaseerd op configuratie
- Berekent totalen en samenvattingen

---

## Troubleshooting

### "Kan niet verbinden met Supabase"

1. Check of je `.env` bestand de correcte waarden heeft
2. Zorg dat het Supabase project draait (niet gepauzeerd)
3. Check of de Project URL geen trailing slash heeft

### "Test email wordt niet verstuurd"

1. Zorg dat de n8n workflow is geactiveerd
2. Check of Gmail OAuth correct is geconfigureerd
3. Kijk naar de n8n execution logs voor errors

### "Data wordt niet opgeslagen"

1. Check de browser console voor errors (F12 > Console)
2. Controleer of Supabase tabellen bestaan
3. Check of de email waarde wordt meegegeven

### "Tabellen bestaan niet"

1. Ga naar SQL Editor in Supabase
2. Kopieer de SQL code uit sectie 8 van dit document
3. Plak en klik op Run

---

## Samenvatting Checklist

Voordat je contact met ons opneemt, zorg dat je hebt:

- [ ] Supabase account aangemaakt
- [ ] Supabase project aangemaakt
- [ ] Project URL en anon key opgeslagen
- [ ] SQL code uitgevoerd (tabellen aangemaakt)
- [ ] n8n account aangemaakt
- [ ] n8n cloud URL genoteerd
- [ ] Besloten hoe authenticatie te handelen (Optie A, B, of C)
- [ ] Toegang credentials voorbereid om met ons te delen

---

## Contact Informatie

Wanneer je klaar bent, stuur ons:

1. Supabase toegang (team invite of credentials)
2. n8n toegang (team invite of credentials)
3. Een test Drug Comparison account
4. Een geldig customer_id voor testen
5. Informatie over je authenticatie systeem

Wij zullen dan de setup voltooien en alles testen!

---

## Veelgestelde Vragen

**V: Moet ik betalen voor Supabase?**
A: De gratis tier is genoeg voor testen. Je moet mogelijk upgraden voor productie.

**V: Moet ik betalen voor n8n?**
A: De gratis tier staat 5 workflows toe en beperkte uitvoeringen. Voor productie heb je mogelijk een betaald plan nodig.

**V: Kan ik mijn eigen email server gebruiken in plaats van Gmail?**
A: Ja, n8n ondersteunt SMTP en andere email services.

**V: Hoe lang duurt de setup?**
A: Nadat je deze stappen hebt voltooid en ons toegang hebt gegeven, kunnen we de setup afronden in 1-2 uur.

---

## Huidige Systeem Status

### Wat Werkt Al

1. Frontend UI voor het aanmaken van rapport configuraties
2. Database structuur in Supabase
3. "Send Test Mail" knop die data naar webhook stuurt
4. n8n workflow (moet worden geimporteerd in jouw account)

### Wat Configuratie Nodig Heeft

1. Supabase project credentials in `.env` bestand
2. n8n workflow import en configuratie
3. Gmail OAuth setup in n8n
4. Authenticatie integratie

---

## Vragen?

Als iets onduidelijk is, vraag het! Het is beter om vragen te stellen dan fouten te maken tijdens de setup.
