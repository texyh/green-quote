import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { KeycloakService } from './keycloak.service';

describe('KeycloakService', () => {
  const service = new KeycloakService(
    new ConfigService({
      APP_URL: 'http://localhost:3000',
      KEYCLOAK_URL: 'http://localhost:8080/realms/green-quote',
      KEYCLOAK_CLIENT_ID: 'green-quote-api',
      KEYCLOAK_CLIENT_SECRET: 'secret',
    }),
  );

  it('builds the Keycloak login URL with state and a PKCE challenge', () => {
    const { url, state, codeVerifier } = service.createLogin();
    const parsed = new URL(url);
    const params = parsed.searchParams;

    expect(parsed.origin + parsed.pathname).toBe(
      'http://localhost:8080/realms/green-quote/protocol/openid-connect/auth',
    );
    expect(params.get('client_id')).toBe('green-quote-api');
    expect(params.get('response_type')).toBe('code');
    expect(params.get('redirect_uri')).toBe(
      'http://localhost:3000/api/auth/keycloak/callback',
    );
    expect(params.get('state')).toBe(state);
    expect(params.get('code_challenge_method')).toBe('S256');
    expect(params.get('code_challenge')).toBe(
      createHash('sha256').update(codeVerifier).digest('base64url'),
    );
  });

  it('uses a new state and verifier for every login', () => {
    const first = service.createLogin();
    const second = service.createLogin();

    expect(first.state).not.toBe(second.state);
    expect(first.codeVerifier).not.toBe(second.codeVerifier);
  });
});
