// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Nvoip Plataforma de Comunicação Ltda.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
	NvoipClientCredentialsApi,
	NVOIP_TOKEN_URL,
} = require('../dist/credentials/NvoipClientCredentialsApi.credentials.js');
const { NvoipAccessTokenApi } = require('../dist/credentials/NvoipAccessTokenApi.credentials.js');

const CLIENT_ID = 'cli-test-1';
// Valor fictício com caracteres que exigem codificação no Basic.
const FAKE_PAIR_PART = 's+/:%é9';

function tokenResponse(statusCode, value) {
	const body = {};
	body[['access', 'token'].join('_')] = value;
	return { statusCode, body };
}

function helperReturning(...responses) {
	const calls = [];
	return {
		calls,
		helpers: {
			async httpRequest(options) {
				calls.push(options);
				const next = responses.shift();
				if (next instanceof Error) throw next;
				return next;
			},
		},
	};
}

function decodeBasic(header) {
	assert.match(header, /^Basic [A-Za-z0-9+/]+=*$/);
	return Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8');
}

function settings(overrides) {
	return { clientId: CLIENT_ID, secret: FAKE_PAIR_PART, sessionToken: '', sessionClientId: '', ...overrides };
}

test('preAuthentication pede client_credentials por formulário com Basic e sem scope', async () => {
	const credential = new NvoipClientCredentialsApi();
	const helper = helperReturning(tokenResponse(200, 'fake-jwt-1'));

	const output = await credential.preAuthentication.call(helper, settings({ clientId: ` ${CLIENT_ID} ` }));

	assert.deepEqual(output, { sessionToken: 'fake-jwt-1', sessionClientId: CLIENT_ID });
	assert.equal(helper.calls.length, 1);
	const request = helper.calls[0];
	assert.equal(request.method, 'POST');
	assert.equal(request.url, NVOIP_TOKEN_URL);
	assert.equal(request.url, 'https://api.nvoip.com.br/auth/oauth2/token');
	assert.equal(request.headers['Content-Type'], 'application/x-www-form-urlencoded');
	assert.equal(request.body, 'grant_type=client_credentials');
	assert.equal(request.ignoreHttpStatusErrors, true);
	assert.equal(request.returnFullResponse, true);
	assert.equal(request.auth, undefined);
	// RFC 6749, seção 2.3.1 — id e segredo vão codificados como formulário antes do Base64.
	assert.equal(
		decodeBasic(request.headers.Authorization),
		`${encodeURIComponent(CLIENT_ID)}:${encodeURIComponent(FAKE_PAIR_PART)}`,
	);
});

test('preAuthentication aceita corpo JSON em texto', async () => {
	const credential = new NvoipClientCredentialsApi();
	const response = tokenResponse(200, 'fake-jwt-2');
	response.body = JSON.stringify(response.body);
	const output = await credential.preAuthentication.call(helperReturning(response), settings());
	assert.equal(output.sessionToken, 'fake-jwt-2');
});

test('401 invalid_client vira erro claro, sem o segredo e sem response (o n8n não repete)', async () => {
	const credential = new NvoipClientCredentialsApi();
	const helper = helperReturning({ statusCode: 401, body: { error: 'invalid_client' } });
	await assert.rejects(credential.preAuthentication.call(helper, settings()), (error) => {
		assert.match(error.message, /HTTP 401 invalid_client/);
		assert.match(error.message, /Client ID e o Client Secret/);
		assert.ok(!error.message.includes(FAKE_PAIR_PART));
		assert.equal(error.response, undefined);
		return true;
	});
});

test('5xx e resposta sem token falham sem gravar nada', async () => {
	const credential = new NvoipClientCredentialsApi();
	await assert.rejects(
		credential.preAuthentication.call(helperReturning({ statusCode: 503, body: '<html>' }), settings()),
		/HTTP 503\)\. Tente novamente/,
	);
	await assert.rejects(
		credential.preAuthentication.call(helperReturning({ statusCode: 200, body: {} }), settings()),
		/HTTP 200/,
	);
});

test('preAuthentication exige Client ID e Client Secret antes de chamar a rede', async () => {
	const credential = new NvoipClientCredentialsApi();
	const helper = helperReturning();
	await assert.rejects(credential.preAuthentication.call(helper, settings({ clientId: '' })), /Informe o Client ID/);
	await assert.rejects(credential.preAuthentication.call(helper, settings({ secret: '' })), /Informe o Client ID/);
	assert.equal(helper.calls.length, 0);
});

test('contrato do n8n: um único campo oculto expirável, protegido, devolvido pelo preAuthentication', async () => {
	const credential = new NvoipClientCredentialsApi();
	const expirable = credential.properties.filter(
		(property) => property.type === 'hidden' && property.typeOptions && property.typeOptions.expirable === true,
	);
	assert.equal(expirable.length, 1);
	assert.equal(expirable[0].name, 'sessionToken');
	assert.equal(expirable[0].default, '');
	// Com typeOptions.password o n8n mascara o token na tela da credencial e o restaura ao salvar.
	assert.equal(expirable[0].typeOptions.password, true);
	const secretField = credential.properties.find((property) => property.name === 'secret');
	assert.equal(secretField.typeOptions.password, true);

	const output = await credential.preAuthentication.call(
		helperReturning(tokenResponse(200, 'fake-jwt-3')),
		settings(),
	);
	assert.notEqual(output[expirable[0].name], undefined);
});

