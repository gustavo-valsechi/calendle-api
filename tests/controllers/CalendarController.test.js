const mongoose = require('mongoose');

require('../../src/models/Calender.js');
const Calendar = mongoose.model('Calendar');

const mockFindOne = vi.spyOn(Calendar, 'findOne');
const mockFind = vi.spyOn(Calendar, 'find');
const mockSave = vi.spyOn(Calendar.prototype, 'save');

const CalendarController = require('../../src/controllers/CalendarController');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('CalendarController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('listAll', () => {
    it('retorna 200 com lista de agendamentos', async () => {
      const req = {};
      const res = mockRes();
      mockFind.mockResolvedValue([{ title: 'Corte de cabelo' }]);

      await CalendarController.listAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ title: 'Corte de cabelo' }]);
    });

    it('retorna 500 em erro de banco', async () => {
      const req = {};
      const res = mockRes();
      mockFind.mockRejectedValue(new Error('db error'));

      await CalendarController.listAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('create', () => {
    it('retorna 400 se campos obrigatórios estiverem ausentes', async () => {
      const req = { body: { title: 'Corte' } };
      const res = mockRes();

      await CalendarController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 201 em criação bem-sucedida', async () => {
      const req = {
        body: {
          uuid_customer: 'uuid-1',
          title: 'Corte de cabelo',
          description: '',
          dt_start: '2026-06-10T10:00:00',
          dt_end: '2026-06-10T11:00:00',
        },
      };
      const res = mockRes();
      mockSave.mockResolvedValue({});

      await CalendarController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('update', () => {
    it('retorna 400 se nenhum dado for informado', async () => {
      const req = { params: { uuid: 'abc' }, body: {} };
      const res = mockRes();

      await CalendarController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 se o agendamento não for encontrado', async () => {
      const req = { params: { uuid: 'abc' }, body: { title: 'Novo título' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);

      await CalendarController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 em atualização bem-sucedida', async () => {
      const req = { params: { uuid: 'abc' }, body: { title: 'Novo título' } };
      const res = mockRes();
      const fakeCalendar = { title: 'Antigo', save: mockSave };
      mockFindOne.mockResolvedValue(fakeCalendar);
      mockSave.mockResolvedValue({});

      await CalendarController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('findByUuid', () => {
    it('retorna 404 se o agendamento não for encontrado', async () => {
      const req = { params: { uuid: 'abc' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);

      await CalendarController.findByUuid(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 com o agendamento encontrado', async () => {
      const req = { params: { uuid: 'abc' } };
      const res = mockRes();
      mockFindOne.mockResolvedValue({ title: 'Corte', uuid_customer: 'abc' });

      await CalendarController.findByUuid(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
