const mongoose = require('mongoose');

require('../../src/models/Customer.js');
const Customer = mongoose.model('Customer');

const mockFindOne = vi.spyOn(Customer, 'findOne');
const mockFind = vi.spyOn(Customer, 'find');
const mockSave = vi.spyOn(Customer.prototype, 'save');

const CustomerController = require('../../src/controllers/CustomerController');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('CustomerController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('listAll', () => {
    it('retorna 200 com lista de clientes', async () => {
      const req = {};
      const res = mockRes();
      mockFind.mockResolvedValue([{ name: 'João' }]);

      await CustomerController.listAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ name: 'João' }]);
    });

    it('retorna 500 em erro de banco', async () => {
      const req = {};
      const res = mockRes();
      mockFind.mockRejectedValue(new Error('db error'));

      await CustomerController.listAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('create', () => {
    it('retorna 400 se campos obrigatórios estiverem ausentes', async () => {
      const req = { body: { name: 'João' } };
      const res = mockRes();

      await CustomerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 409 se email já estiver cadastrado', async () => {
      const req = { body: { name: 'João', phone: '11999', cpf: '000', email: 'a@a.com' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue({ email: 'a@a.com', phone: '11999', cpf: '000' });

      await CustomerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Já existe um cliente com este email!' })
      );
    });

    it('retorna 409 com mensagem de CPF se CPF já estiver em uso', async () => {
      const req = { body: { name: 'João', phone: '11999', cpf: '111', email: 'b@b.com' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue({ email: 'outro@a.com', phone: 'outro', cpf: '111' });

      await CustomerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Já existe um cliente com este CPF!' })
      );
    });

    it('retorna 201 em cadastro bem-sucedido', async () => {
      const req = { body: { name: 'João', phone: '11999', cpf: '000', email: 'a@a.com' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);
      mockSave.mockResolvedValue({});

      await CustomerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('update', () => {
    it('retorna 400 se nenhum dado for informado', async () => {
      const req = { params: { uuid: 'abc' }, body: {} };
      const res = mockRes();

      await CustomerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 se o cliente não for encontrado', async () => {
      const req = { params: { uuid: 'abc' }, body: { name: 'Novo Nome' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);

      await CustomerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 em atualização bem-sucedida', async () => {
      const req = { params: { uuid: 'abc' }, body: { name: 'Novo Nome' } };
      const res = mockRes();
      const fakeCustomer = { name: 'Velho', save: mockSave };
      mockFindOne.mockResolvedValue(fakeCustomer);
      mockSave.mockResolvedValue({});

      await CustomerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('findByUuid', () => {
    it('retorna 404 se o cliente não for encontrado', async () => {
      const req = { params: { uuid: 'abc' }, query: {} };
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);

      await CustomerController.findByUuid(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 com o cliente encontrado por uuid', async () => {
      const req = { params: { uuid: 'abc' }, query: {} };
      const res = mockRes();
      mockFindOne.mockResolvedValue({ name: 'João', uuid: 'abc' });

      await CustomerController.findByUuid(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('_getDuplicateConflictMessage', () => {
    it('retorna mensagem de email duplicado', () => {
      const existing = { email: 'a@a.com', phone: '11999', cpf: '000' };
      const result = CustomerController._getDuplicateConflictMessage(existing, {
        email: 'a@a.com', phone: '11999', cpf: '000',
      });
      expect(result).toBe('Já existe um cliente com este email!');
    });

    it('retorna mensagem de telefone duplicado', () => {
      const existing = { email: 'outro@a.com', phone: '11999', cpf: '000' };
      const result = CustomerController._getDuplicateConflictMessage(existing, {
        email: 'b@b.com', phone: '11999', cpf: '000',
      });
      expect(result).toBe('Já existe um cliente com este número de telefone!');
    });

    it('retorna null se não houver conflito', () => {
      const existing = { email: 'x@x.com', phone: '999', cpf: '111' };
      const result = CustomerController._getDuplicateConflictMessage(existing, {
        email: 'y@y.com', phone: '888', cpf: '222',
      });
      expect(result).toBeNull();
    });
  });
});
