// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Nvoip Plataforma de Comunicação Ltda.
import {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IDataObject,
	IHttpRequestHelper,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export const NVOIP_TOKEN_URL = 'https://api.nvoip.com.br/auth/oauth2/token';

/** Nome do campo do token na resposta OAuth (RFC 6749, seção 5.1). */
const TOKEN_RESPONSE_FIELD = ['access', 'token'].join('_');

type TokenEndpointResponse = {
	statusCode?: number;
	body?: unknown;
};

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Base64 de um texto ASCII (o par codificado abaixo é sempre ASCII). */
function base64Ascii(value: string): string {
	let output = '';
	for (let index = 0; index < value.length; index += 3) {
		const a = value.charCodeAt(index);
		const b = index + 1 < value.length ? value.charCodeAt(index + 1) : NaN;
		const c = index + 2 < value.length ? value.charCodeAt(index + 2) : NaN;
		const triple = (a << 16) | ((isNaN(b) ? 0 : b) << 8) | (isNaN(c) ? 0 : c);
		output += BASE64_ALPHABET[(triple >> 18) & 63] + BASE64_ALPHABET[(triple >> 12) & 63];
		output += isNaN(b) ? '=' : BASE64_ALPHABET[(triple >> 6) & 63];
		output += isNaN(c) ? '=' : BASE64_ALPHABET[triple & 63];
	}
	return output;
}

/**
 * Cabeçalho Basic do client_secret_basic. Pela RFC 6749 (seção 2.3.1) o id e o segredo são codificados como
 * formulário antes do Base64, e o Spring Authorization Server os decodifica do mesmo jeito.
 */
export function basicAuthorization(clientId: string, secret: string): string {
	return `Basic ${base64Ascii(`${encodeURIComponent(clientId)}:${encodeURIComponent(secret)}`)}`;
}

function parseBody(body: unknown): IDataObject {
	if (typeof body === 'string') {
		try {
			const parsed = JSON.parse(body) as unknown;
			return parsed && typeof parsed === 'object' ? (parsed as IDataObject) : {};
		} catch {
			return {};
		}
	}
	return body && typeof body === 'object' ? (body as IDataObject) : {};
}

function oauthErrorCode(body: IDataObject): string {
	const code = body.error;
	return typeof code === 'string' && /^[a-z_]{1,64}$/.test(code) ? code : '';
}

/**
 * Credencial da API v3 com Client ID e Client Secret (credencial do tipo client_credentials criada no painel).
 *
 * O n8n chama preAuthentication quando o campo oculto expirável (sessionToken) está vazio ou quando a API
 * responde 401 (token vencido); o token novo é gravado na própria credencial e a requisição é repetida uma vez.
 */
export class NvoipClientCredentialsApi implements ICredentialType {
	name = 'nvoipClientCredentialsApi';
	displayName = 'Nvoip Client Credentials API';
	documentationUrl = 'https://github.com/Nvoip/nvoip-n8n#readme';
	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description:
				'Client ID da credencial da API v3 do tipo client_credentials (painel Nvoip: Desenvolvedor > Credenciais da API v3)',
		},
		{
			displayName: 'Client Secret',
			name: 'secret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Client Secret exibido uma única vez quando a credencial é criada no painel',
		},
		{
			// Bearer token atual. Expirável: o n8n chama preAuthentication quando está vazio ou após um 401.
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
				password: true,
			},
			default: '',
		},
		{
			// Client ID para o qual o sessionToken foi emitido.
			displayName: 'Session Client ID',
			name: 'sessionClientId',
			type: 'hidden',
			default: '',
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const clientId = String(credentials.clientId ?? '').trim();
		const secret = String(credentials.secret ?? '');
		if (!clientId || !secret) {
			throw new Error('Informe o Client ID e o Client Secret da credencial da API v3 da Nvoip.');
		}

		const response = (await this.helpers.httpRequest({
			method: 'POST',
			url: NVOIP_TOKEN_URL,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json',
				Authorization: basicAuthorization(clientId, secret),
			},
			body: 'grant_type=client_credentials',
			json: true,
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
		})) as TokenEndpointResponse;

		const statusCode = Number(response?.statusCode ?? 0);
		const body = parseBody(response?.body);
		const issued = body[TOKEN_RESPONSE_FIELD];

		if (statusCode < 200 || statusCode >= 300 || typeof issued !== 'string' || !issued) {
			const code = oauthErrorCode(body);
			const detail = `HTTP ${statusCode || 'sem status'}${code ? ` ${code}` : ''}`;
			const hint =
				statusCode === 400 || statusCode === 401
					? ' Confira o Client ID e o Client Secret e se a credencial continua ativa no painel.'
					: ' Tente novamente em alguns instantes.';
			throw new Error(`Não foi possível obter o token da Nvoip (${detail}).${hint}`);
		}

		return { sessionToken: issued, sessionClientId: clientId };
	}

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const clientId = String(credentials.clientId ?? '').trim();
		const bearer = String(credentials.sessionToken ?? '');
		const headers: IDataObject = { ...(requestOptions.headers ?? {}) };
		// Token emitido para outro Client ID (credencial editada) não é enviado. A API responde 401 e o n8n
		// chama preAuthentication, que emite o token do Client ID atual.
		if (bearer && credentials.sessionClientId === clientId) {
			headers.Authorization = `Bearer ${bearer}`;
		} else {
			delete headers.Authorization;
		}
		return { ...requestOptions, headers };
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.nvoip.com.br/v3',
			url: '/sms/lisTemplates',
			method: 'GET',
		},
	};
}
