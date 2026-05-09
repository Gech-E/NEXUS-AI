# 🚀 Nexus AI — Intelligent Incubation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)

Nexus AI is an AI-powered startup incubation platform designed to democratize access to world-class startup support. By embedding artificial intelligence throughout the entire incubation lifecycle, Nexus AI removes the gatekeeping, geographic bias, and mentor scarcity that have historically limited who gets to build transformative companies.

---

## ✨ Core Features

Nexus AI orchestrates five intelligent subsystems into a unified experience:

1. **🧠 AI Idea Evaluation Engine**
   - Founders receive instant, data-driven feedback on their ideas.
   - Computes market sizing, viability scoring, and competitor analysis.
   - Generates a composite "Nexus Score" within minutes.

2. **🤖 AI Mentor Chatbot**
   - 24/7 personalized mentorship powered by LLMs.
   - Context-aware assistance tailored to the founder's specific startup journey.
   - Replaces passive content libraries with proactive guidance.

3. **🤝 Smart Matchmaking**
   - Algorithmically matches founders with expert mentors and potential co-founders.
   - Considers domain expertise alignment, stage experience, and skill complementarities.

4. **📊 Progress Dashboard**
   - Structured guidance on cohort milestones.
   - Visual tracking of weekly check-ins and performance benchmarks.
   - AI-generated progress narratives and insights.

5. **💼 Investor Portal**
   - Direct visibility to a curated network of active angel investors and venture funds.
   - AI-curated deal flow based on investor thesis alignment.
   - Due diligence data packs and direct introduction workflows.

---

## 🛠️ Technology Stack

Our platform leverages a modern, robust, and scalable technology stack:

- **Frontend:** Next.js (App Router), React, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Role-Based Access Control (Founders, Mentors, Investors, Admins)
- **Internationalization:** Multi-language support (English, French, Amharic, Tigrinya) via `next-intl`
- **Payments:** Stripe integration for mentor marketplace and platform subscriptions
- **Deployment:** Docker, Vercel

---

## 🚦 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.17 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gech-E/NEXUS-AI.git
   cd NEXUS-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your database connection string, AI provider keys, and other required credentials.

4. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Vision & Mission

**Vision:** To become the world's most accessible and intelligent startup incubation platform — where any founder, anywhere in the world, receives the mentorship, resources, and investor exposure needed to build a scalable company.

**Guiding Principles:**
- *AI Augments, Not Replaces:* AI handles scale and pattern recognition; humans provide judgment and empathy.
- *Radical Transparency:* Every AI recommendation includes its reasoning and confidence level.
- *Equity by Design:* Diverse cohorts are an explicit product goal, not an afterthought.

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying of files, via any medium, is strictly prohibited.
