# 📡 @nvoip/n8n-nodes-nvoip

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

## 🛠️ Requisitos

- [Node.js](https://nodejs.org/) **20+** (recomendado instalar via [NVM](https://github.com/nvm-sh/nvm))  
- **npm**  
- **Git**  
- [n8n](https://docs.n8n.io/getting-started/installation/) instalado globalmente:

```bash
npm install -g n8n

## ⚙️ Instalação e Setup

Clone o repositório base e instale as dependências:

```bash
git clone https://github.com/nvoip/n8n-nodes-nvoip.git
cd n8n-nodes-nvoip
npm install

Inicie o n8n em modo de desenvolvimento:

n8n start


🔑 Autenticação (OAuth2)
A integração utiliza OAuth2.
Durante o desenvolvimento foi necessário atualizar endpoints desatualizados para garantir compatibilidade com a versão mais recente da API da Nvoip.

Após configurar as credenciais no editor do n8n, o acesso é feito de forma segura e transparente.

📲 Funcionalidades
SMS
Envio de mensagens customizadas

Suporte a variáveis e templates de SMS

WhatsApp
Envio de mensagens via API oficial

Suporte a templates predefinidos

Ligações Telefônicas
Disparo de chamadas via ramal

Conexão entre usuário e cliente final

Implementação inicial do recurso transferTrue (em desenvolvimento)

Torpedo de Voz
Simples: texto convertido em áudio

Interativo: envio de link para áudio público

