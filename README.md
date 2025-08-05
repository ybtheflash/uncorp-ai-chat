# Uncorp AI Chat: Your Secure, Private Gateway to Google Gemini

**Uncorp AI Chat** is a secure, feature-rich web client for Google Gemini, designed to be deployed as a proxied alternative in corporate networks where access to official AI tools is restricted. It offers an enhanced chat experience with strong privacy protections and a custom-built interface.

🔗 **Live Demo:** https://uncorp.vercel.app/ — *Just sign in with Google and start chatting!*
---

## 🚀 The Problem

In many corporate environments, powerful AI tools like **Google Gemini** are blocked by firewalls. This restricts developers, researchers, and other professionals from accessing the tools they need. On top of that, there are legitimate concerns around how user data is stored and used.

---

## ✅ The Solution

**Uncorp AI Chat** provides a self-hostable, secure gateway to Google Gemini. It works by proxying requests through a secure backend hosted on an approved domain.

It solves the core issues of access and privacy by:

* **Bypassing firewalls** that block direct access to AI services.
* **Ensuring data privacy** by securely storing your chat history, which is never shared.
* **Using secure authentication** via Google OAuth — no new credentials required.

---

## ✨ Features

* **Bypass Corporate Restrictions**
  Seamlessly access Google Gemini from behind network firewalls.

* **Simple & Secure Authentication**
  One-click login using your existing Google account via NextAuth.js.

* **Private Chat History**
  Conversations are securely stored and never shared. You can delete your account with a single click.

* **Official Google Gemini Integration**
  Built using the official `@google/generative-ai` SDK for high-quality, real-time streaming responses.

* **Custom UI**
  Clean, modern interface with custom-designed components.

* **Theme Support**
  Easily switch between UI themes to suit your preferences.

* **Self-Hosting Friendly**
  Deploy your own instance with one click using platforms like Vercel.

---

## 🛠️ Tech Stack

* **Framework:** Next.js
* **AI:** Google Gemini via `@google/generative-ai`
* **Authentication:** NextAuth.js
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React

---

## ⚙️ Getting Started

To get a local instance running, follow these steps:

### 1. Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/)
* npm, yarn, or pnpm

---

### 2. Set Up Environment Variables

You'll need:

* A Gemini API key from [Google AI Studio](https://aistudio.google.com/)
* Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

#### Steps:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Gemini API Key
GOOGLE_API_KEY="your-gemini-api-key"

# Google OAuth (for NextAuth.js)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth secret key (generate using: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret"
```

---

### 3. Install & Run

```bash
# Clone the repository
git clone https://github.com/ybtheflash/uncorp-ai-chat.git

# Navigate to the project directory
cd uncorp-ai-chat

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to start using Uncorp AI Chat.

---

Let me know if you'd like a version with badges, a license section, or a deployment guide!
