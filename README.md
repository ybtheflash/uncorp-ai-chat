Uncorp AI Chat: Your Secure, Private Gateway to Google Gemini
A secure and feature-rich web client for Google Gemini, designed specifically to be deployed as a proxied alternative for users on corporate networks where official AI websites are often blocked. Uncorp AI Chat provides a familiar, enhanced chat experience with a steadfast commitment to user privacy and a unique, custom-built interface.

🚀 The Problem
In many corporate environments, access to powerful AI tools like Google Gemini is restricted by network firewalls. This limits the ability of developers, researchers, and other professionals to leverage these cutting-edge models for their work. Furthermore, users are rightly concerned about how their data is stored and used.

✅ The Solution
Uncorp AI Chat acts as a self-hostable, secure gateway. By deploying this application on a permitted domain, users can proxy requests to the Gemini API through a secure backend.

It solves the core problems of access and privacy by:

Bypassing firewalls that block direct access to AI services.

Ensuring data privacy by securely storing your chat history for your convenience. This data is never shared.

Providing secure authentication through standard Google OAuth, which you already trust.

✨ Features
Bypass Corporate Restrictions: Provides a reliable way to access Google Gemini's capabilities from within a restricted network.

Simple & Secure Authentication: One-click login with your Google account. No separate passwords to manage.

Secure Chat History: Your conversations are securely stored for your convenience and are never shared. You retain full control, with easy, one-click account deletion.

Direct Google Gemini Integration: Leverages the official Google AI SDK for high-quality, real-time streaming responses.

Unique Custom UI: A clean and modern interface built with custom styling and components.

Customizable Themes: Switch between different UI themes to suit your preference.

Easy to Self-Host: Deploy your own instance with a single click to Vercel.

🛠️ Tech Stack
Framework: Next.js

AI: Google Gemini via @google/generative-ai

Authentication: NextAuth.js

Language: TypeScript

Styling: Custom Styling with Tailwind CSS

Icons: Lucide React

⚙️ Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
You need to have Node.js and npm (or yarn/pnpm) installed on your machine.

Node.js

1. Set Up Environment Variables
You will need an API key for the Gemini API from Google AI Studio.

First, copy the .env.example file to a new file named .env.local:

cp .env.example .env.local

Next, open .env.local and add your Google Gemini API key. You will also need to set up Google OAuth credentials for NextAuth.js.

# Get your Gemini key from https://aistudio.google.com/
GOOGLE_API_KEY="your-gemini-api-key-here"

# For Google Login (NextAuth.js)
# Get credentials from https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="generate-a-secret-key" # You can generate one with `openssl rand -base64 32`

2. Installation & Running the App
Clone the repo

git clone https://github.com/ybtheflash/uncorp-ai-chat.git

Navigate to the project directory

cd uncorp-ai-chat

Install NPM packages

npm install

Run the development server

npm run dev

Open http://localhost:3000 with your browser to see the result!
