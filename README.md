# Drug Comparison - Report Configuration System

Een React frontend applicatie voor het configureren van geautomatiseerde rapporten voor Drug Comparison klanten.

---

## Wat Is Dit?

Dit systeem stelt gebruikers in staat om geautomatiseerde rapport configuraties aan te maken die:
- Daily, weekly, of monthly rapport emails versturen
- Pack optimization loss data bevatten
- Configureerbare filters hebben
- Meerdere ontvangers kunnen hebben
- Worden verstuurd via n8n workflow automation

---

## Technologie Stack

- **React 18** + **TypeScript** - Frontend framework
- **Vite** - Build tool en dev server
- **Tailwind CSS** - Styling
- **Supabase** - PostgreSQL database
- **React Hook Form** - Form handling
- **Lucide React** - Icons
- **n8n** - Workflow automation (apart systeem)

---

## Documentatie

### Voor Implementatie & Setup

**📘 INTEGRATION_GUIDE.md** - Complete setup guide
- Supabase account aanmaken
- n8n account aanmaken
- Database tabellen opzetten
- Authenticatie integratie
- Toegang delen
- Environment configuratie
- Complete SQL scripts
- Troubleshooting

**Start hier als je het systeem moet opzetten!**

### Voor Ontwikkelaars

**📗 FRONTEND_TECHNICAL_EXPLANATION.md** - Technische documentatie
- Architectuur overzicht
- Component uitleg
- Supabase integratie details
- Data flow diagrammen
- Database operaties
- Code voorbeelden
- Security overwegingen

**Lees dit als je de code moet begrijpen of aanpassen!**

---

## Quick Start (Development)

### 1. Installeer Dependencies

```bash
npm install
```

### 2. Configureer Environment

Maak een `.env` bestand in de root:

```env
VITE_SUPABASE_URL=https://jouw-project.supabase.co
VITE_SUPABASE_ANON_KEY=jouw-anon-key-hier
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 4. Build voor Productie

```bash
npm run build
```

Output komt in `dist/` folder.

---

## Project Structuur

```
project/
├── src/
│   ├── App.tsx                      # Main component
│   ├── components/
│   │   ├── EmailInput.tsx           # Email input screen
│   │   ├── ReportConfigForm.tsx     # Report form
│   │   └── ReportsList.tsx          # Reports list
│   ├── contexts/
│   │   └── EmailContext.tsx         # Email state management
│   ├── services/
│   │   └── reportsService.ts        # Supabase CRUD operations
│   ├── lib/
│   │   └── supabase.ts              # Supabase client
│   └── types/
│       └── reportConfig.ts          # TypeScript types
│
├── supabase/
│   └── migrations/                  # Database migrations
│
├── INTEGRATION_GUIDE.md             # Setup instructies
├── FRONTEND_TECHNICAL_EXPLANATION.md # Tech documentatie
└── README.md                        # Dit bestand
```

---

## Features

### Rapport Configuratie
- ✅ Daily/Weekly/Monthly schedules
- ✅ Multiple email recipients
- ✅ Configurable loss thresholds
- ✅ Date range selection
- ✅ Customer ID filtering
- ✅ Test email functie

### Rapport Beheer
- ✅ Create, Read, Update, Delete
- ✅ Activate/Deactivate toggle
- ✅ Edit existing reports
- ✅ View all reports (active + inactive)

### Database
- ✅ Two-table system (active/inactive)
- ✅ PostgreSQL via Supabase
- ✅ Indexed queries
- ✅ Automatic timestamps

---

## Belangrijke Bestanden

### Frontend
- `src/App.tsx` - Main application logic
- `src/components/ReportConfigForm.tsx` - Form voor rapporten
- `src/services/reportsService.ts` - Database operaties

### Database
- `supabase/migrations/*.sql` - Database schema

### Configuratie
- `.env` - Environment variables
- `vite.config.ts` - Vite configuratie
- `tailwind.config.js` - Tailwind styling

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type check
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables

Vereist in `.env` bestand:

| Variable | Beschrijving | Waar te vinden |
|----------|-------------|----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | Dashboard > Settings > API |

**Belangrijk:** `VITE_` prefix is verplicht voor Vite!

---

## Authenticatie

**Huidig systeem:**
- Simpele email input (MVP/testing)
- Email opgeslagen in localStorage
- Geen wachtwoord verificatie

**Voor productie:**
- Implementeer Supabase Auth of custom auth
- Zie INTEGRATION_GUIDE.md sectie "Authenticatie Koppelen"
- Enable Row Level Security (RLS) in database

---

## Database Schema

Twee identieke tabellen:
- `active_report_schedules` - Actieve rapporten (gelezen door n8n)
- `inactive_report_schedules` - Uitgeschakelde rapporten

Zie INTEGRATION_GUIDE.md voor complete SQL schema.

---

## n8n Integratie

Deze frontend schrijft rapport configuraties naar Supabase.
De n8n workflow:
1. Leest elk uur `active_report_schedules`
2. Check welke rapporten moeten worden verstuurd
3. Haalt data op van Drug Comparison API
4. Genereert HTML emails met Excel attachments
5. Verstuurt naar geconfigureerde ontvangers

Workflow JSON beschikbaar voor import.

---

## Troubleshooting

### "Cannot connect to Supabase"
- Check `.env` variabelen
- Verifieer Supabase project is actief
- Check geen trailing slash in URL

### "Data not saving"
- Open browser console (F12)
- Check Supabase credentials
- Verifieer tabellen bestaan

### "Vite not starting"
- Delete `node_modules` en `package-lock.json`
- Run `npm install` opnieuw
- Check Node version (v18+)

Zie INTEGRATION_GUIDE.md voor meer troubleshooting.

---

## Support & Contact

Voor vragen over:
- **Setup & configuratie**: Zie INTEGRATION_GUIDE.md
- **Code & development**: Zie FRONTEND_TECHNICAL_EXPLANATION.md
- **Database issues**: Check Supabase logs in dashboard
- **n8n workflow**: Check n8n execution logs

---

## Status

**Huidige versie:** MVP / Testing
**Productie ready:** Nee - authenticatie vereist
**Database:** Supabase PostgreSQL
**Deployment:** Nog niet geconfigureerd

---

## Roadmap

- [ ] Echte authenticatie implementeren
- [ ] Row Level Security (RLS) inschakelen
- [ ] Error boundaries toevoegen
- [ ] Loading states verbeteren
- [ ] Unit tests schrijven
- [ ] E2E tests opzetten
- [ ] Production deployment configureren
- [ ] Monitoring & logging toevoegen

---

## License

Proprietary - Drug Comparison Ltd.
