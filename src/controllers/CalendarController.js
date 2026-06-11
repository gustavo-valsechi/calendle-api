const mongoose = require('mongoose');

require('../models/Calender');
const Calendar = mongoose.model('Calendar');

class CalendarController {

  async listAll(req, res) {
    try {
      const calendars = await Calendar.find();
      return res.status(200).json(calendars);
    } catch (error) {
      return res.status(500).json({ error: true, message: 'Erro ao buscar agendamentos!' });
    }
  }

  async create(req, res) {
    const { uuid_customer, title, description, dt_start, dt_end } = req.body;

    if (!uuid_customer || !title || !dt_start || !dt_end) {
      return res.status(400).json({ error: true, message: 'uuid_customer, title, dt_start e dt_end são obrigatórios!' });
    }

    try {
      const calendar = new Calendar({ uuid_customer, title, description, dt_start, dt_end });
      await calendar.save();

      return res.status(201).json({ message: 'Seu serviço foi agendado!', error: false });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao cadastrar o agendamento!', error: true });
    }
  }

  async update(req, res) {
    const { uuid } = req.params;
    const { title, description, dt_start, dt_end } = req.body;

    if (!title && !description && !dt_start && !dt_end) {
      return res.status(400).json({ message: 'Nenhum dado informado!', error: true });
    }

    try {
      const calendar = await Calendar.findOne({ uuid_customer: uuid });

      if (!calendar) {
        return res.status(404).json({ message: 'Nenhum agendamento encontrado!', error: true });
      }

      if (title !== undefined) calendar.title = title;
      if (description !== undefined) calendar.description = description;
      if (dt_start !== undefined) calendar.dt_start = dt_start;
      if (dt_end !== undefined) calendar.dt_end = dt_end;

      await calendar.save();

      return res.status(200).json({ message: 'O serviço foi atualizado!', error: false });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar o agendamento!', error: true });
    }
  }

  async findByUuid(req, res) {
    const { uuid } = req.params;

    try {
      const calendar = await Calendar.findOne({ uuid_customer: uuid });

      if (!calendar) {
        return res.status(404).json({ message: 'Registro não encontrado!', error: true });
      }

      return res.status(200).json({ calendar, error: false });
    } catch (error) {
      return res.status(500).json({ error: true, message: 'Erro ao buscar agendamento!' });
    }
  }
}

module.exports = new CalendarController();
