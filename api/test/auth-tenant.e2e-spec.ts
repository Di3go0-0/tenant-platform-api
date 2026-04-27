import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
import { PlsqlService } from '../src/core/plsql/plsql.service.js';

describe('Auth + Tenant flow (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  const mockUsers: Record<string, any> = {};
  const mockRefreshTokens: Record<string, any> = {};
  const mockTenants: Record<string, any> = {};
  const mockUserTenants: any[] = [];
  const mockRoles: any[] = [];

  const mockPlsqlService = {
    executeQuery: jest.fn(),
    executeQueryOne: jest.fn(),
    executeQueryMany: jest.fn().mockResolvedValue([]),
    executeTransaction: jest.fn(),
  };

  beforeAll(async () => {
    // Mock executeQueryOne to handle different queries
    mockPlsqlService.executeQueryOne.mockImplementation((query: string, params?: any[]) => {
      // findByEmail - returns null (no existing user)
      if (query.includes('SELECT') && query.includes('users') && query.includes('email')) {
        return Promise.resolve(mockUsers[params?.[0]] || null);
      }
      // create user
      if (query.includes('INSERT') && query.includes('users')) {
        const user = {
          id: 'user-uuid-1',
          email: params?.[0],
          password_hash: params?.[1],
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        };
        mockUsers[user.email] = user;
        return Promise.resolve(user);
      }
      // create refresh token
      if (query.includes('INSERT') && query.includes('refresh_tokens')) {
        const token = {
          id: 'token-uuid',
          user_id: params?.[0],
          token: params?.[1],
          expires_at: params?.[2],
          revoked: false,
          created_at: new Date(),
        };
        mockRefreshTokens[token.token] = token;
        return Promise.resolve(token);
      }
      // find refresh token
      if (query.includes('SELECT') && query.includes('refresh_tokens')) {
        return Promise.resolve(mockRefreshTokens[params?.[0]] || null);
      }
      // find user by id
      if (query.includes('SELECT') && query.includes('users') && query.includes('id = $1')) {
        const user = Object.values(mockUsers).find((u: any) => u.id === params?.[0]);
        return Promise.resolve(user || null);
      }
      // find tenant by slug
      if (query.includes('SELECT') && query.includes('tenants') && query.includes('slug')) {
        return Promise.resolve(mockTenants[params?.[0]] || null);
      }
      // find user tenant
      if (query.includes('SELECT') && query.includes('user_tenants') && query.includes('user_id')) {
        const ut = mockUserTenants.find((ut: any) => ut.user_id === params?.[0] && ut.tenant_id === params?.[1]);
        return Promise.resolve(ut || null);
      }
      return Promise.resolve(null);
    });

    // Mock transaction for createTenant
    mockPlsqlService.executeTransaction.mockImplementation(async (cb: Function) => {
      const queryFn = async (sql: string, params?: any[]) => {
        if (sql.includes('INSERT INTO tenants')) {
          const tenant = {
            id: 'tenant-uuid-1',
            name: params?.[0],
            slug: params?.[1],
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          };
          mockTenants[tenant.slug] = tenant;
          return { rows: [tenant] };
        }
        if (sql.includes('INSERT INTO roles')) {
          const role = { id: `role-${params?.[1]}`, tenant_id: params?.[0], name: params?.[1] };
          mockRoles.push(role);
          return { rows: [role] };
        }
        if (sql.includes('INSERT INTO user_tenants')) {
          const ut = { id: 'ut-uuid', user_id: params?.[0], tenant_id: params?.[1], role_id: params?.[2], created_at: new Date() };
          mockUserTenants.push(ut);
          return { rows: [ut] };
        }
        return { rows: [] };
      };
      return cb(queryFn);
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PlsqlService)
      .useValue(mockPlsqlService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user and return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'securePass123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.refresh_token).toBeDefined();
          accessToken = res.body.access_token;
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'securePass123' })
        .expect(400);
    });

    it('should reject short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test2@example.com', password: '123' })
        .expect(400);
    });
  });

  describe('POST /tenants', () => {
    it('should create a tenant', () => {
      return request(app.getHttpServer())
        .post('/tenants')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Acme Corp', slug: 'acme-corp' })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBe('tenant-uuid-1');
          expect(res.body.name).toBe('Acme Corp');
          expect(res.body.slug).toBe('acme-corp');
        });
    });

    it('should reject without auth', () => {
      return request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'No Auth', slug: 'no-auth' })
        .expect(401);
    });

    it('should reject invalid slug', () => {
      return request(app.getHttpServer())
        .post('/tenants')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Bad Slug', slug: 'BAD SLUG!' })
        .expect(400);
    });
  });
});
