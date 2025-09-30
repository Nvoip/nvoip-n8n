// SPDX-License-Identifier: MIT
// Portions Copyright (c) 2022 n8n GmbH
// Modifications Copyright (c) 2025 Nvoip Plataforma de Comunicação Ltda.
/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	extends: "./.eslintrc.js",

	overrides: [
		{
			files: ['package.json'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			rules: {
				'n8n-nodes-base/community-package-json-name-still-default': 'error',
			},
		},
	],
};
