const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

require('../../src/models/User.js');
const UserModel = mongoose.model('users');

const mockFindOne = vi.spyOn(UserModel, 'findOne');
const mockSave = vi.spyOn(UserModel.prototype, 'save');
const mockBcryptCompare = vi.spyOn(bcrypt, 'compare');
const mockBcryptHash = vi.spyOn(bcrypt, 'hash');
const mockJwtSign = vi.spyOn(jwt, 'sign').mockReturnValue('test-token');

const LoginController = require('../../src/controllers/LoginController');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('LoginController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('login', () => {
    it('retorna 400 se emailPhone ou password estiverem ausentes', async () => {
      const req = { body: { emailPhone: 'test@test.com' } };
      const res = mockRes();

      await LoginController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }));
    });

    it('retorna 404 se o usuário não for encontrado', async () => {
      const req = { body: { emailPhone: 'test@test.com', password: '123' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);

      await LoginController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 401 se a senha estiver incorreta', async () => {
      const req = { body: { emailPhone: 'test@test.com', password: '123' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue({
        _id: '1',
        password: 'hashed',
        toObject: () => ({ _id: '1', password: 'hashed' }),
      });
      mockBcryptCompare.mockResolvedValue(false);

      await LoginController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 200 e token em login bem-sucedido', async () => {
      const req = { body: { emailPhone: 'test@test.com', password: '123' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue({
        _id: '1',
        password: 'hashed',
        toObject: () => ({ _id: '1', name: 'Test', password: 'hashed' }),
      });
      mockBcryptCompare.mockResolvedValue(true);

      await LoginController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: false, token: 'test-token' })
      );
    });

    it('não expõe o campo password na resposta do login', async () => {
      const req = { body: { emailPhone: 'test@test.com', password: '123' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue({
        _id: '1',
        password: 'hashed',
        toObject: () => ({ _id: '1', name: 'Test', password: 'hashed' }),
      });
      mockBcryptCompare.mockResolvedValue(true);

      await LoginController.login(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.user).not.toHaveProperty('password');
    });

    it('retorna 500 em erro inesperado', async () => {
      const req = { body: { emailPhone: 'test@test.com', password: '123' } };
      const res = mockRes();
      mockFindOne.mockRejectedValue(new Error('db error'));

      await LoginController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('register', () => {
    it('retorna 400 se campos obrigatórios estiverem ausentes', async () => {
      const req = { body: { name: 'Test' } };
      const res = mockRes();

      await LoginController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 409 se o nome já estiver em uso', async () => {
      const req = { body: { name: 'Test', emailPhone: 'test@test.com', password: '123' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue({ name: 'Test', emailPhone: 'outro@test.com' });

      await LoginController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('retorna 201 em cadastro bem-sucedido', async () => {
      const req = { body: { name: 'Test', emailPhone: 'test@test.com', password: '123' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue('hashed-password');
      mockSave.mockResolvedValue({});

      await LoginController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});
