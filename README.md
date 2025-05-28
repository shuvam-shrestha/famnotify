exit

# Family Hub

This is a Next.js application called Family Hub, designed to help families stay connected.

## Features

- **Door Notification**: Visitors can notify family members of their presence, triggering a sound alert and a notification on the family dashboard.
  - **Sound Alert**: The application uses a sound alert for doorbell notifications. You need to place a sound file (e.g., `alert.mp3`) in the `public/sounds/` directory. If you use a different file name or path, update the `defaultSoundSrc` variable in `src/components/site/ClientSoundPlayer.tsx`.
    - Example:
      1. Create the directory: `mkdir -p public/sounds`
      2. Place your sound file: `public/sounds/alert.mp3`
    - Troubleshooting: If the sound doesn't play, ensure `public/sounds/alert.mp3` is a valid, non-empty MP3 audio file. Check the browser console for errors from the `ClientSoundPlayer` component.
- **Snapshot Alert**: Visitors can take a photo and send it to logged-in family members.
- **Secure Family Login**: Family members can log in using a specific code to access a private dashboard.
- **Cooking List Form**: Visitors can submit a list of items they'd like to have cooked.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:9002](http://localhost:9002) (or your configured port) with your browser to see the result.

## Configuration

### Family Login Code
The default family login code is "1234". To change this for local development, create a `.env.local` file in the root of your project and add the following line:
```
NEXT_PUBLIC_FAMILY_CODE=your_secret_code
```
For production, ensure this environment variable is set securely in your hosting environment.

### Sound Alert File (for Doorbell)
The application uses a sound alert for doorbell notifications.
1. Ensure you have a directory named `public/sounds/`.
2. Place an audio file (e.g., `alert.mp3`) in this directory.
3. The default sound file expected is `public/sounds/alert.mp3`. If you use a different file, you may need to adjust the `defaultSoundSrc` in `src/components/site/ClientSoundPlayer.tsx`.
**Important**: The sound file must be a valid audio format supported by web browsers (e.g., MP3). An empty or corrupted file will not work.

## Project Structure

- `src/app/`: Contains the pages for the application (visitor page, login, dashboard).
- `src/components/`: Shared UI components.
  - `ui/`: ShadCN UI components.
  - `site/`: Custom components specific to Family Hub.
- `src/context/`: React Context providers for managing application state (authentication, family data).
- `src/types/`: TypeScript type definitions.
- `public/`: Static assets, including the placeholder for the sound alert.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

This project was scaffolded with Firebase Studio.
