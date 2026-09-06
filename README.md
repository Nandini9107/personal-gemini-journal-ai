# 🔐 Personal Gemini Journal

A secure, authenticated AI journaling application built with **Google AI Studio**, **Gemini**, **Firebase Authentication**, and **Cloud Firestore**.

## 🚀 Overview

Personal Gemini Journal allows users to have private, multi-turn conversations with Gemini for journaling, reflection, brainstorming, and personal productivity.

The application was designed with security and user data isolation as core principles.

## ✨ Features

* 🔑 **Firebase Authentication** for secure user sign-in
* 🤖 **Gemini-powered multi-turn conversations**
* 📝 Personal AI journaling and brainstorming
* 💾 **Cloud Firestore** persistence for journal conversations and summaries
* 🔒 **User-isolated data** so users can access only their own journal data
* 🛡️ Firestore security rules to enforce data isolation
* 🔐 Secure handling of application secrets
* ☁️ Deployed using **Google Cloud Run**
* 🎨 Modern responsive web interface

## 🌟 Original Feature Enhancement

### AI Journal Reflection & Summarization

In addition to the core journal functionality, the application provides AI-assisted reflection and summarization to help users turn their conversations into useful personal insights.

The enhancement makes the journal more than a simple chatbot by helping users reflect on their thoughts and preserve meaningful summaries.

## 🏗️ Technology Stack

* **Frontend:** React + TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **AI:** Google Gemini
* **Authentication:** Firebase Authentication
* **Database:** Cloud Firestore
* **Backend:** Node.js / TypeScript
* **Deployment:** Google Cloud Run
* **Development:** Google AI Studio

## 🔐 Security

Security was considered throughout the application design.

* Authentication is required for access to personal journal data.
* Firestore security rules restrict users to their own data.
* Secrets are not intended to be hardcoded into the source code.
* Environment variables are represented through `.env.example`.
* The application follows secure development principles for AI-powered applications.

## 📂 Project Structure

```text
personal-gemini-journal-ai/
├── public/
├── src/
├── server.ts
├── firestore.rules
├── firebase-applet-config.json
├── firebase-blueprint.json
├── .env.example
├── package.json
└── vite.config.ts
```

## ☁️ Deployment

The application was built with Google AI Studio and deployed to **Google Cloud Run**.

The deployed application uses the `asia-southeast1` Cloud Run region.

## 🎯 Challenge

This project was created for the **Gen AI Academy APAC Edition – Ideathon Challenge: Build a Secure "Personal Gemini Journal"**.

The project addresses the challenge requirements of:

1. User authentication
2. Multi-turn Gemini interaction
3. Isolated Cloud Firestore storage
4. Secure key management
5. Original feature enhancement

## 👩‍💻 Author

**Nandini Sadanand**

Built with Google AI Studio and Gemini.