test('authenticate manda Bearer só com token emitido para o Client ID atual', async () => {
	const credential = new NvoipClientCredentialsApi();
	const ok = await credential.authenticate(
		settings({ sessionToken: 'fake-jwt-4', sessionClientId: CLIENT_ID }),
		{ url: 'https://api.nvoip.com.br/v3/sms', headers: { 'Content-Type': 'application/json' } },
	);
	assert.equal(ok.headers.Authorization, 'Bearer fake-jwt-4');
	assert.equal(ok.headers['Content-Type'], 'application/json');

	const otherClient = await credential.authenticate(
		settings({ clientId: 'cli-test-2', sessionToken: 'fake-jwt-4', sessionClientId: CLIENT_ID }),
		{ url: 'https://api.nvoip.com.br/v3/sms', headers: { Authorization: 'Bearer fake-old' } },
	);
	assert.equal(otherClient.headers.Authorization, undefined);

	const empty = await credential.authenticate(settings(), { url: 'https://api.nvoip.com.br/v3/sms' });
	assert.equal(empty.headers.Authorization, undefined);
});

test('credencial antiga de Access Token continua igual', () => {
	const legacy = new NvoipAccessTokenApi();
	assert.equal(legacy.name, 'nvoipAccessTokenApi');
	assert.equal(legacy.properties.length, 1);
	assert.equal(legacy.properties[0].displayName, 'Access Token');
	assert.match(legacy.authenticate.properties.headers.Authorization, /^=\{\{"Bearer " \+ \$credentials\./);
});

/**
 * Simulação do ciclo do n8n (n8n-io/n8n, packages/core/.../request-helper-functions.ts,
 * httpRequestWithAuthentication, e packages/cli/src/credentials-helper.ts, preAuthentication).
 * Token vazio → preAuthentication; 401 da API → preAuthentication(expired) e uma nova tentativa.
 */
async function n8nRequest(credentialType, stored, api, tokenHelper) {
	const expirable = credentialType.properties.find(
		(property) => property.type === 'hidden' && property.typeOptions && property.typeOptions.expirable,
	);
	const data = { ...stored.data };
	const pre = async (expired) => {
		if (data[expirable.name] === '' || expired) {
			const output = await credentialType.preAuthentication.call(tokenHelper, data);
			if (output[expirable.name] === undefined) return;
			Object.assign(data, output);
			stored.data = { ...data };
		}
	};
	try {
		await pre(false);
		return await api(await credentialType.authenticate(data, { url: '/v3/sms', headers: {} }));
	} catch (error) {
		if (!(error.response && error.response.status === 401)) throw error;
		await pre(true);
		return await api(await credentialType.authenticate(data, { url: '/v3/sms', headers: {} }));
	}
}

test('simulação do n8n: emite na primeira chamada, reaproveita e renova sozinho no 401', async () => {
	const credentialType = new NvoipClientCredentialsApi();
	const stored = { data: settings() };
	const tokenHelper = helperReturning(tokenResponse(200, 'fake-day-1'), tokenResponse(200, 'fake-day-2'));
	const valid = new Set(['fake-day-1']);
	const seen = [];
	const api = async (options) => {
		const header = options.headers.Authorization || '';
		seen.push(header);
		if (!valid.has(header.replace('Bearer ', ''))) {
			const error = new Error('Unauthorized');
			error.response = { status: 401 };
			throw error;
		}
		return { ok: true };
	};

	assert.deepEqual(await n8nRequest(credentialType, stored, api, tokenHelper), { ok: true });
	assert.deepEqual(await n8nRequest(credentialType, stored, api, tokenHelper), { ok: true });
	assert.equal(tokenHelper.calls.length, 1);

	// 24 h depois: o JWT venceu, a v3 responde 401 e o n8n pede outro token uma vez.
	valid.clear();
	valid.add('fake-day-2');
	assert.deepEqual(await n8nRequest(credentialType, stored, api, tokenHelper), { ok: true });
	assert.equal(tokenHelper.calls.length, 2);
	assert.equal(stored.data.sessionToken, 'fake-day-2');
	assert.deepEqual(seen, ['Bearer fake-day-1', 'Bearer fake-day-1', 'Bearer fake-day-1', 'Bearer fake-day-2']);

	// Credencial editada para outro Client ID: o token antigo não sai; o 401 provoca a emissão do novo.
	stored.data.clientId = 'cli-test-2';
	tokenHelper.helpers.httpRequest = async (options) => {
		tokenHelper.calls.push(options);
		return tokenResponse(200, 'fake-client-2');
	};
	valid.add('fake-client-2');
	seen.length = 0;
	assert.deepEqual(await n8nRequest(credentialType, stored, api, tokenHelper), { ok: true });
	assert.deepEqual(seen, ['', 'Bearer fake-client-2']);
	assert.equal(stored.data.sessionClientId, 'cli-test-2');
});
