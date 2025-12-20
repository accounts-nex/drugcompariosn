# Technische Uitleg: Frontend & Supabase Integratie

Dit document legt uit hoe de frontend applicatie werkt en hoe deze integreert met Supabase.

---

## Inhoudsopgave

1. [Architectuur Overzicht](#architectuur-overzicht)
2. [Frontend Structuur](#frontend-structuur)
3. [Supabase Integratie](#supabase-integratie)
4. [Data Flow](#data-flow)
5. [Componenten Uitleg](#componenten-uitleg)
6. [Database Operaties](#database-operaties)
7. [Hoe Alles Samenwerkt](#hoe-alles-samenwerkt)

---

## Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────┐
│                      GEBRUIKER                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   REACT FRONTEND                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  App.tsx (Hoofd Component)                            │  │
│  │  - Beheert views (form vs list)                       │  │
│  │  - EmailProvider wrapper                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  EmailContext (State Management)                      │  │
│  │  - Bewaart email in localStorage                      │  │
│  │  - Deelt email met alle componenten                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Componenten                                           │  │
│  │  - EmailInput: Email invoer scherm                    │  │
│  │  - ReportConfigForm: Rapport aanmaken/bewerken       │  │
│  │  - ReportsList: Overzicht van rapporten              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Services (Business Logic)                            │  │
│  │  - reportsService.ts: CRUD operaties                  │  │
│  │  - supabase.ts: Database client                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Supabase JS Client
                      │ (REST API calls)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  active_report_schedules                              │  │
│  │  - Actieve rapport configuraties                      │  │
│  │  - Wordt gelezen door n8n voor scheduled emails       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  inactive_report_schedules                            │  │
│  │  - Uitgeschakelde rapporten                           │  │
│  │  - Historische data                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Database queries
                      │ (elke uur)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      n8n WORKFLOW                            │
│  - Leest active_report_schedules                             │
│  - Checkt welke rapporten nu moeten worden verstuurd         │
│  - Haalt data op van Drug Comparison API                     │
│  - Verstuurt emails met rapporten                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Structuur

### Bestandsstructuur

```
src/
├── App.tsx                      # Hoofd applicatie component
├── main.tsx                     # Entry point
├── index.css                    # Global styles (Tailwind)
│
├── components/
│   ├── EmailInput.tsx           # Email invoer scherm
│   ├── ReportConfigForm.tsx     # Formulier voor rapporten
│   └── ReportsList.tsx          # Lijst van alle rapporten
│
├── contexts/
│   └── EmailContext.tsx         # React Context voor email state
│
├── services/
│   └── reportsService.ts        # CRUD operaties voor rapporten
│
├── lib/
│   └── supabase.ts              # Supabase client configuratie
│
└── types/
    └── reportConfig.ts          # TypeScript type definities
```

### Technologie Stack

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool (supersnel)
- **Tailwind CSS**: Styling framework
- **React Hook Form**: Formulier validatie
- **Lucide React**: Icons
- **Supabase JS Client**: Database communicatie

---

## Supabase Integratie

### 1. Client Setup (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Wat gebeurt hier:**
- De Supabase client wordt aangemaakt met credentials uit `.env`
- `VITE_SUPABASE_URL`: Het adres van je Supabase project
- `VITE_SUPABASE_ANON_KEY`: Publieke API key (veilig voor frontend gebruik)
- Deze client wordt in de hele applicatie hergebruikt

### 2. Environment Variables (`.env`)

```env
VITE_SUPABASE_URL=https://jouw-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**Belangrijk:**
- `VITE_` prefix is nodig voor Vite om de variabelen beschikbaar te maken
- Deze waarden komen uit je Supabase Dashboard > Settings > API
- De anon key is veilig om in frontend te gebruiken (RLS beschermt de data)

---

## Data Flow

### 1. Email Flow (Authenticatie Simulatie)

```
Gebruiker opent app
      ↓
EmailInput component toont
      ↓
Gebruiker voert email in
      ↓
Email wordt opgeslagen in:
  - EmailContext (React state)
  - localStorage (blijft bewaard bij refresh)
      ↓
Alle componenten hebben nu toegang tot email
via useEmail() hook
```

**Code:**
```typescript
// EmailContext.tsx
const setEmail = (newEmail: string) => {
  localStorage.setItem('userEmail', newEmail);  // Bewaar in browser
  setEmailState(newEmail);                       // Bewaar in React state
};

// Bij page refresh:
useEffect(() => {
  const savedEmail = localStorage.getItem('userEmail');
  if (savedEmail) {
    setEmailState(savedEmail);  // Herstel email uit localStorage
  }
}, []);
```

### 2. Rapport Aanmaken Flow

```
Gebruiker vult formulier in
      ↓
ReportConfigForm valideert data
      ↓
createReport() functie wordt aangeroepen
      ↓
Data wordt gestuurd naar Supabase:
  - Table: active_report_schedules
  - Email wordt meegegeven als filter
      ↓
Supabase INSERT query:
  INSERT INTO active_report_schedules (...)
  VALUES (email, report_name, contact_email, ...)
      ↓
Supabase retourneert nieuw rapport met ID
      ↓
UI toont success melding
```

**Code:**
```typescript
// reportsService.ts
export async function createReport(
  email: string,
  formData: ReportConfiguration
): Promise<ReportSchedule> {
  const reportData = {
    email: email,                          // Wie heeft dit rapport aangemaakt
    report_name: formData.report_name,
    contact_email: formData.contact_email, // Wie ontvangt het rapport
    customer_id: formData.customer_id,     // Voor welke klant
    frequency: formData.frequency,         // daily/weekly/monthly
    // ... meer velden
  };

  const { data, error } = await supabase
    .from('active_report_schedules')       // Tabel naam
    .insert(reportData)                     // Insert operatie
    .select()                               // Geef nieuwe row terug
    .single();                              // Verwacht 1 resultaat

  if (error) throw new Error('Failed to create report');

  return { ...data, is_active: true };
}
```

### 3. Rapporten Ophalen Flow

```
ReportsList component mount
      ↓
getAllReports(email) wordt aangeroepen
      ↓
Parallel ophalen van:
  - active_report_schedules
  - inactive_report_schedules
      ↓
Supabase SELECT queries:
  SELECT * FROM active_report_schedules
  WHERE email = 'user@example.com'
  ORDER BY created_at DESC
      ↓
Data wordt samengevoegd en gesorteerd
      ↓
UI toont lijst van rapporten
```

**Code:**
```typescript
// reportsService.ts
export async function getAllReports(email: string): Promise<ReportSchedule[]> {
  // Haal beide tabellen parallel op (sneller!)
  const [active, inactive] = await Promise.all([
    getActiveReports(email),
    getInactiveReports(email),
  ]);

  // Combineer en sorteer op datum
  return [...active, ...inactive].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getActiveReports(email: string): Promise<ReportSchedule[]> {
  const { data, error } = await supabase
    .from('active_report_schedules')
    .select('*')                    // Selecteer alle kolommen
    .eq('email', email)             // Filter op email
    .order('created_at', { ascending: false });  // Nieuwste eerst

  if (error) throw new Error('Failed to fetch active reports');

  return (data || []).map(r => ({ ...r, is_active: true }));
}
```

### 4. Rapport Toggle (Activeren/Deactiveren) Flow

```
Gebruiker klikt op toggle switch
      ↓
toggleReportActive() wordt aangeroepen
      ↓
STAP 1: Haal rapport op uit source tabel
  (active → inactive of vice versa)
      ↓
STAP 2: Insert in target tabel
  met DEZELFDE id (behoud historie)
      ↓
STAP 3: Delete uit source tabel
      ↓
UI update: rapport verplaatst naar andere lijst
```

**Waarom twee tabellen?**
- `active_report_schedules`: n8n leest alleen deze tabel
- `inactive_report_schedules`: Historische/uitgeschakelde rapporten
- Door te verplaatsen ipv flag te zetten is n8n query simpeler en sneller

**Code:**
```typescript
export async function toggleReportActive(
  reportId: string,
  email: string,
  currentlyActive: boolean
): Promise<ReportSchedule> {
  // Bepaal source en target tabellen
  const sourceTable = currentlyActive
    ? 'active_report_schedules'
    : 'inactive_report_schedules';
  const targetTable = currentlyActive
    ? 'inactive_report_schedules'
    : 'active_report_schedules';

  // 1. Haal rapport op
  const { data: report } = await supabase
    .from(sourceTable)
    .select('*')
    .eq('id', reportId)
    .eq('email', email)
    .single();

  // 2. Insert in target tabel (met ZELFDE id!)
  const { id, created_at, ...reportData } = report;
  const { data: newReport } = await supabase
    .from(targetTable)
    .insert({
      ...reportData,
      id,                                    // Behoud originele ID
      created_at,                            // Behoud originele datum
      updated_at: new Date().toISOString(),  // Update timestamp
    })
    .select()
    .single();

  // 3. Delete uit source tabel
  await supabase
    .from(sourceTable)
    .delete()
    .eq('id', reportId)
    .eq('email', email);

  return { ...newReport, is_active: !currentlyActive };
}
```

---

## Componenten Uitleg

### 1. App.tsx (Main Component)

**Verantwoordelijkheden:**
- Wrappen van hele app in `EmailProvider`
- View switching (form vs list)
- Edit state management

**Flow:**
```typescript
function App() {
  return (
    <EmailProvider>          {/* Maakt email beschikbaar overal */}
      <AppContent />
    </EmailProvider>
  );
}

function AppContent() {
  const { email } = useEmail();  // Haal email uit context

  if (!email) {
    return <EmailInput />;       // Toon email input als geen email
  }

  // Gebruiker is "ingelogd" - toon form of list
  return currentView === 'form'
    ? <ReportConfigForm />
    : <ReportsList />;
}
```

### 2. EmailContext.tsx (State Management)

**Wat het doet:**
- Bewaart email in React state (voor re-renders)
- Bewaart email in localStorage (voor persistence)
- Maakt email beschikbaar via `useEmail()` hook

**Waarom geen echte authenticatie?**
- Dit is een MVP/test versie
- Voor productie moet dit vervangen worden door echte auth
- Zie INTEGRATION_GUIDE.md voor authenticatie opties

**Code pattern:**
```typescript
// In elk component dat email nodig heeft:
function MyComponent() {
  const { email, setEmail, clearEmail } = useEmail();

  // email is beschikbaar!
  console.log('Current user:', email);
}
```

### 3. ReportConfigForm.tsx

**Verantwoordelijkheden:**
- Formulier voor rapport aanmaken/bewerken
- Validatie met React Hook Form
- Conditionale velden (weekly/monthly options)
- "Send Test Mail" functie (webhook naar n8n)

**Belangrijke features:**
- Dynamic email inputs (toevoegen/verwijderen)
- Threshold filters aan/uit zetten
- Frequency-based delivery options
- Test email functie

**Test Email Flow:**
```typescript
const handleTestEmail = async () => {
  // Stuur data naar n8n webhook
  const response = await fetch('https://n8n-url/webhook/...', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      report_name: formData.report_name,
      contact_email: formData.contact_email,
      // ... alle form data
      is_test: true,  // Belangrijk: dit is een test!
    })
  });
};
```

### 4. ReportsList.tsx

**Verantwoordelijkheden:**
- Toon alle rapporten (active + inactive)
- Toggle active/inactive switch
- Edit functie
- Delete functie
- Visual grouping (active vs inactive)

**UI Features:**
- Badge indicators (Daily/Weekly/Monthly)
- Active/Inactive toggles
- Edit en Delete knoppen
- Grouped lists met headers

---

## Database Operaties

### Database Tabellen

```sql
-- BEIDE TABELLEN HEBBEN IDENTIEKE STRUCTUUR
active_report_schedules:
  ├── id (uuid, primary key)
  ├── email (text)                    -- Wie heeft het aangemaakt
  ├── report_name (text)
  ├── person_name (text)              -- Contact persoon
  ├── contact_email (text[])          -- Array! Meerdere ontvangers
  ├── customer_id (text)              -- Voor welke klant
  ├── report_type (text)
  ├── date_range (text)               -- 'last_7_days', etc.
  ├── apply_loss_threshold (boolean)
  ├── total_loss_per_order_pack (numeric)
  ├── loss_per_ordered_pack (numeric)
  ├── grand_total_loss (numeric)
  ├── frequency (text)                -- 'daily'/'weekly'/'monthly'
  ├── delivery_day_of_week (integer)  -- 0-6 (0 = zondag)
  ├── delivery_day_of_month (integer) -- 1-28
  ├── delivery_time_hour (integer)    -- 0-23 (UK tijd!)
  ├── send_notification_no_data (boolean)
  ├── created_at (timestamptz)
  └── updated_at (timestamptz)
```

### CRUD Operaties

**CREATE:**
```typescript
await supabase
  .from('active_report_schedules')
  .insert({ email, ...data })
  .select()
  .single();
```

**READ:**
```typescript
await supabase
  .from('active_report_schedules')
  .select('*')
  .eq('email', userEmail)
  .order('created_at', { ascending: false });
```

**UPDATE:**
```typescript
await supabase
  .from('active_report_schedules')
  .update({ ...data, updated_at: new Date().toISOString() })
  .eq('id', reportId)
  .eq('email', userEmail)  // Security: alleen eigen rapporten updaten
  .select()
  .single();
```

**DELETE:**
```typescript
await supabase
  .from('active_report_schedules')
  .delete()
  .eq('id', reportId)
  .eq('email', userEmail);  // Security: alleen eigen rapporten deleten
```

**TOGGLE (verplaats tussen tabellen):**
```typescript
// 1. Read van source
const report = await supabase.from(sourceTable).select('*').eq('id', id).single();

// 2. Insert in target (met zelfde id)
await supabase.from(targetTable).insert({ ...report, id });

// 3. Delete van source
await supabase.from(sourceTable).delete().eq('id', id);
```

---

## Hoe Alles Samenwerkt

### Scenario 1: Nieuwe Gebruiker Maakt Rapport Aan

```
STAP 1: Gebruiker opent de applicatie
├─> App.tsx mount
├─> EmailProvider laadt
├─> Check localStorage voor saved email
└─> Geen email gevonden → toon EmailInput

STAP 2: Gebruiker voert email in
├─> EmailInput component
├─> Email validatie (basic)
├─> setEmail('user@example.com')
├─> Email saved in localStorage
├─> Email saved in React context
└─> Re-render → toon ReportConfigForm

STAP 3: Gebruiker vult formulier in
├─> ReportConfigForm mount
├─> React Hook Form initialisatie
├─> Gebruiker vult velden in:
│   ├─> Report naam: "Daily Loss Report"
│   ├─> Person naam: "John Doe"
│   ├─> Contact emails: ["john@company.com"]
│   ├─> Customer ID: "FO1SP6"
│   ├─> Frequency: "daily"
│   ├─> Delivery time: 9 (9:00 AM UK tijd)
│   └─> Loss thresholds: optioneel
└─> Klik "Create Report"

STAP 4: Data naar Supabase
├─> createReport(email, formData) aangeroepen
├─> Data transformatie:
│   ├─> Filter lege emails
│   ├─> Convert frequencies naar numbers
│   └─> Null waarden voor optionele velden
├─> Supabase INSERT query:
│   INSERT INTO active_report_schedules
│   (email, report_name, person_name, contact_email, ...)
│   VALUES ('user@example.com', 'Daily Loss Report', ...)
├─> Supabase response met nieuwe id
└─> Success melding in UI

STAP 5: n8n Leest Het Rapport (later)
├─> n8n Schedule Trigger (elk uur)
├─> Query naar Supabase:
│   SELECT * FROM active_report_schedules
│   WHERE delivery_time_hour = current_hour
│   AND frequency matches current day/week/month
├─> Voor elk matched rapport:
│   ├─> Haal data op van Drug Comparison API
│   ├─> Pas filters toe
│   ├─> Genereer HTML email
│   ├─> Maak Excel attachment
│   └─> Verstuur email naar contact_email adressen
└─> Workflow compleet
```

### Scenario 2: Gebruiker Bewerkt Bestaand Rapport

```
STAP 1: Toon rapporten lijst
├─> ReportsList component mount
├─> getAllReports(email) aangeroepen
├─> Parallel queries:
│   ├─> SELECT * FROM active_report_schedules WHERE email = ...
│   └─> SELECT * FROM inactive_report_schedules WHERE email = ...
├─> Data combineren en sorteren
└─> Render lijst

STAP 2: Gebruiker klikt "Edit"
├─> handleEditReport(reportId) in App.tsx
├─> setEditingReportId(reportId)
├─> setCurrentView('form')
└─> ReportConfigForm mount met editingReportId

STAP 3: Formulier laadt bestaande data
├─> useEffect in ReportConfigForm
├─> getReportById(editingReportId, email)
├─> Supabase query:
│   SELECT * FROM active_report_schedules
│   WHERE id = reportId AND email = email
├─> Form fields worden gevuld met bestaande data
└─> Gebruiker ziet edit mode

STAP 4: Gebruiker past waarden aan
├─> Update form fields
├─> Validation blijft werken
└─> Klik "Update Report"

STAP 5: Update naar Supabase
├─> updateReport(reportId, email, formData, isActive)
├─> Supabase UPDATE query:
│   UPDATE active_report_schedules
│   SET report_name = ..., updated_at = NOW()
│   WHERE id = reportId AND email = email
├─> Response met updated data
├─> Success melding
└─> Return naar list view
```

### Scenario 3: Gebruiker Deactiveert Rapport

```
STAP 1: Toggle switch click
├─> In ReportsList component
├─> handleToggleActive(reportId, currentlyActive)
└─> toggleReportActive() aangeroepen

STAP 2: Database operaties
├─> READ: Haal rapport op uit active_report_schedules
│   SELECT * FROM active_report_schedules
│   WHERE id = reportId AND email = email
│
├─> INSERT: Plaats in inactive_report_schedules
│   INSERT INTO inactive_report_schedules
│   (id, email, ...) VALUES (reportId, email, ...)
│   -- ZELFDE id behouden!
│
└─> DELETE: Verwijder uit active_report_schedules
    DELETE FROM active_report_schedules
    WHERE id = reportId AND email = email

STAP 3: UI update
├─> Rapport verdwijnt uit "Active Reports" lijst
├─> Rapport verschijnt in "Inactive Reports" lijst
└─> n8n zal dit rapport NIET meer versturen
```

---

## Belangrijke Implementatie Details

### 1. Email als Primary Identifier

**Huidig systeem:**
```typescript
// Alle queries filteren op email
.eq('email', email)
```

**Waarom dit werkt:**
- Email is uniek per gebruiker
- Simpel voor MVP/testing
- Geen complexe authenticatie nodig

**Waarom dit NIET productie-ready is:**
- Geen wachtwoord verificatie
- Iedereen kan andermans email claimen
- Geen session management
- Geen token-based security

**Voor productie:**
- Vervang email door user_id
- Implementeer Supabase Auth of custom auth
- Gebruik JWT tokens
- Enable RLS (Row Level Security)

### 2. Twee-Tabellen Systeem

**Waarom niet 1 tabel met `is_active` boolean?**

**Voordelen van 2 tabellen:**
```typescript
// n8n query is simpeler en sneller
SELECT * FROM active_report_schedules
WHERE delivery_time_hour = 9

// vs met 1 tabel:
SELECT * FROM report_schedules
WHERE delivery_time_hour = 9
AND is_active = true
```

- n8n hoeft niet te filteren op is_active
- Active tabel blijft klein (snellere queries)
- Historical data gescheiden
- Duidelijker intent (active = wordt verstuurd)

**Nadelen:**
- Moet data kopiëren bij toggle
- Twee tabellen om te onderhouden
- Iets complexere CRUD operaties

### 3. Contact Email Array

```sql
contact_email text[]  -- PostgreSQL array type!
```

**In de frontend:**
```typescript
// Multiple email inputs
const [emails, setEmails] = useState(['']);

// Add email input
const addEmail = () => setEmails([...emails, '']);

// Remove email input
const removeEmail = (index) => {
  setEmails(emails.filter((_, i) => i !== index));
};

// Naar Supabase
contact_email: emails.filter(e => e.trim() !== '')
```

**In Supabase:**
```javascript
// n8n kan direct array lezen
const emails = report.contact_email; // ['a@test.com', 'b@test.com']
emails.forEach(email => sendEmailTo(email));
```

### 4. Frequency Logic

**Database waarden:**
- `frequency`: 'daily' | 'weekly' | 'monthly'
- `delivery_day_of_week`: 0-6 (0=Sunday, 1=Monday, ...)
- `delivery_day_of_month`: 1-28
- `delivery_time_hour`: 0-23

**n8n Schedule Check Logic:**
```javascript
// Check of rapport nu moet worden verstuurd
const now = new Date();
const currentHour = now.getHours();
const currentDayOfWeek = now.getDay(); // 0-6
const currentDayOfMonth = now.getDate(); // 1-31

for (const report of reports) {
  // Check hour
  if (report.delivery_time_hour !== currentHour) continue;

  // Check frequency
  if (report.frequency === 'daily') {
    sendReport(report);
  } else if (report.frequency === 'weekly') {
    if (report.delivery_day_of_week === currentDayOfWeek) {
      sendReport(report);
    }
  } else if (report.frequency === 'monthly') {
    if (report.delivery_day_of_month === currentDayOfMonth) {
      sendReport(report);
    }
  }
}
```

---

## Security Overwegingen

### 1. Huidige Beveiliging (MVP)

**Email filtering:**
```typescript
// Alle queries hebben .eq('email', email)
.eq('email', email)
```

**Wat dit NIET beschermt tegen:**
- Iemand kan een willekeurige email invoeren
- Directe database toegang (zonder app)
- API misbruik

### 2. Voor Productie

**Implementeer Row Level Security (RLS):**
```sql
-- In Supabase
ALTER TABLE active_report_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: users kunnen alleen eigen data zien
CREATE POLICY "Users can view own reports"
  ON active_report_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

**Implementeer Supabase Auth:**
```typescript
// Login
const { user } = await supabase.auth.signInWithPassword({
  email, password
});

// Queries gebruiken automatisch user_id
const { data } = await supabase
  .from('active_report_schedules')
  .select('*');
// RLS filtert automatisch op auth.uid()
```

---

## Veelgestelde Vragen

**Q: Waarom localStorage voor email?**
A: Voor MVP convenience. In productie gebruik je Supabase auth sessions.

**Q: Kan ik de database direct benaderen?**
A: Ja, via Supabase Dashboard of SQL Editor. Pas op: productie data!

**Q: Hoe voeg ik een nieuw veld toe?**
A:
1. Update database schema (ALTER TABLE)
2. Update TypeScript interface (reportConfig.ts)
3. Update formulier (ReportConfigForm.tsx)
4. Update service (reportsService.ts)

**Q: Kan ik n8n workflow testen zonder te wachten?**
A: Ja, gebruik "Send Test Mail" knop of trigger handmatig in n8n.

**Q: Wat als Supabase down is?**
A: App toont error messages. Data wordt niet opgeslagen. n8n kan niet lezen.

---

## Volgende Stappen

Voor productie deployment:

1. **Authenticatie implementeren** (zie INTEGRATION_GUIDE.md)
2. **RLS inschakelen** in Supabase
3. **Error handling** verbeteren
4. **Loading states** toevoegen
5. **Form validatie** uitbreiden
6. **Unit tests** schrijven
7. **E2E tests** opzetten
8. **Monitoring** toevoegen (Sentry, etc.)
9. **Analytics** implementeren
10. **Performance optimalisatie**

---

## Conclusie

De frontend applicatie is een React SPA die:
- Email gebruikt als eenvoudige "authenticatie"
- Rapport configuraties opslaat in Supabase
- CRUD operaties uitvoert via Supabase JS Client
- Twee-tabellen systeem gebruikt (active/inactive)
- n8n workflow voedt met scheduled report configuraties

De integratie met Supabase is direct en simpel, maar moet worden uitgebreid met echte authenticatie en RLS voor productie gebruik.
