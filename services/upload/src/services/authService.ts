// `src/services/auth.service.ts`

import UserRepository from '../repositories/userRepository.js';
import { User } from '../entities/userEntity.js';
import { generateToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { oauthProviders } from '../config/oauthConfig.js';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
    this.initializeOAuthStrategies();
  }

  private initializeOAuthStrategies() {
    Object.keys(oauthProviders).forEach((provider) => {
      const { strategy, options } = oauthProviders[provider];
      passport.use(
        provider,
        new strategy(options, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            let user = await this.userRepository.findByOAuthId(provider, profile.id);
            if (!user) {
              user = {
                id: uuidv4(),
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName,
                oauthProvider: provider,
                oauthId: profile.id,
              };
              await this.userRepository.create(user);
            }
            done(null, user);
          } catch (error) {
            done(error, null);
          }
        })
      );
    });
  }

  async register(email: string, password: string): Promise<string> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
    };
    await this.userRepository.create(user);
    return generateToken(user);
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return generateToken(user);
  }

  generateTokenForUser(user: User): string {
    return generateToken(user);
  }
}
