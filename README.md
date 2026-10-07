# Zwey

Zwey is a social hub for upcoming artists and producers.

Artists can create a public identity, connect their existing music platforms, discover other creators, publish and interact with music, find potential collaborators, and access music distribution resources.

## Live Beta

Zwey is currently available as a public beta:

https://zwey-app.vercel.app

The application is actively in development. Early users are welcome to test the platform and report issues or usability problems.

## What Zwey Is

Zwey is built around artist discovery and networking.

The core product direction is:

Artist joins Zwey → creates an artist identity → connects music platforms → publishes music → gets discovered → receives engagement → finds potential collaborators → grows their network → accesses distribution and promotion opportunities.

Zwey is not a music distributor. Distribution is provided through external partners such as DistroKid.

## Current Authentication

Zwey currently supports:

- Sign up with Google
- Sign in with Google
- Sign up with email and password
- Sign in with email and password
- Password reset by email

Email authentication is not limited to Gmail. Users can use any supported email address from providers such as Microsoft, Yahoo, Proton, iCloud, university, company, or other valid email services.

## Artist Profiles

Artists can create a public profile containing:

- Artist name
- Unique username
- Genre
- Bio
- Profile image
- Primary DAW
- Spotify
- Apple Music
- Audiomack
- Boomplay
- BandLab
- Rapchat
- Soundtrap
- Audiotool

Music-platform links are optional and can be added or updated later.

## Technology

Zwey currently uses:

- Next.js 14
- React 18
- JavaScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Vercel
- GitHub

## Architecture

The application separates private account data from public artist identity.

Private account data is stored under:

`users/{uid}`

Public artist profiles are stored under:

`artistProfiles/{username}`

Firebase Authentication handles identity and sign-in. Cloud Firestore stores application data, while Firebase Storage handles profile images.

Security rules control access to private account data, public artist profiles, and uploaded files.

## Current Product Status

Zwey is in public beta.

Implemented foundations include:

- Public deployment
- Email authentication
- Google authentication
- Password recovery
- Artist onboarding
- Artist identity
- Username-based public profiles
- Artist profile links
- DAW selection
- Profile image upload
- Responsive mobile-first UI
- Firebase security rules
- Production deployment through Vercel

The remaining product capabilities are being developed and hardened through beta testing.

## Development Roadmap

The broader product roadmap includes:

1. Music posting
2. Social feed
3. Likes and comments
4. Artist discovery
5. Artist connections and collaboration
6. DistroKid education and affiliate integration
7. Product analytics
8. Paid promotion
9. Moderation and reporting
10. Advanced creator and premium features

Features are released progressively rather than being represented as complete before they are production-ready.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

`http://localhost:3000`

Create the required Firebase environment variables in `.env.local` before running the application locally.

## Environment Variables

The Firebase client configuration is provided through environment variables.

Do not commit `.env.local` or Firebase credentials to the repository.

Production environment variables are configured in the deployment environment.

## Engineering Principles

Zwey is being developed with:

- Mobile-first responsive design
- Clear separation of private and public data
- Explicit Firebase security rules
- Production-safe error handling
- Measurable product events
- Dependency-ordered feature development
- Human review of AI-assisted code
- Incremental testing and verification
- No dependency on AI for core product functionality

## Beta Testing

Because Zwey is in active development, beta testers may encounter incomplete features, unexpected behavior, or UI changes.

When reporting an issue, include:

- What you were trying to do
- What happened
- What you expected to happen
- Device and browser
- Screenshot or screen recording when useful

## Repository

The source code is maintained on GitHub and deployed through Vercel.

Zwey is being built as a production-oriented social discovery platform for emerging artists, with the goal of helping creators become discoverable, connect with one another, and grow their music careers.
