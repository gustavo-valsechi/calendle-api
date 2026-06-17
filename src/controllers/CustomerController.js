const mongoose = require('mongoose');

require('../models/Customer');
const Customer = mongoose.model('Customer');

class CustomerController {
  _getDuplicateConflictMessage(existingCustomer, { email, phone, cpf }) {
    if (existingCustomer.email === email) return 'Já existe um cliente com este email!';
    if (existingCustomer.phone === phone)
      return 'Já existe um cliente com este número de telefone!';
    if (existingCustomer.cpf === cpf) return 'Já existe um cliente com este CPF!';
    return null;
  }

  async listAll(req, res) {
    try {
      const customers = await Customer.find();
      return res.status(200).json(customers);
    } catch (error) {
      return res.status(500).json({ error: true, message: 'Erro ao buscar clientes!' });
    }
  }

  async create(req, res) {
    const { name, phone, cpf, email } = req.body;

    if (!name || !phone || !cpf || !email) {
      return res
        .status(400)
        .json({ error: true, message: 'Nome, telefone, CPF e email são obrigatórios!' });
    }

    try {
      const existingCustomer = await Customer.findOne({
        $or: [{ email }, { phone }, { cpf }],
      });

      if (existingCustomer) {
        const conflictMessage = this._getDuplicateConflictMessage(existingCustomer, {
          email,
          phone,
          cpf,
        });
        return res.status(409).json({ message: conflictMessage, error: true });
      }

      const customer = new Customer({ name, phone, cpf, email });
      await customer.save();

      return res.status(201).json({ message: 'Cliente cadastrado!', error: false });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao cadastrar o cliente!', error: true });
    }
  }

  async update(req, res) {
    const { uuid } = req.params;
    const { name, phone, email } = req.body;

    if (!name && !phone && !email) {
      return res.status(400).json({ message: 'Nenhum dado informado!', error: true });
    }

    try {
      const customer = await Customer.findOne({ uuid });

      if (!customer) {
        return res.status(404).json({ message: 'Cliente não encontrado!', error: true });
      }

      if (name !== undefined) customer.name = name;
      if (phone !== undefined) customer.phone = phone;
      if (email !== undefined) customer.email = email;

      await customer.save();

      return res.status(200).json({ message: 'Cliente atualizado!', error: false });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar o cliente!', error: true });
    }
  }

  async findByUuid(req, res) {
    const { uuid } = req.params;
    const { cpf } = req.query;

    try {
      let customer;

      if (uuid && uuid !== 'undefined') customer = await Customer.findOne({ uuid });
      if (!customer && cpf) customer = await Customer.findOne({ cpf });

      if (!customer) {
        return res.status(404).json({ message: 'Registro não encontrado!', error: true });
      }

      return res.status(200).json({ customer, message: 'Registro encontrado!', error: false });
    } catch (error) {
      return res.status(500).json({ error: true, message: 'Erro ao buscar cliente!' });
    }
  }
}

module.exports = new CustomerController();
