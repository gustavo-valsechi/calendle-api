const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('../models/User');
const UserModel = mongoose.model('users');

const SALT_ROUNDS = 10;

class LoginController {
  async login(req, res) {
    const { emailPhone, password } = req.body;

    if (!emailPhone || !password) {
      return res
        .status(400)
        .json({ error: true, message: 'Email/telefone e senha são obrigatórios!' });
    }

    try {
      const user = await UserModel.findOne({ emailPhone });

      if (!user) {
        return res.status(404).json({ error: true, message: 'Usuário não encontrado!' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: true, message: 'Senha incorreta!' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
      const { password: _, ...userWithoutPassword } = user.toObject();

      return res.status(200).json({
        error: false,
        message: 'Usuário logado com sucesso!',
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      return res.status(500).json({ error: true, message: 'Erro ao verificar o usuário!' });
    }
  }

  async findByUuid(req, res) {
    const { uuid } = req.params;

    try {
      const user = await UserModel.findOne({ uuid });

      if (!user) {
        return res.status(404).json({ message: 'Registro não encontrado!', error: true });
      }

      const { password: _, ...userWithoutPassword } = user.toObject();

      return res
        .status(200)
        .json({ user: userWithoutPassword, message: 'Registro encontrado!', error: false });
    } catch (error) {
      return res.status(500).json({ error: true, message: 'Erro ao buscar usuário!' });
    }
  }

  async register(req, res) {
    const { name, emailPhone, password } = req.body;

    if (!name || !emailPhone || !password) {
      return res
        .status(400)
        .json({ error: true, message: 'Nome, email/telefone e senha são obrigatórios!' });
    }

    try {
      const existingUser = await UserModel.findOne({
        $or: [{ name }, { emailPhone }],
      });

      if (existingUser) {
        if (existingUser.name === name) {
          return res
            .status(409)
            .json({ message: 'Já existe um usuário com este nome!', error: true });
        }
        return res
          .status(409)
          .json({ message: 'Já existe um usuário com este email/telefone!', error: true });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = new UserModel({ name, emailPhone, password: hashedPassword });
      await user.save();

      return res.status(201).json({ message: 'Usuário cadastrado!', error: false });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao cadastrar usuário!', error: true });
    }
  }
}

module.exports = new LoginController();
