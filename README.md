# Drug Comparison - Report Configuration Portal

A React.js frontend application that allows users to configure automated report schedules. Users can set up daily, weekly, or monthly reports with customizable filters and multiple email recipients.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Integration Guide](#integration-guide)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Customization](#customization)

---

## Overview

This is a standalone React application for managing automated report configurations. It provides:

- A form to create new report configurations
- A list view to manage existing reports
- Ability to activate/deactivate reports
- Edit and delete functionality

**Current Setup**: The application currently uses Supabase as its database backend and a simple email-based identification system.

**For Integration**: You will need to replace the Supabase connection with your own database and connect it to your existing authentication system.

---

## Features

| Feature | Description |
|---------|-------------|
| Create Reports | Configure new automated report schedules |
| Multiple Recipients | Add up to 5 email recipients per report |
| Flexible Scheduling | Daily, weekly, or monthly delivery options |
| Loss Threshold Filters | Optional filtering based on loss values |
| Date Range Selection | Select data range from 1 to 31 days |
| Report Management | View, edit, activate/deactivate, and delete reports |
| Draft Saving | Save form drafts locally before submitting |

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool & Dev Server |
| Tailwind CSS | Styling |
| React Hook Form | Form Handling & Validation |
| Lucide React | Icons |
| Supabase JS | Database Client (replaceable) |

---

## Project Structure

```
src/
├── App.tsx                     # Main application component
├── main.tsx                    # Application entry point
├── index.css                   # Global styles (Tailwind)
│
├── components/
│   ├── EmailInput.tsx          # Email login screen (to be replaced)
│   ├── ReportConfigForm.tsx    # Report configuration form
│   └── ReportsList.tsx         # List of all reports
│
├── contexts/
│   └── EmailContext.tsx        # User state management (to be replaced)
│
├── services/
│   └── reportsService.ts       # Database operations (to be replaced)
│
├── lib/
│   └── supabase.ts             # Database client (to be replaced)
│
└── types/
    └── reportConfig.ts         # TypeScript type definitions
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone or copy the project files
cd project-directory

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## Integration Guide

### Option 1: Embed as Standalone Page

You can build and deploy this as a separate page and link to it from your dashboard:

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your server
3. Access via direct URL or iframe

### Option 2: Integrate into Existing React Application

Copy the following directories into your existing React project:

```
src/components/ReportConfigForm.tsx
src/components/ReportsList.tsx
src/types/reportConfig.ts
```

Then integrate the components into your routing.

### Option 3: Replace Backend & Authentication

This is the recommended approach for full integration:

#### Step 1: Replace Authentication

The current system uses a simple email input stored in localStorage. To connect to your authentication:

**File: `src/contexts/EmailContext.tsx`**

Replace the email context with your authentication system:

```typescript
// Example: Replace with your auth context
import { useAuth } from 'your-auth-library';

export function useEmail() {
  const { user } = useAuth();

  return {
    email: user?.email || null,
    setEmail: () => {}, // Not needed with real auth
    clearEmail: () => { /* Call your logout function */ }
  };
}
```

**File: `src/components/EmailInput.tsx`**

This component can be removed entirely if your dashboard already handles authentication. Instead, redirect unauthenticated users to your login page.

#### Step 2: Replace Database Connection

**File: `src/lib/supabase.ts`**

Replace the Supabase client with your database client:

```typescript
// Example: Replace with your API client
export const api = {
  async get(endpoint: string) {
    const response = await fetch(`https://your-api.com${endpoint}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return response.json();
  },
  async post(endpoint: string, data: any) {
    const response = await fetch(`https://your-api.com${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  // Add put, delete methods as needed
};
```

#### Step 3: Update Service Layer

**File: `src/services/reportsService.ts`**

Replace Supabase queries with your API calls:

```typescript
// Example: Replace Supabase queries with your API

export async function getActiveReports(userId: string): Promise<ReportSchedule[]> {
  // Replace this:
  // const { data } = await supabase.from('active_report_schedules').select('*')

  // With your API call:
  const response = await fetch('/api/reports/active', {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return response.json();
}

export async function createReport(userId: string, data: ReportConfiguration): Promise<ReportSchedule> {
  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

// Update all other functions similarly
```

---

## Database Schema

The application expects two database tables with identical structure:

### Table: `active_report_schedules`

Reports that are currently active and should be processed by your scheduling system.

### Table: `inactive_report_schedules`

Reports that have been deactivated (paused) by the user.

### Column Definitions

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `email` | Text | Yes | User identifier (replace with user_id) |
| `report_name` | Text | Yes | Name of the report |
| `person_name` | Text | Yes | Contact person name |
| `contact_email` | Text[] | Yes | Array of recipient emails |
| `customer_id` | Text | Yes | Customer identifier for data filtering |
| `report_type` | Text | Yes | Type of report |
| `date_range` | Text | No | e.g., 'last_7_days' |
| `apply_loss_threshold` | Boolean | Yes | Whether to apply loss filters |
| `total_loss_per_order_pack` | Numeric | No | Threshold value |
| `loss_per_ordered_pack` | Numeric | No | Threshold value |
| `grand_total_loss` | Numeric | No | Threshold value |
| `frequency` | Text | Yes | 'daily', 'weekly', or 'monthly' |
| `delivery_day_of_week` | Integer | No | 0-6 (Sunday=0) for weekly reports |
| `delivery_day_of_month` | Integer | No | 1-28 for monthly reports |
| `delivery_time_hour` | Integer | Yes | Hour of day (0-23) |
| `send_notification_no_data` | Boolean | Yes | Send email even if no data |
| `created_at` | Timestamp | Yes | Creation timestamp |
| `updated_at` | Timestamp | Yes | Last update timestamp |

### SQL Example (PostgreSQL)

```sql
CREATE TABLE active_report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),  -- Replace email with user_id
  report_name TEXT NOT NULL,
  person_name TEXT NOT NULL,
  contact_email TEXT[] NOT NULL DEFAULT '{}',
  customer_id TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'Pack Optimization Loss Report',
  date_range TEXT,
  apply_loss_threshold BOOLEAN NOT NULL DEFAULT false,
  total_loss_per_order_pack NUMERIC,
  loss_per_ordered_pack NUMERIC,
  grand_total_loss NUMERIC,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  delivery_day_of_week INTEGER CHECK (delivery_day_of_week >= 0 AND delivery_day_of_week <= 6),
  delivery_day_of_month INTEGER CHECK (delivery_day_of_month >= 1 AND delivery_day_of_month <= 28),
  delivery_time_hour INTEGER NOT NULL DEFAULT 9 CHECK (delivery_time_hour >= 0 AND delivery_time_hour <= 23),
  send_notification_no_data BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the same structure for inactive_report_schedules
CREATE TABLE inactive_report_schedules (LIKE active_report_schedules INCLUDING ALL);

-- Create indexes for better performance
CREATE INDEX idx_active_reports_user ON active_report_schedules(user_id);
CREATE INDEX idx_inactive_reports_user ON inactive_report_schedules(user_id);
```

---

## API Reference

If you're building a REST API, here are the required endpoints:

### GET /api/reports/active

Returns all active reports for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "report_name": "Daily Loss Report",
    "person_name": "John Smith",
    "contact_email": ["john@example.com"],
    "customer_id": "CUST-123",
    "frequency": "daily",
    ...
  }
]
```

### GET /api/reports/inactive

Returns all inactive reports for the authenticated user.

### GET /api/reports/:id

Returns a single report by ID.

### POST /api/reports

Creates a new report.

**Request Body:**
```json
{
  "report_name": "Weekly Summary",
  "person_name": "John Smith",
  "contact_email": ["john@example.com", "jane@example.com"],
  "customer_id": "CUST-123",
  "report_type": "Pack Optimization Loss Report",
  "date_range": "last_7_days",
  "apply_loss_threshold": true,
  "total_loss_per_order_pack": 10.00,
  "frequency": "weekly",
  "delivery_day_of_week": 1,
  "delivery_time_hour": 9,
  "send_notification_no_data": false
}
```

### PUT /api/reports/:id

Updates an existing report.

### DELETE /api/reports/:id

Deletes a report.

### POST /api/reports/:id/toggle

Moves a report between active and inactive tables.

---

## Customization

### Webhook Integration

The form currently sends data to a webhook after saving. You can find this in `ReportConfigForm.tsx`:

```typescript
const WEBHOOK_URL = 'https://...';
```

You can:
- Remove this if not needed
- Replace with your own endpoint
- Use it to trigger your report generation workflow

### Styling

The application uses Tailwind CSS. Main colors used:
- Primary: Blue (`blue-600`, `blue-700`)
- Accent: Orange (`#EF6603` for edit mode)
- Background: Slate gradients

To match your dashboard styling, modify the Tailwind classes in the component files.

### Adding Fields

To add new fields to the report configuration:

1. Add the field to `src/types/reportConfig.ts`
2. Add the field to the database schema
3. Add the form input in `ReportConfigForm.tsx`
4. Update `reportsService.ts` to include the field in create/update operations
5. Display the field in `ReportsList.tsx` if needed

---

## Environment Variables

For the current Supabase setup:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

For your custom integration, define your own environment variables:

```env
VITE_API_URL=https://your-api.drugcomparison.co.uk
```

---

## Support

For questions about this integration, please contact the development team.

---

## Summary for Quick Start

1. **To view the current application**: Run `npm install && npm run dev`
2. **To integrate**: Follow the [Integration Guide](#integration-guide)
3. **Database requirements**: See [Database Schema](#database-schema)
4. **API requirements**: See [API Reference](#api-reference)

The main files you need to modify for integration:
- `src/contexts/EmailContext.tsx` - Replace with your auth
- `src/lib/supabase.ts` - Replace with your API client
- `src/services/reportsService.ts` - Update database operations
