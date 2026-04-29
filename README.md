# @nvoip/n8n-nodes-nvoip

[![Nvoip](https://img.shields.io/badge/Nvoip-site-00A3E0?style=flat-square)](https://www.nvoip.com.br/) [![API v2](https://img.shields.io/badge/API-v2-1F6FEB?style=flat-square)](https://www.nvoip.com.br/api/) [![Docs](https://img.shields.io/badge/docs-Apiary-6A737D?style=flat-square)](https://nvoip.docs.apiary.io/) [![Postman](https://img.shields.io/badge/Postman-workspace-FF6C37?style=flat-square)](https://nvoip-api.postman.co/workspace/e671d01f-168a-4c38-8d0e-c217229dd61a/team-quickstart) [![Stack](https://img.shields.io/badge/stack-n8n-EA4B71?style=flat-square)](https://github.com/Nvoip/nvoip-api-examples) [![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

Node oficial da [Nvoip](https://www.nvoip.com.br/) para integrar a API v2 com automações no [n8n](https://n8n.io/), incluindo SMS, WhatsApp, ligações e torpedo de voz.

## Introdução

Este pacote fornece um node personalizado para o n8n, permitindo integrar os serviços da Nvoip em fluxos de automação.

O projeto foi desenvolvido em TypeScript, com suporte a OAuth2 para autenticação segura e funcionalidades de comunicação multicanal.

## Como usar o node

Siga este passo a passo para configurar e usar o node `@nvoip/n8n-nodes-nvoip`:

1. Instale o node da comunidade

Abra o n8n, acesse a aba de Nodes da Comunidade, procure por `@nvoip/n8n-nodes-nvoip` e instale.

2. Adicione o node no seu fluxo

Arraste o node para o canvas de automação e clique nele para abrir as configurações.

3. Configure suas credenciais

Na aba de login/autenticação, insira suas credenciais da Nvoip. O node utiliza OAuth2 para acesso seguro à API da Nvoip.

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
- [Documentação da API](https://nvoip.docs.apiary.io/)
- [Página da API](https://www.nvoip.com.br/api/)
- [Workspace Postman](https://nvoip-api.postman.co/workspace/e671d01f-168a-4c38-8d0e-c217229dd61a/team-quickstart)
- [Hub de exemplos](https://github.com/Nvoip/nvoip-api-examples)

## Conclusão

O `@nvoip/n8n-nodes-nvoip` amplia o uso da Nvoip em automações no n8n, permitindo gerenciar comunicação multicanal em um único node.

A arquitetura modular facilita manutenção e abre espaço para evoluções futuras.
