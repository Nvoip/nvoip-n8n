# @nvoip/n8n-nodes-nvoip

[![Nvoip](https://img.shields.io/badge/Nvoip-site-00A3E0?style=flat-square)](https://www.nvoip.com.br/) [![API v3](https://img.shields.io/badge/API-v3-1F6FEB?style=flat-square)](https://www.nvoip.com.br/api/) [![Docs](https://img.shields.io/badge/docs-OpenAPI-6A737D?style=flat-square)](https://github.com/Nvoip/nvoip-api-v3/blob/main/docs/openapi/README.md) [![Postman](https://img.shields.io/badge/Postman-workspace-FF6C37?style=flat-square)](https://nvoip-api.postman.co/workspace/e671d01f-168a-4c38-8d0e-c217229dd61a/team-quickstart) [![Stack](https://img.shields.io/badge/stack-n8n-EA4B71?style=flat-square)](https://github.com/Nvoip/nvoip-api-examples) [![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

Node oficial da [Nvoip](https://www.nvoip.com.br/) para integrar a API v3 com automações no [n8n](https://n8n.io/), incluindo SMS, WhatsApp, ligações e torpedo de voz.

## Introdução

Este pacote fornece um node personalizado para o n8n, permitindo integrar os serviços da Nvoip em fluxos de automação.

O projeto foi desenvolvido em TypeScript, com suporte a OAuth2 para autenticação segura e funcionalidades de comunicação multicanal.

### Destinatários WhatsApp

Na operação de envio com HSM, selecione `Phone`, `BSUID` ou `Parent BSUID`.
Telefone mantém o contrato compatível `destination`; BSUID e parent BSUID usam
o objeto `recipient` tipado. Informe o identificador opaco fornecido pela Meta,
nunca `@username`, e não coloque BSUID em campos de telefone.

O retorno inclui `user_id` e `wa_id` quando a Meta os fornecer. Templates de
autenticação incompatíveis com BSUID retornam o código público estável
`WHATSAPP_BSUID_AUTH_TEMPLATE_UNSUPPORTED`.

## Como usar o node

Siga este passo a passo para configurar e usar o node `@nvoip/n8n-nodes-nvoip`:

1. Instale o node da comunidade

Abra o n8n, acesse a aba de Nodes da Comunidade, procure por `@nvoip/n8n-nodes-nvoip` e instale.

2. Adicione o node no seu fluxo

Arraste o node para o canvas de automação e clique nele para abrir as configurações.

3. Configure suas credenciais

No campo **Authentication** do node, escolha **Client ID and Secret (Automatic Renewal)** (padrão nos nodes novos) e crie a credencial **Nvoip Client Credentials API**:

- no painel da Nvoip, acesse **Integrações → N8N** e clique em **Gerar credencial do n8n** (ou, em **Desenvolvedor → Nvoip API v3 (OAuth2.0)**, crie uma credencial do tipo `client_credentials`);
- copie o **Client ID** e o **Client Secret** (o segredo aparece uma única vez) para a credencial do n8n.

O n8n pede o token sozinho na primeira execução e pede outro sempre que a API responder 401 porque o token venceu (ele vale 24 horas). Não é preciso colar token nem montar renovação no fluxo. Os detalhes estão em [Autenticação](#autenticação).

4. Configure a ação desejada

- SMS: defina o número do destinatário e a mensagem.
- WhatsApp: configure o envio de mensagens via API oficial, com suporte a templates predefinidos.
- Ligações telefônicas: escolha o ramal de origem, número de destino e configure transferências se necessário.
- Torpedo de voz: selecione envio simples ou interativo.

5. Teste o fluxo

Execute o node no modo de teste e verifique logs e mensagens enviadas para confirmar que a integração está funcionando.

6. Salve e publique seu fluxo

Quando tudo estiver configurado, salve o fluxo e publique para produção.

## SMS

- Envio de mensagens customizadas
- Suporte a variáveis e templates de SMS

## WhatsApp

- Envio de mensagens via API oficial
- Suporte a templates predefinidos

## Ligações Telefônicas

- Disparo de chamadas via ramal
- Conexão entre usuário e cliente final
- Implementação inicial do recurso `transferTrue` em desenvolvimento

## Torpedo de Voz

- Simples: texto convertido em áudio
- Interativo: envio de link para áudio público

## Links oficiais

- [Site da Nvoip](https://www.nvoip.com.br/)
- [Documentação da API](https://github.com/Nvoip/nvoip-api-v3/blob/main/docs/openapi/README.md)
- [Página da API](https://www.nvoip.com.br/api/)
- [Workspace Postman](https://nvoip-api.postman.co/workspace/e671d01f-168a-4c38-8d0e-c217229dd61a/team-quickstart)
- [Hub de exemplos](https://github.com/Nvoip/nvoip-api-examples)

## Conclusão

O `@nvoip/n8n-nodes-nvoip` amplia o uso da Nvoip em automações no n8n, permitindo gerenciar comunicação multicanal em um único node.

A arquitetura modular facilita manutenção e abre espaço para evoluções futuras.

## Autenticação

O node aceita duas credenciais. Escolha qual usar no campo **Authentication**.

| Opção | Credencial | Renovação do token |
|-------|------------|--------------------|
| **Client ID and Secret (Automatic Renewal)** — recomendada | `Nvoip Client Credentials API` | Automática. O n8n emite o token por `client_credentials` e emite outro quando a API responde 401. |
| **Access Token (Manual)** | `Nvoip Access Token API` | Nenhuma. O token colado vence em 24 horas e o fluxo passa a falhar até você colar outro. |

Como a credencial **Nvoip Client Credentials API** funciona:

- o token é pedido em `POST https://api.nvoip.com.br/auth/oauth2/token`, com `Content-Type: application/x-www-form-urlencoded`, corpo `grant_type=client_credentials` e o Client ID e o Client Secret no cabeçalho `Authorization: Basic`;
- não é preciso informar `scope`: as rotas usadas pelo node (SMS, templates de SMS e WhatsApp, envio de WhatsApp, ligações e torpedo de voz) aceitam o token da credencial e agem em nome do usuário dono dela no painel;
- o token fica guardado, criptografado, na própria credencial do n8n e não aparece na tela;
- se você trocar o Client ID, o token anterior deixa de ser usado e o n8n emite um novo na execução seguinte;
- Client ID ou Client Secret errados geram o erro `Não foi possível obter o token da Nvoip (HTTP 401 invalid_client)`.

### Workflows que já usam Access Token

Nada muda para eles: nodes criados antes desta versão continuam na opção **Access Token (Manual)** e na mesma credencial. Para parar de colar token, abra o node, troque **Authentication** para **Client ID and Secret (Automatic Renewal)**, selecione ou crie a credencial **Nvoip Client Credentials API** e salve o workflow.

## Migração para a v3

A URL base é `https://api.nvoip.com.br/v3`. O token é emitido em `https://api.nvoip.com.br/auth/oauth2/token` com `grant_type=client_credentials`, o Client ID e o Client Secret, e enviado em `Authorization: Bearer`. Com a credencial **Nvoip Client Credentials API**, o node faz isso sozinho. O token do usuário e a napikey antigos não autenticam a v3. `client_credentials` não emite refresh token: a renovação é uma nova emissão, que o n8n faz quando o token vence. A chave com escopos depende do NN-5543 e não é apresentada como disponível aqui.

[Guia de migração v2 → v3](https://github.com/Nvoip/nvoip-api-examples/blob/main/docs/migration-v2-v3.md).

Para SMS, prefira o template `ACTIVE` da própria conta. Texto livre exige liberação explícita da política da v3; HTTP 403 não deve ser contornado com credencial legada.

## Versões

### 0.2.0

- Nova credencial **Nvoip Client Credentials API** (Client ID e Client Secret), com emissão e renovação automáticas do token.
- Campo **Authentication** no node. Nodes novos (versão 2 do node) usam a credencial nova por padrão; nodes existentes (versão 1) continuam com **Access Token (Manual)**.
- Testes automatizados (`npm test`).
