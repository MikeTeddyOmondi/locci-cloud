export interface User {
  id: string;
  email: string;
  password?: string; // Hashed password for basic auth
  name?: string;
  oauthProvider?: string; // e.g., 'google' or 'github'
  oauthId?: string; // Provider-specific ID
}
