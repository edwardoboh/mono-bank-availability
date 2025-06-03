import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../src/auth/auth.guard';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';

const mockContext = (key?: string): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({ headers: { 'x-api-key': key } }),
    }),
    getHandler: () => () => {},
    getClass: () => class TestClass {},
  } as unknown as ExecutionContext
);

const reflectorStub = {
  getAllAndOverride: jest.fn().mockReturnValue(false),
} as unknown as Reflector;

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new AuthGuard(new ConfigService(), reflectorStub)).toBeDefined();
  });
});

describe('AuthGuard', () => {
  it('allows when API_KEY empty (disabled)', () => {
    const guard = new AuthGuard(new ConfigService({}), reflectorStub);
    expect(guard.canActivate(mockContext(undefined) as any)).toBe(true);
  });

  it('blocks when wrong key', () => {
    const guard = new AuthGuard(new ConfigService({ apiKey: 'correctsecret' }), reflectorStub);
    expect(() => guard.canActivate(mockContext('wrongsecret') as any)).toThrow();
  });

  it('passes when key matches', () => {
    const guard = new AuthGuard(new ConfigService({ apiKey: 'correctsecret' }), reflectorStub);
    expect(guard.canActivate(mockContext('correctsecret') as any)).toBe(true);
  });
});
