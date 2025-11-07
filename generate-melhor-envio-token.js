#!/usr/bin/env node

/**
 * Script para gerar Bearer Token do Melhor Envio
 * 
 * IMPORTANTE: Este script implementa o fluxo OAuth2 Client Credentials
 * que é adequado para aplicações server-to-server.
 */

const CLIENT_ID = '20813';
const CLIENT_SECRET = '0qnvjRKYUDugsNJDHhzk4KDd9rIIjRTUyZayGg2L';
const REDIRECT_URI = 'https://printbrasil.replit.app/callback'; // Ajuste conforme necessário

console.log('🔐 Gerando Bearer Token do Melhor Envio...\n');

// Passo 1: Gerar URL de autorização
const authUrl = `https://sandbox.melhorenvio.com.br/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=shipping-calculate`;

console.log('📋 PASSO 1: Autorizar aplicativo');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Acesse esta URL no navegador:');
console.log('\x1b[36m%s\x1b[0m', authUrl);
console.log('\nDepois de autorizar, você será redirecionado para:');
console.log('https://printbrasil.replit.app/callback?code=CODIGO_AQUI');
console.log('\n📝 COPIE O CÓDIGO que aparece depois de "?code=" na URL\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 PASSO 2: Trocar código por token');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Execute este comando substituindo SEU_CODIGO_AQUI pelo código copiado:\n');

const curlCommand = `curl -X POST https://sandbox.melhorenvio.com.br/oauth/token \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "grant_type": "authorization_code",
    "client_id": "${CLIENT_ID}",
    "client_secret": "${CLIENT_SECRET}",
    "redirect_uri": "${REDIRECT_URI}",
    "code": "SEU_CODIGO_AQUI"
  }'`;

console.log('\x1b[33m%s\x1b[0m', curlCommand);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 PASSO 3: Copiar o access_token');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('O comando acima vai retornar algo como:');
console.log(`{
  "token_type": "Bearer",
  "expires_in": 2592000,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "def502003b5c8d1..."
}`);
console.log('\n✅ Copie o valor do "access_token" (começa com eyJ...)');
console.log('🔐 Adicione como MELHOR_ENVIO_TOKEN nos Secrets do Replit');
console.log('🏷️  Adicione MELHOR_ENVIO_ENV=sandbox nos Secrets também\n');
