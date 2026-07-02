# NEXCHAT

**NEXCHAT** is a modern real-time chat application built with **Next.js**, **TypeScript**, **Prisma**, and **Stream Chat**. It delivers a fast, secure, and responsive messaging experience with authentication, persistent user data, and a clean, intuitive user interface.

## 🚀 Live Demo

**Live Website:** https://nexchat-xi.vercel.app/

## ✨ Features

* 🔐 **Secure Authentication** — User authentication powered by **NextAuth** with Prisma integration.
* 💬 **Real-Time Messaging** — Instant messaging using **Stream Chat**.
* 👥 **User Profiles** — Persistent user data stored with Prisma.
* 🎨 **Modern & Responsive UI** — Built with **Tailwind CSS**, **shadcn/ui**, and **Radix UI**.
* 🌙 **Dark / Light Theme** — Theme switching using **next-themes**.
* ⚡ **Fast Performance** — Built with **Next.js 16**, **React 19**, and **TypeScript**.

## 🛠️ Tech Stack

* **Framework:** Next.js, React
* **Language:** TypeScript
* **Authentication:** NextAuth.js, Prisma, @auth/prisma-adapter
* **Database ORM:** Prisma
* **Real-Time Chat:** Stream Chat
* **Styling:** Tailwind CSS, shadcn/ui, Radix UI
* **Icons:** Lucide React

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Kritarth22/NEXCHAT.git
cd NEXCHAT
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file and add the required environment variables such as:

* Database URL
* NextAuth Secret
* Stream Chat API Key
* Stream Chat API Secret
* Other required credentials

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev
```

### 5. Start the Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📌 Project Status

This project is currently under active development. More features and improvements will be added in future updates.
