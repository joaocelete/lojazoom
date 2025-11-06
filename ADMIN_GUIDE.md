# Guia do Administrador - PrintBrasil

## 🔐 Acesso ao Painel Administrativo

### Como Acessar

1. **Faça login na plataforma** em [https://seu-projeto.replit.app/login](https://seu-projeto.replit.app/login)
2. Use as credenciais de administrador:
   - **Email:** `admin@printbrasil.com`
   - **Senha:** `admin123`
3. Você será automaticamente redirecionado para `/admin`

> **Nota:** Apenas usuários com role `admin` têm acesso ao painel. Usuários normais (`customer`) serão redirecionados para a página inicial.

---

## ⚙️ Configuração de Chaves de API

### Onde Configurar Secrets/Chaves de API

PrintBrasil usa o sistema de **Secrets** do Replit para armazenar com segurança chaves de API, tokens e outras informações sensíveis.

#### Como Adicionar uma Secret:

1. **Abra a ferramenta Secrets** no seu Workspace do Replit
   - Procure por "Secrets" no painel lateral
   - Ou acesse através do ícone 🔒

2. **Clique em "New Secret"**

3. **Preencha os dados:**
   - **Key (Nome):** Nome da variável (ex: `MERCADOPAGO_API_KEY`)
   - **Value (Valor):** O valor secreto (sua chave de API)

4. **Clique em "Add Secret"**

5. A secret estará disponível automaticamente como variável de ambiente

#### Secrets Já Configuradas

As seguintes secrets já estão configuradas automaticamente pelo Replit:

- `DATABASE_URL` - String de conexão PostgreSQL
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Credenciais do banco
- `SESSION_SECRET` - Chave secreta para JWT (gerada automaticamente)

#### Secrets Futuras (Para Integrações)

Quando for implementar as integrações futuras, você precisará adicionar:

**Mercado Pago:**
```
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica
```

**Cálculo de Frete (Correios/Super Frete):**
```
SUPERFRETE_TOKEN=seu_token_aqui
```

### Como Acessar Secrets no Código

#### Backend (Node.js/TypeScript):
```typescript
const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
```

#### Frontend (Vite/React):
```typescript
// Apenas variáveis prefixadas com VITE_ são acessíveis no frontend
const apiUrl = import.meta.env.VITE_API_URL;
```

> ⚠️ **IMPORTANTE:** Nunca exponha chaves secretas no frontend! Use apenas no backend.

---

## 📊 Funcionalidades do Painel Admin

### 1. Dashboard
- Visão geral de vendas e estatísticas
- Gráficos de desempenho
- *Em desenvolvimento*

### 2. Gerenciar Produtos

#### Criar Novo Produto:
1. Clique em "Produtos" no menu lateral
2. Clique em "Novo Produto"
3. Preencha:
   - Nome do produto
   - Descrição
   - Categoria
   - Preço por m²
   - URL da imagem
4. Clique em "Salvar"

#### Deletar Produto:
1. Encontre o produto na lista
2. Clique no ícone de lixeira 🗑️
3. Confirme a exclusão

> **Nota:** A edição de produtos será implementada em breve.

### 3. Gerenciar Pedidos

#### Visualizar Pedidos:
1. Clique em "Pedidos" no menu lateral
2. Veja todos os pedidos do sistema com:
   - ID do pedido
   - Status (Pendente, Pago, Enviado, Entregue, Cancelado)
   - ID do cliente
   - Endereço de entrega
   - Data do pedido
   - Valores (subtotal, frete, total)

#### Status de Pedidos:
- 🟡 **Pendente** - Aguardando pagamento
- 🟢 **Pago** - Pagamento confirmado
- 🟢 **Enviado** - Produto em trânsito
- 🟢 **Entregue** - Pedido finalizado
- 🔴 **Cancelado** - Pedido cancelado

> **Nota:** A atualização de status de pedidos será implementada em breve.

### 4. Gerenciar Usuários
*Em desenvolvimento*

### 5. Configurações
*Em desenvolvimento*

---

## 🛡️ Segurança

### Boas Práticas

1. **Nunca compartilhe senhas de admin**
2. **Troque a senha padrão em produção:**
   - Faça login como admin
   - Acesse Configurações
   - Atualize sua senha

3. **Secrets sempre no Replit:**
   - Nunca commite chaves de API no código
   - Use sempre o sistema de Secrets do Replit

4. **Revise permissões regularmente:**
   - Verifique quais usuários têm role `admin`
   - Remova acessos desnecessários

---

## 🚀 Deployment (Publicação)

### Publicar Alterações

Quando fizer alterações e quiser publicá-las:

1. **Teste localmente** primeiro
2. **Clique em "Deploy"** no Replit
3. Seu app será publicado em `seu-projeto.replit.app`

### Secrets em Produção

- As Secrets configuradas no Workspace são automaticamente disponibilizadas no ambiente de produção
- Não é necessário configurar separadamente

---

## 📱 Responsividade

O painel admin é totalmente responsivo e funciona em:
- 💻 Desktop (melhor experiência)
- 📱 Tablets
- 📱 Smartphones

Em dispositivos móveis, o menu lateral se transforma em um menu hambúrguer.

---

## 🆘 Suporte

### Problemas Comuns

**Não consigo fazer login como admin:**
- Verifique se está usando o email correto: `admin@printbrasil.com`
- A senha padrão é: `admin123`
- Se esquecer a senha, será necessário resetar via banco de dados

**Erro ao criar produto:**
- Verifique se todos os campos obrigatórios estão preenchidos
- O preço por m² deve ser um número válido
- A URL da imagem deve ser válida

**Erro "Autenticação necessária":**
- Faça logout e login novamente
- Verifique se o cookie de sessão não expirou

---

## 📝 Changelog

### Versão 1.0.0 (Atual)
- ✅ Autenticação JWT com roles
- ✅ CRUD de produtos (criar, listar, deletar)
- ✅ Visualização de pedidos
- ✅ Interface responsiva
- ✅ Integração com banco PostgreSQL
- ✅ Sistema de segurança robusto

### Próximas Features
- 🔄 Edição de produtos
- 🔄 Atualização de status de pedidos
- 🔄 Integração Mercado Pago
- 🔄 Cálculo automático de frete
- 🔄 Dashboard com estatísticas
- 🔄 Gerenciamento de usuários
