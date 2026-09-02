# Family Information Survey Web Application

A full-stack React & Node.js web application built with **Next.js**, styled with modern Vanilla CSS, and integrated directly with **Google Sheets** as a database backend. Optimized for 1-click deployment on **Vercel**.

---

## Features

- **4-Step Wizard Interface**:
  - **Step 1: Basic Family Information**: Parish Name, Parish Ward, House Name, Head of Family, Mobile Number (10 digits), Email, Address, PIN Code (6 digits), Residence Years, Economic Status, Subscribed Publications.
  - **Step 2: Family Head Details**: Full Name (auto-synced), Date of Birth, Status, Qualification, Occupation, Country, State, City, Health Condition, Practicing Catholic, Church Activities.
  - **Step 3: Additional Members**: Dynamic member form cards (up to 20 total), inline deletion, and live summary table.
  - **Step 4: Review & Verification**: Final data summary with verification status badge and confirmation.
- **Serverless API Routes**:
  - `GET /api/settings`: Returns parish name, parish wards, and max member limit.
  - `POST /api/save-family`: Server-side validation, sanitizes inputs against formula injection, generates unique Family IDs (e.g., `F20260902-123456`), and appends data to `Families` and `FamilyMembers` sheets.

---

## Local Development & Testing

### 1. Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

### 2. Set Up Environment Variables (Optional for local testing)

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

If `.env.local` is not configured, the app will run in local demo mode with default fallback wards, allowing you to test form navigation, member addition, and client-side validation locally.

### 3. Start Local Dev Server

Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to test the application.

---

## Setting Up Google Sheets Database (for Production / Vercel)

To allow the server backend to save responses to your Google Sheet:

1. **Create a Google Spreadsheet**:
   - Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
   - Copy the **Spreadsheet ID** from the URL (`https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`).

2. **Create a Google Cloud Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project, navigate to **APIs & Services > Library**, search for **Google Sheets API**, and enable it.
   - Go to **APIs & Services > Credentials** and click **Create Credentials > Service Account**.
   - Create the account, then under **Keys**, click **Add Key > Create new key (JSON)**.
   - Download the JSON key file. It contains `client_email` and `private_key`.

3. **Share Google Sheet with Service Account**:
   - Open your Google Spreadsheet.
   - Click **Share** and add the `client_email` address with **Editor** permissions.

---

## Deploying to Vercel

1. **Push to GitHub / GitLab / Bitbucket**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import your repository.
   - Vercel automatically detects Next.js.

3. **Configure Environment Variables in Vercel**:
   In the **Environment Variables** section of Vercel, add:
   - `GOOGLE_SHEET_ID`: Your Google Sheet ID
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email (`client_email`)
   - `GOOGLE_PRIVATE_KEY`: Service account private key string (include `-----BEGIN PRIVATE KEY-----\n...`)

4. Click **Deploy**. Vercel will build and deploy your app in seconds!
