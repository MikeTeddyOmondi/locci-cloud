export interface User {
  id: string;
  email: string;
  password?: string | null; // Hashed password for basic auth
  name?: string | null;
  oauthProvider?: string | null; // e.g., 'google' or 'github'
  oauthId?: string | null; // Provider-specific ID
}
