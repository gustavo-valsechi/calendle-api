# Calendle API

API REST de agendamentos desenvolvida em Node.js com Express e MongoDB. Permite gerenciar usuários, clientes e agendamentos com autenticação via JWT.

---

## Funcionalidades

- **Autenticação:** cadastro e login de usuários com geração de token JWT
- **Clientes:** cadastro, listagem, busca por UUID ou CPF, e atualização de dados
- **Agendamentos:** criação, listagem, busca e atualização de agendamentos vinculados a clientes
- **Proteção de rotas:** todas as rotas (exceto login e cadastro) exigem token JWT válido no header `Authorization`

---

## Instalação e execução

### Pré-requisitos

- Node.js 18+
- MongoDB (local ou Atlas)

### Configuração

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd calendle-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com sua URI do MongoDB e segredo JWT
```

### Variáveis de ambiente (`.env`)

```
MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/calendle
JWT_SECRET=seu_segredo_aqui
PORT=5555
```

### Executar

```bash
# Desenvolvimento (hot-reload)
npm run dev

# Produção
npm start
```

---

## Testes

```bash
# Rodar todos os testes
npm test

# Rodar com relatório de cobertura
npm run test:coverage
```

### Cobertura atual

| Arquivo                  | Statements | Branches | Functions | Lines |
|--------------------------|------------|----------|-----------|-------|
| CalendarController.js    | 92.77%     | 76%      | 100%      | 92.77% |
| CustomerController.js    | 94.23%     | 81.25%   | 100%      | 94.23% |
| LoginController.js       | 76.47%     | 87.5%    | 66.66%    | 76.47% |
| auth.js (middleware)     | 100%       | 100%     | 100%      | 100%  |
| **Total**                | **84.97%** | **80.76%** | **85.71%** | **84.97%** |

Os testes cobrem os controllers e o middleware de autenticação, validando fluxos de sucesso, erros de validação, conflitos de dados e falhas internas.

---

## Linter e formatação

```bash
# Verificar problemas
npm run lint

# Corrigir automaticamente
npm run lint:fix

# Formatar código
npm run format
```

O projeto utiliza **ESLint** para análise estática e **Prettier** para formatação. As configurações estão em [`.eslintrc.js`](.eslintrc.js) e [`.prettierrc`](.prettierrc).

---

## Principais problemas detectados

A análise do código original identificou **8 categorias de code smells**:

### 1. Hardcoded Secret
Credenciais do MongoDB estavam escritas diretamente no código-fonte, expondo usuário e senha no repositório.

### 2. Sensitive Data Exposure
Senhas de usuários eram armazenadas em texto puro no banco de dados e retornadas nas respostas da API.

### 3. Missing Access Control
Não havia nenhum mecanismo de autenticação — qualquer requisição sem credencial acessava todos os endpoints.

### 4. Missing Validation
Campos obrigatórios não eram validados antes de tentar salvar no banco. Erros internos não tinham tratamento adequado.

### 5. Mass Assignment Vulnerability
Nos métodos de atualização, `Object.assign(entity, req.body)` permitia que qualquer campo do body sobrescrevesse campos internos do documento.

### 6. Incorrect Error Handling
Todos os retornos usavam status `200`, independentemente do resultado — erros de validação, recursos não encontrados e conflitos retornavam o mesmo status de sucesso.

### 7. Duplicate Code
A lógica de verificação de campo duplicado no `CustomerController` estava embutida no método `create`, acumulando responsabilidades e dificultando manutenção.

### 8. Bad Names / Dead Code
Métodos nomeados como `Get`, `Post`, `Put` não comunicavam intenção de domínio. Havia métodos declarados mas nunca chamados e bibliotecas importadas sem uso.

---

## Estratégias de refatoração

- **Extração de variáveis de ambiente:** uso de `dotenv` para remover credenciais do código
- **Hash de senhas:** substituição de armazenamento em texto puro por `bcrypt`
- **Middleware de autenticação JWT:** criação de `src/middleware/auth.js` aplicado a todas as rotas protegidas
- **Validação explícita:** checagem de campos obrigatórios no início de cada método antes de qualquer operação
- **Atribuição explícita campo a campo:** eliminação do `Object.assign` nos métodos de update
- **Correção de status HTTP:** mapeamento correto de 201, 400, 401, 404, 409 e 500
- **Extração de método:** lógica de conflito de duplicata movida para `_getDuplicateConflictMessage`
- **Renomeação:** métodos e variáveis renomeados para refletir intenção de domínio em português/inglês consistente
- **Remoção de código morto:** método `isAvailable`, importação de `moment` e `console.log` de depuração removidos

---

## Estrutura do projeto

```
src/
├── controllers/
│   ├── CalendarController.js
│   ├── CustomerController.js
│   └── LoginController.js
├── database/
│   └── Index.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Calender.js
│   ├── Customer.js
│   └── User.js
└── routes/
    └── Router.js
tests/
├── controllers/
│   ├── CalendarController.test.js
│   ├── CustomerController.test.js
│   └── LoginController.test.js
└── middleware/
    └── auth.test.js
```

---

## Branches

| Branch     | Descrição                              |
|------------|----------------------------------------|
| `original` | Versão original do projeto sem refatoração |
| `refatorado`     | Versão refatorada e com testes         |

---

## Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para o histórico completo de mudanças.
