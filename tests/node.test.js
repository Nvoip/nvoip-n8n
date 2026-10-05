// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Nvoip Plataforma de Comunicação Ltda.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const { Nvoip, credentialTypeFor } = require('../dist/nodes/Nvoip/Nvoip.node.js');

function authenticationProperties() {
	return new Nvoip().description.properties.filter((property) => property.name === 'authentication');
}

test('versão 1 (workflows existentes) continua no Access Token; versão 2 usa Client ID e Secret', () => {
	const description = new Nvoip().description;
	assert.deepEqual(description.version, [1, 2]);

	const [v1, v2] = authenticationProperties();
	assert.deepEqual(v1.displayOptions.show['@version'], [1]);
	assert.equal(v1.default, 'manualToken');
	assert.deepEqual(v2.displayOptions.show['@version'], [2]);
	assert.equal(v2.default, 'clientCredentials');
	for (const property of [v1, v2]) {
		assert.deepEqual(
			property.options.map((option) => option.value),
			['manualToken', 'clientCredentials'],
		);
	}
});

test('cada credencial aparece só para o modo de autenticação dela', () => {
	const credentials = new Nvoip().description.credentials;
	assert.deepEqual(
		credentials.map((credential) => [credential.name, credential.displayOptions.show.authentication]),
		[
			['nvoipAccessTokenApi', ['manualToken']],
			['nvoipClientCredentialsApi', ['clientCredentials']],
		],
	);
	assert.equal(credentialTypeFor(undefined), 'nvoipAccessTokenApi');
	assert.equal(credentialTypeFor('manualToken'), 'nvoipAccessTokenApi');
	assert.equal(credentialTypeFor('clientCredentials'), 'nvoipClientCredentialsApi');
});

function executeContext(parameters, calls) {
	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter(name, _itemIndex, fallback) {
			return Object.prototype.hasOwnProperty.call(parameters, name) ? parameters[name] : fallback;
		},
		getNode: () => ({ name: 'Nvoip', type: 'n8n-nodes-base.nvoip', typeVersion: 1, parameters: {} }),
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication: {
				async call(_context, credentialType, options) {
					calls.push({ credentialType, method: options.method, url: options.url });
					return { ok: true };
				},
			},
		},
	};
}

test('workflow salvo sem o parâmetro authentication usa a credencial antiga', async () => {
	const calls = [];
	const context = executeContext(
		{ resource: 'sms', operation: 'sendSms', to: '11999990000', message: 'teste' },
		calls,
	);
	const output = await new Nvoip().execute.call(context);
	assert.deepEqual(output[0][0].json, { ok: true });
	assert.deepEqual(calls, [
		{ credentialType: 'nvoipAccessTokenApi', method: 'POST', url: 'https://api.nvoip.com.br/v3/sms' },
	]);
});

test('authentication=clientCredentials usa a credencial nova em todas as chamadas', async () => {
	const calls = [];
	const context = executeContext(
		{
			authentication: 'clientCredentials',
			resource: 'call',
			operation: 'makeCall',
			callerId: '1049',
			destination: '11999990000',
			transfer: false,
		},
		calls,
	);
	await new Nvoip().execute.call(context);
	assert.deepEqual(calls, [
		{
			credentialType: 'nvoipClientCredentialsApi',
			method: 'POST',
			url: 'https://api.nvoip.com.br/v3/calls/',
		},
	]);
});

test('loadOptions usa a credencial do modo escolhido', async () => {
	const calls = [];
	const context = {
		getNodeParameter: (name, fallback) => (name === 'authentication' ? 'clientCredentials' : fallback),
		helpers: {
			httpRequestWithAuthentication: {
				async call(_context, credentialType, options) {
					calls.push({ credentialType, url: options.url });
					return [];
				},
			},
		},
	};
	const node = new Nvoip();
	await node.methods.loadOptions.getTemplates.call(context);
	await node.methods.loadOptions.getTemplatesWhatsApp.call(context);
	assert.deepEqual(calls, [
		{ credentialType: 'nvoipClientCredentialsApi', url: 'https://api.nvoip.com.br/v3/sms/lisTemplates' },
		{ credentialType: 'nvoipClientCredentialsApi', url: 'https://api.nvoip.com.br/v3/wa/listTemplates' },
	]);
});

test('nenhuma chamada do nó fixa a credencial antiga no código', () => {
	const source = readFileSync(resolve(__dirname, '..', 'nodes', 'Nvoip', 'Nvoip.node.ts'), 'utf8');
	const literalUses = source.match(/'nvoipAccessTokenApi'/g) || [];
	assert.equal(literalUses.length, 1, 'o nome só aparece na constante ACCESS_TOKEN_CREDENTIAL');
	const authenticatedCalls = source.match(/httpRequestWithAuthentication\.call\(/g) || [];
	assert.equal(authenticatedCalls.length, 9);
});

test('package.json registra as duas credenciais para o n8n', () => {
	const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf8'));
	assert.deepEqual(pkg.n8n.credentials, [
		'dist/credentials/NvoipAccessTokenApi.credentials.js',
		'dist/credentials/NvoipClientCredentialsApi.credentials.js',
	]);
});

test('n8n-workflow real: node v1 salvo sem authentication resolve Access Token; v2 resolve Client ID e Secret', () => {
	const { NodeHelpers } = require('n8n-workflow');
	const description = new Nvoip().description;
	// Parâmetros como um workflow antigo os guarda: sem o campo authentication.
	const saved = { resource: 'sms', operation: 'sendSms', to: '11999990000', message: 'teste' };

	const v1 = NodeHelpers.getNodeParameters(description.properties, saved, true, false, { typeVersion: 1 });
	assert.equal(v1.authentication, 'manualToken');
	const v2 = NodeHelpers.getNodeParameters(description.properties, saved, true, false, { typeVersion: 2 });
	assert.equal(v2.authentication, 'clientCredentials');

	const shown = (parameters, typeVersion) =>
		description.credentials
			.filter((credential) => NodeHelpers.displayParameter(parameters, credential, { typeVersion }))
			.map((credential) => credential.name);
	assert.deepEqual(shown(v1, 1), ['nvoipAccessTokenApi']);
	assert.deepEqual(shown(v2, 2), ['nvoipClientCredentialsApi']);
	// Node v1 trocado para a credencial nova pelo usuário.
	assert.deepEqual(shown({ ...v1, authentication: 'clientCredentials' }, 1), ['nvoipClientCredentialsApi']);
});
