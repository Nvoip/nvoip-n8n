import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class NvoipOAuth2Api implements ICredentialType {
  name = 'nvoipOAuth2Api';
  displayName = 'Nvoip OAuth2 API';
  documentationUrl = 'https://nvoip.atlassian.net/wiki/spaces/NVOlP/pages/1362558978/OAuth+2.0+-+Documenta+o';
  extends = ['oAuth2Api'];

  oauth2 = {
    authorizeUrl: 'https://api.nvoip.com.br/auth/oauth2/authorize',
    accessTokenUrl: 'https://api.nvoip.com.br/auth/oauth2/token',
    authentication: 'header' as const,
    scope: 'call:make call:query sms:send whatsapp:send whatsapp:templates openid',
  };

	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: 'N8N-Test',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			default: '923683fc-02d4-4c24-b5a8-a34c642a0cf6',
			required: true,
			typeOptions: {
				password: true,
			},
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'call:make call:query sms:send whatsapp:send whatsapp:templates openid',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://api.nvoip.com.br/auth/oauth2/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.nvoip.com.br/auth/oauth2/token',
		},
		{
			displayName: 'Refresh Token URL',
			name: 'refreshTokenUrl',
			type: 'hidden',
			default: 'https://api.nvoip.com.br/auth/oauth2/token',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		// {
		// 	displayName: 'Authentication',
		// 	name: 'authentication',
		// 	type: 'hidden',
		// 	default: 'header',
		// },
	];

  test = {
    request: {
      method: 'GET' as const,
      url: 'https://api.nvoip.com.br/v2/list/users',
    },
  };
}
