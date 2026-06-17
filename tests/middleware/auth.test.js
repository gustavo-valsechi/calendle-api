const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/auth');

const mockJwtVerify = vi.spyOn(jwt, 'verify');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna 401 se não houver header Authorization', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 se o header não começar com Bearer', () => {
    const req = { headers: { authorization: 'Basic abc123' } };
    const res = mockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 se o token for inválido', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } };
    const res = mockRes();
    const next = vi.fn();
    mockJwtVerify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('chama next() e define req.userId com token válido', () => {
    const req = { headers: { authorization: 'Bearer token-valido' } };
    const res = mockRes();
    const next = vi.fn();
    mockJwtVerify.mockReturnValue({ id: 'user-123' });

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe('user-123');
  });
});
