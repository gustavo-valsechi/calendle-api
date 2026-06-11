process.env.MONGODB_URI = 'mongodb://mock-uri/';
process.env.JWT_SECRET = 'test-secret';

// Suprime erros de conexão do mongoose durante os testes
process.on('unhandledRejection', () => {});
