import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NvoipOAuth2Api implements ICredentialType {
	name = 'nvoipOAuth2Api';
	displayName = 'Nvoip OAuth2 API';
	documentationUrl = 'https://docs.nvoip.com.br/auth';
	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'Auth URL',
			name: 'authUrl',
			type: 'string',
			default: 'https://api.nvoip.com.br/auth/oauth2/authorize',
		},
		{
			displayName: 'Token URL',
			name: 'accessTokenUrl',
			type: 'string',
			default: 'https://api.nvoip.com.br/auth/oauth2/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default: 'call:make call:query sms:send whatsapp:send whatsapp:templates openid',
		},
		{
			displayName: 'Redirect URI',
			name: 'redirectUri',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'oAuth2',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Make a Call',
					value: 'makeCall',
					description: 'Realizar uma chamada telefônica',
					action: 'Make a call',
					displayOptions: { show: { resource: ['call'] } },
				},
				{
					name: 'Send SMS',
					value: 'sendSms',
					description: 'Enviar um SMS',
					action: 'Send SMS',
					displayOptions: { show: { resource: ['sms'] } },
				},
				{
					name: 'Send WhatsApp',
					value: 'sendWhatsapp',
					description: 'Enviar mensagem via WhatsApp',
					action: 'Send WhatsApp',
					displayOptions: { show: { resource: ['whatsapp'] } },
				},
			],
			default: 'makeCall',
			description: 'Selecione a operação',
		},
	];
}
