Zwey — Social Hub for Upcoming Artists

Zwey is a social profile platform for upcoming artists to build a public music identity, showcase their work, connect their music platforms, and share their profile through a single link.

The MVP focuses on giving independent and emerging artists a simple, professional online presence without requiring them to build a website from scratch.

---

Product Vision

Zwey aims to become a lightweight social and distribution hub for independent artists.

Artists should be able to:

- Create an account
- Build a public artist profile
- Choose a unique username
- Add their artist name, bio, and genre
- Add links to music platforms
- Share their public profile
- Discover other artists
- Connect with other creators
- Eventually distribute music to major platforms from one place

---

Current MVP

The current application includes the foundation for:

- Firebase authentication
- Email/password signup
- Email/password login
- Password visibility toggle
- Password reset via email
- Artist onboarding
- Artist profile information
- Public artist profiles
- Artist initials avatars
- Username-based profile URLs
- Genre badges
- Music platform links
- Profile sharing
- Firestore user records
- Protected dashboard access

---

Tech Stack

Frontend

- Next.js 14
- React
- Tailwind CSS
- JavaScript

Backend / Infrastructure

- Firebase Authentication
- Firebase Firestore

Hosting

- Vercel

Development

- GitHub
- npm
- Node.js

---

Project Structure

zwey/
│
├── app/
│   ├── dashboard/
│   │   └── page.js
│   │
│   ├── explore/
│   │   └── page.js
│   │
│   ├── login/
│   │   └── page.js
│   │
│   ├── onboarding/
│   │   └── page.js
│   │
│   ├── signup/
│   │   └── page.js
│   │
│   ├── u/
│   │   └── [username]/
│   │       └── page.js
│   │
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── context/
│   └── AuthContext.js
│
├── lib/
│   └── firebase.js
│
├── .env.local
├── .gitignore
├── jsconfig.json
├── next.config.js
├── package.json
└── README.md

---

Getting Started

Prerequisites

Install the following before running Zwey locally:

- Node.js 18 or newer
- npm
- A Firebase account
- A GitHub account
- A Vercel account for deployment

---

Installation

Clone the repository:

git clone https://github.com/Josh-Fynly/zwey.git

Enter the project directory:

cd zwey

Install dependencies:

npm install

---

Firebase Configuration

Zwey uses Firebase Authentication and Firestore.

Create or open a Firebase project and enable:

1. Firebase Authentication
2. Email/Password authentication
3. Cloud Firestore

Create a web application inside the Firebase project and obtain the Firebase configuration values.

---

Environment Variables

Create a local environment file:

.env.local

Add the following variables:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

Never commit ".env.local" to GitHub.

The file should remain listed in ".gitignore".

---

Run the Development Server

Start the local development server:

npm run dev

Then open:

http://localhost:3000

---

Production Build

Before deploying, verify that the project builds successfully:

npm run build

If the build succeeds, start the production server locally with:

npm start

---

Authentication Flow

The intended authentication flow is:

Landing Page
     │
     ├── Existing user ──> Login
     │
     └── New user ───────> Sign Up
                              │
                              ▼
                         Onboarding
                              │
                              ▼
                          Dashboard

Authentication is handled through Firebase Authentication.

The application uses a shared authentication context:

context/AuthContext.js

This context provides:

- Current authenticated user
- Authentication loading state
- Signup
- Login
- Logout

---

Artist Onboarding

After registration, an artist can configure their public profile.

Current profile fields include:

- Artist name
- Username
- Bio
- Genre
- Spotify URL
- BandLab URL
- Rapchat URL
- Profile image URL

Profile information is stored in Firestore under the:

users

collection.

---

Public Profiles

Each artist can have a public profile accessible through:

/u/[username]

Example:

https://your-domain.com/u/artistname

The public profile can display:

- Artist avatar
- Artist initials when no image is available
- Artist name
- Username
- Genre
- Bio
- Spotify
- BandLab
- Rapchat
- Share Profile button

---

Profile Sharing

Public profiles include a share function that copies the current profile URL to the clipboard.

The interface provides feedback when the URL has been successfully copied.

---

Artist Avatar

If an artist has not supplied a profile image, Zwey generates an initials-based avatar.

For example:

John Doe

becomes:

JD

