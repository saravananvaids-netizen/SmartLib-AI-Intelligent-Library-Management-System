# SmartLib AI — Intelligent Library Management System

An enterprise-grade, modern, full-stack college library management web application powered by **Google Books API**, **Google Gemini AI**, and **Firebase Firestore / Persistent Storage**.

Designed for university libraries, librarians, and undergraduate/graduate students with a modern UI in dark navy, white, and soft teal.

---

## 🚀 Key Features (All 12 Implemented)

1. **Smart Book Search & Google Books Integration:**
   - Real-time catalog search across campus holdings by title, author, ISBN, and subject.
   - Live Google Books API search (`/api/books/search`) to search worldwide published literature with one-click catalog importing.

2. **AI Book Recommendations (Gemini):**
   - Synthesizes personalized academic reading recommendations based on degree department, research interests, and currently read books.
   - Outlines direct curriculum alignment reasoning and core takeaways.

3. **Student Directory & Account Lifecycle:**
   - Full student profile management: Student ID (roll number), Department, College Email, Phone, and Membership Status (Active, Suspended, Graduated).
   - Track concurrent loan limits (default: 4) and active loans count.

4. **Book Issue & Return Circulation:**
   - Authorize checkouts and returns with concurrency protection.
   - Prevents issuing already checked-out or damaged copies.
   - Validates student borrowing caps and account suspension status before checkout.

5. **Automatic Fine Calculator:**
   - Dynamically calculates fines based on days overdue and configurable library rules (default: $0.50/day with 1-day grace period).
   - Real-time fine updates and one-click fine settlement / clearance.

6. **Due-Date Reminders & Alerts:**
   - Real-time notifications for upcoming return deadlines (3-day advance notice) and overdue alerts.
   - Librarian action to dispatch instant return reminders to delinquent borrowers.

7. **Physical Book Availability & Condition Tracker:**
   - Distinguishes high-level bibliographic records from physical inventory copies.
   - Tracks individual accession barcodes (e.g. `LIB-CS-001-C1`), condition (`Pristine`, `Good`, `Fair`, `Damaged`), and real-time location.

8. **QR Code Scanner & Tag Generator:**
   - Interactive optical scanner simulator with animated viewfinder and one-click barcode testing.
   - Printable QR Code asset tag generator with high-resolution SVG tags for physical book covers.
   - Scanning instantly opens checkout/check-in transactions.

9. **AI Book Summarizer (Gemini):**
   - Synthesizes 3 high-impact academic takeaways, executive summaries, target student audiences, and study duration estimates from book synopses or syllabus excerpts.

10. **Reading Analytics Dashboard (Recharts):**
    - Monthly circulation volume area charts (Issued vs Returned).
    - Discipline breakdown donut charts (Computer Science, AI, Systems, Math, etc.).
    - Departmental engagement bar charts.
    - Most popular semester books circulation leaderboard.

11. **Smart Library Virtual Assistant:**
    - AI-powered librarian chatbot grounded in actual library holdings, shelf locations, operating hours, and borrowing policies.

12. **Personal Reading Progress & Goals:**
    - Student personal shelves: Currently Reading, Want to Read, Finished.
    - Interactive page reading logs and percentage calculators.
    - Annual Academic Reading Challenge goal tracker (books and total pages read).

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend:** Node.js, Express, tsx.
- **AI Engine:** `@google/genai` (Gemini 3.8 Flash).
- **External Data:** Google Books API.
- **Data Visualizations:** Recharts.
- **QR Codes:** `qrcode.react` SVG generator.
- **Database / Persistence:** Persistent browser storage + Firebase Firestore schema & security rules (`firestore.rules`).

---

## 💻 Local Setup & Running in VS Code

### Prerequisites
- Node.js (version 20 or higher recommended)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd smartlib-ai
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your API keys in `.env`:
```env
# Gemini API Key (Required for AI Recommendations, Summarizer, and Assistant)
GEMINI_API_KEY="your_gemini_api_key_here"

# (Optional) Google Books API Key
GOOGLE_BOOKS_API_KEY=""

# (Optional) Firebase configuration for Firestore persistence
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_PROJECT_ID=""
```

*Note: If no API key is provided, SmartLib AI gracefully operates in offline demonstration mode with realistic academic responses.*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing All 12 Features

1. **Role Switching:** Click **"Switch to Student"** or **"Switch to Librarian"** at the bottom of the sidebar to test both administrative and student workflows.
2. **Issue a Book:** Go to **Issue & Return**, click on any sample copy barcode (e.g. `LIB-CS-001-C3`), select a student, and click **Confirm and Issue**.
3. **Return a Book & View Fines:** Go to **Issue & Return > Return Book**, enter `LIB-CS-001-C4` (an overdue book), and view the automated fine calculated ($3.50). Click **Accept Return**.
4. **QR Scanner:** Go to **QR Scanner & Barcodes**, click any sample barcode button to simulate optical detection, then click **Proceed to Issue This Copy**.
5. **AI Recommendations:** Open **AI Recommendations**, click **Generate Recommendations** to witness Gemini generating tailored course titles.
6. **AI Summarizer:** Open **AI Summarizer**, pick any book from the dropdown, and click **Generate AI Book Summary**.
7. **Chatbot:** Open **Smart Assistant**, click any prompt chip (e.g. *"Is Clean Code available right now?"*) to see inventory-grounded answers.
8. **Reading Progress:** Switch to Student view, open **My Reading Progress**, and adjust the page log slider.
