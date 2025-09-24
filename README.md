// SPDX-License-Identifier: MIT
// Portions Copyright (c) 2022 n8n GmbH
// Modifications Copyright (c) 2025 Nvoip Plataforma de Comunicação Ltda.
# 📡 @nvoip/n8n-nodes-nvoip

[![Node.js Version](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![n8n](https://img.shields.io/badge/n8n-supported-brightgreen)](https://n8n.io/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

Integração da **Nvoip** com o **[n8n](https://n8n.io/)** para automação de comunicações:  
✅ Envio de SMS  
✅ Mensagens via WhatsApp  
✅ Ligações telefônicas  
✅ Torpedos de voz (simples e interativos)  

---

## 🚀 Introdução
Este pacote fornece um **node personalizado para o n8n**, permitindo integrar de forma simples e rápida os serviços da **Nvoip** em fluxos de automação.  
O projeto foi desenvolvido em **TypeScript**, com suporte a **OAuth2** para autenticação segura e diversas funcionalidades de comunicação.

---

## ⚙️ Como usar o node

Siga este passo a passo para configurar e usar o node @nvoip/n8n-nodes-nvoip:

1. **Instale o node da comunidade**  
   - Abra o n8n e vá até a aba de **Nodes da Comunidade**.  
   - Procure por `@nvoip/n8n-nodes-nvoip` e instale.

2. **Adicione o node no seu fluxo**  
   - Arraste o node para o seu canvas de automação.  
   - Clique nele para abrir as configurações.

3. **Configure suas credenciais**  
   - Na aba de **Login/Autenticação**, insira suas credenciais da Nvoip.  
   - O node utiliza **OAuth2**, garantindo acesso seguro à API da Nvoip.

4. **Configure a ação desejada**  
   - **SMS**: Defina o número do destinatário e a mensagem (suporte a variáveis e templates).  
   - **WhatsApp**: Configure o envio de mensagens via API oficial, com suporte a templates predefinidos.  
   - **Ligações telefônicas**: Escolha o ramal de origem, número de destino e configure transferências se necessário.  
   - **Torpedo de voz**: Selecione **Simples** (texto convertido em áudio) ou **Interativo** (envio de link para áudio público).

5. **Teste o fluxo**  
   - Execute o node no modo de teste.  
   - Verifique logs e mensagens enviadas para garantir que a integração está funcionando corretamente.

6. **Salve e publique seu fluxo**  
   - Quando tudo estiver configurado, salve o fluxo e publique para produção.


## SMS

-	Envio de mensagens customizadas
	
-	Suporte a variáveis e templates de SMS

## WhatsApp

-	Envio de mensagens via API oficial
	
-	Suporte a templates predefinidos

## Ligações Telefônicas

-	Disparo de chamadas via ramal
	
-	Conexão entre usuário e cliente final
	
-	Implementação inicial do recurso transferTrue (em desenvolvimento)
	
-	Torpedo de Voz
	
-	Simples: texto convertido em áudio
	
-	Interativo: envio de link para áudio público

## 📌 Conclusão

O @nvoip/n8n-nodes-nvoip amplia o poder de automação no n8n, permitindo gerenciar toda a comunicação multicanal da Nvoip em um único node.
A arquitetura modular garante extensibilidade e manutenção simples, abrindo espaço para futuras evoluções.

