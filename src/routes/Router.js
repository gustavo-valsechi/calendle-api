const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const CustomerController = require('../controllers/CustomerController');
const LoginController = require('../controllers/LoginController');
const CalendarController = require('../controllers/CalendarController');

// Rotas públicas
router.post('/login/register', LoginController.register);
router.post('/login', LoginController.login);

// Rotas protegidas
router.use(authMiddleware);

router.get('/login/:uuid', LoginController.findByUuid);

router.get('/customer', CustomerController.listAll);
router.get('/customer/:uuid', CustomerController.findByUuid);
router.post('/customer', CustomerController.create);
router.put('/customer/:uuid', CustomerController.update);

router.get('/calendar', CalendarController.listAll);
router.get('/calendar/:uuid', CalendarController.findByUuid);
router.post('/calendar', CalendarController.create);
router.put('/calendar/:uuid', CalendarController.update);

module.exports = router;
