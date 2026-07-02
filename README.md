# NEXCHAT

NEXCHAT is a real-time chat application built with Next.js and Stream Chat. It offers a fast, modern messaging experience with secure authentication, persistent user data, and a clean, responsive UI.

## Features
- 🔒 **Authentication** — Secure sign-in powered by NextAuth, with user data persisted via Prisma
- 💬 **Real-time messaging** — Instant, reliable chat powered by Stream Chat
- 🎨 **Modern UI** — Built with Tailwind CSS, Radix UI, and shadcn/ui components
- 🌗 **Dark/Light mode** — Theme switching via next-themes
- ⚡ **Built on Next.js 16 & React 19** — Fast, server-rendered, and type-safe with TypeScript

## Tech Stack
- **Framework:** Next.js, React
- **Auth:** NextAuth.js, Prisma, `@auth/prisma-adapter`
- **Chat engine:** Stream Chat (`stream-chat`, `stream-chat-react`)
- **Styling/UI:** Tailwind CSS, Radix UI, shadcn/ui, lucide-react icons
- **Language:** TypeScript

## Getting Started

1. Clone the repo:
   \`\`\`bash
   git clone https://github.com/Kritarth22/NEXCHAT.git
   cd NEXCHAT
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Set up your environment variables (database URL, NextAuth secret, Stream Chat API key/secret, etc.) in a `.env` file.
4. Run database migrations:
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`
5. Start the dev server:
   \`\`\`bash
   npm run dev
   \`\`\`
6. Open [http://localhost:3000](http://localhost:3000) in your browser.