The avatar background is generated deterministically from the artist's username so that the same username consistently receives the same avatar color.

---

Genre System

Artists can currently select from:

- Hip-Hop
- Afrobeats
- Trap
- R&B
- Drill
- Soul
- Electronic
- Reggae
- Pop
- Other

Genre information is displayed as a visual badge on public profiles.

---

Firestore Data Model

The primary artist collection is:

users

A user document may contain:

users/{uid}

Example structure:

uid
email
createdAt
artistName
username
bio
genre
spotifyUrl
bandlabUrl
rapchatUrl
pic_url

---

Security

The project uses Firebase Authentication for account authentication and Firestore for persistent user data.

Important security requirements for production:

- Never expose Firebase private credentials.
- Never commit ".env.local".
- Configure Firestore security rules before production launch.
- Restrict users from modifying another artist's profile.
- Validate usernames.
- Prevent duplicate usernames.
- Validate external platform URLs.
- Review Firebase Authentication settings before launch.

---

Deployment

Zwey is designed to deploy through Vercel.

Connect the GitHub repository to Vercel and configure the required Firebase environment variables in the Vercel project settings.

The production build command is:

npm run build

The application is deployed from the:

main

branch.

---

Development Workflow

The recommended workflow is:

Feature / Fix
     │
     ▼
Update complete file
     │
     ▼
Test locally
     │
     ▼
npm run build
     │
     ▼
Commit changes
     │
     ▼
Push to GitHub
     │
     ▼
Vercel deployment
     │
     ▼
Verify production

Every significant change should be tested with:

npm run build

before considering the change deployment-ready.

---

Project Status

Current Phase

MVP Foundation — Authentication + Artist Profiles

The application is currently focused on establishing a stable foundation before adding larger social and music-distribution features.

Current priorities

1. Stable authentication
2. Reliable signup/login flow
3. Password reset
4. Password visibility controls
5. Artist onboarding
6. Public artist profiles
7. Profile sharing
8. Firestore data integrity
9. Responsive frontend UI
10. Production deployment stability

---

Roadmap

Phase 1 — Foundation

- [x] Next.js application
- [x] Firebase integration
- [x] Firebase Authentication
- [x] Firestore integration
- [x] Signup
- [x] Login
- [x] Logout
- [x] Password reset
- [x] Password visibility toggle
- [x] Artist onboarding
- [x] Public profile route

Phase 2 — Artist Profiles

- [x] Artist name
- [x] Username
- [x] Bio
- [x] Genre
- [x] Profile image
- [x] Initials avatar fallback
- [x] Spotify link
- [x] BandLab link
- [x] Rapchat link
- [x] Share profile

Phase 3 — Social Layer

- [ ] Explore page
- [ ] Artist discovery
- [ ] Artist search
- [ ] Artist connections
- [ ] Following system
- [ ] Activity feed
- [ ] Likes
- [ ] Comments
- [ ] Notifications

Phase 4 — Music Layer

- [ ] Track uploads
- [ ] Track sharing
- [ ] Artist releases
- [ ] Music previews
- [ ] Playlist functionality
- [ ] Music analytics

Phase 5 — Distribution

- [ ] Distribution workflow
- [ ] Spotify distribution
- [ ] Apple Music distribution
- [ ] Release management
- [ ] Metadata management
- [ ] Distribution status tracking

---

Product Principles

Zwey should prioritize:

1. Simplicity

Artists should be able to create and share their identity without unnecessary complexity.

2. Professional presentation

Public profiles should look credible enough for artists to share with fans, collaborators, labels, producers, and industry professionals.

3. Mobile-first usability

The product should work exceptionally well on mobile devices because many target users will access Zwey primarily from phones.

4. Reliability

Authentication, profile creation, profile loading, and sharing should work consistently before additional features are introduced.

5. Scalable architecture

The MVP should establish a foundation that can eventually support a larger social and music platform.

---

Team

Product: TENcube

Engineering: Josh Fynly

GitHub:

https://github.com/Josh-Fynly

Repository:

https://github.com/Josh-Fynly/zwey

---

Project Documentation

Additional project documentation may include:

SCHEMA.md
WEEKS.md

These documents describe the planned data schema and development timeline.

---

License

This project is currently a private product under development.

All rights reserved unless otherwise specified by the project owners.
