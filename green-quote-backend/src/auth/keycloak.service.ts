import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';

export type KeycloakProfile = {
  keycloakId: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  isAdmin: boolean;
};

export type KeycloakLogin = {
  url: string;
  state: string;
  codeVerifier: string;
};

type IdTokenClaims = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  realm_access?: { roles: string[] };
};

@Injectable()
export class KeycloakService {
  private readonly realmUrl: string;
  private readonly internalRealmUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly jwtService = new JwtService();

  constructor(config: ConfigService) {
    this.realmUrl = config.getOrThrow<string>('KEYCLOAK_URL');
    this.internalRealmUrl = config.get<string>(
      'KEYCLOAK_INTERNAL_URL',
      this.realmUrl,
    );
    this.clientId = config.getOrThrow<string>('KEYCLOAK_CLIENT_ID');
    this.clientSecret = config.getOrThrow<string>('KEYCLOAK_CLIENT_SECRET');
    this.redirectUri = `${config.getOrThrow<string>('APP_URL')}/api/auth/keycloak/callback`;
  }

  createLogin(): KeycloakLogin {
    const state = randomBytes(16).toString('base64url');
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const url = new URL(`${this.realmUrl}/protocol/openid-connect/auth`);
    url.search = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      scope: 'openid email profile',
      redirect_uri: this.redirectUri,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    }).toString();

    return { url: url.toString(), state, codeVerifier };
  }

  async exchangeCode(
    code: string,
    codeVerifier: string,
  ): Promise<KeycloakProfile> {
    const response = await fetch(
      `${this.internalRealmUrl}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code_verifier: codeVerifier,
        }),
      },
    );
    if (!response.ok) {
      throw new UnauthorizedException('Keycloak rejected the sign-in');
    }

    const { id_token } = (await response.json()) as { id_token: string };
    const claims = await this.jwtService.verifyAsync<IdTokenClaims>(id_token, {
      publicKey: await this.getRealmPublicKey(),
      algorithms: ['RS256'],
      issuer: this.realmUrl,
      audience: this.clientId,
    });

    return {
      keycloakId: claims.sub,
      email: claims.email.toLowerCase(),
      emailVerified: claims.email_verified ?? false,
      fullName: claims.name ?? claims.email,
      isAdmin: claims.realm_access?.roles.includes('admin') ?? false,
    };
  }

  private async getRealmPublicKey(): Promise<string> {
    const response = await fetch(this.internalRealmUrl);
    if (!response.ok) {
      throw new UnauthorizedException('Could not reach Keycloak');
    }
    const { public_key } = (await response.json()) as { public_key: string };
    return `-----BEGIN PUBLIC KEY-----\n${public_key}\n-----END PUBLIC KEY-----`;
  }
}
