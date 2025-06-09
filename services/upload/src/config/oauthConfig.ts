import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export interface OAuthProviderConfig {
  strategy: any;
  options: any;
}

export const oauthProviders: Record<string, OAuthProviderConfig> = {
  google: {
    strategy: GoogleStrategy,
    options: {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      scope: ['profile', 'email'],
    },
  },
};