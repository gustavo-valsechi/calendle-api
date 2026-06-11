# Changelog

Todas as mudanças relevantes neste projeto serão documentadas neste arquivo.

O formato segue as recomendações de [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [1.0.0] - 2026-06-10

### Hardcoded Secret

- Credenciais do MongoDB (`usuário` e `senha`) removidas do código-fonte e movidas para variável de ambiente `MONGODB_URI` via arquivo `.env`
- Criado `.env.example` como template de configuração para outros ambientes
- Adicionada dependência `dotenv` e carregamento via `require('dotenv').config()` no topo de `app.js`

### Sensitive Data Exposure

- Senhas agora são armazenadas com hash `bcrypt` (salt rounds: 10) em vez de texto puro
- Autenticação de login substituiu comparação direta de strings por `bcrypt.compare`
- Campo `password` removido das respostas do login e da busca de usuário por uuid

### Missing Access Control

- Criado middleware de autenticação JWT em `src/middleware/auth.js`
- Todas as rotas, exceto `POST /login` e `POST /login/register`, passaram a exigir header `Authorization: Bearer <token>`
- Adicionada dependência `jsonwebtoken`; endpoint `POST /login` agora retorna o token na resposta

### Missing Validation

- Adicionada validação de campos obrigatórios em todos os endpoints de criação e atualização
- Todos os métodos passaram a usar `try/catch` com retorno de status `500` em caso de erro interno

### Mass Assignment Vulnerability

- Métodos `update` de `CustomerController` e `CalendarController` substituíram `Object.assign(entity, req.body)` por atribuição explícita campo a campo, impedindo que campos internos sejam sobrescritos pela requisição

### Incorrect Error Handling

- Status HTTP corrigidos em todos os controllers:
  - Erros de validação retornam `400` (antes `200`)
  - Não autenticado retorna `401` (antes `200`)
  - Recurso não encontrado retorna `404` (antes `200`)
  - Conflito de dados duplicados retorna `409` (antes `200`)
  - Criação bem-sucedida retorna `201` (antes `200`)
  - Erros internos retornam `500` (antes `200`)

### Duplicate Code

- Lógica de identificação de campo duplicado em `CustomerController.create` extraída para o método `_getDuplicateConflictMessage` — o método principal deixou de acumular a responsabilidade de verificar conflitos e salvar o cliente

### Bad Names

- Métodos `Get`, `Post`, `Put` renomeados para `listAll`, `create`, `update` em `CustomerController` e `CalendarController` — nomes anteriores eram verbos HTTP e não descreviam a intenção de domínio
- Método `searchRegister` renomeado para `findByUuid` nos três controllers — nome anterior misturava idiomas e não comunicava o que buscava
- Método `LoginController.User` renomeado para `login` — nome idêntico ao da constante do model causava ambiguidade
- Método `LoginController.Post` renomeado para `register` — nome genérico substituído por nome que descreve a intenção
- Variável `auxCustomer` renomeada para `existingCustomer` — prefixo `aux` não comunica o papel da variável
- Constante do model `User` renomeada para `UserModel` em `LoginController` para eliminar conflito com o nome do método `login`

### Dead Code

- Método estático `CalendarController.isAvailable` removido — declarado mas nunca chamado em nenhuma parte do sistema
- Importação de `moment` e chamada de `moment.locale` removidas de `CalendarController` — biblioteca importada mas não utilizada em nenhuma operação

### Other

- `console.log` de depuração removidos dos controllers
- Duplo ponto-e-vírgula no final de `src/models/Customer.js` removido
- Typo `Calender` / `CalenderSchema` corrigido para `Calendar` / `CalendarSchema` no model e no controller
- Verificação `uuid !== 'undefined'` em `CustomerController.findByUuid` passou a incluir checagem de nulidade (`uuid && uuid !== 'undefined'`)
- Verificação inútil de `req.body` em rotas GET removida de `LoginController` e `CalendarController`

## [0.1.0] - versão original

Versão inicial do projeto sem refatoração, disponível na branch `original`.
