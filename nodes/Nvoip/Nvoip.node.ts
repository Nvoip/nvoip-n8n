import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export class Nvoip implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Nvoip',
		name: 'nvoip',
		icon: {
			light: 'file:Logo_nvoip.svg',
			dark: 'file:Logo_nvoip.svg',
		},
		group: ['transform'],
		version: 1,
		description: 'Node para envio de SMS via Nvoip',
		defaults: {
			name: 'Nvoip',
		},
		credentials: [
			{
				name: 'nvoipOAuth2Api',
				required: true,
			},
		],
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'SMS', value: 'sms', description: 'Ações de SMS' }],
				default: 'sms',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Send SMS',
						value: 'sendSms',
						description: 'Enviar um SMS',
						action: 'Send SMS',
						displayOptions: { show: { resource: ['sms'] } },
					},
				],
				default: 'sendSms',
			},
			{
				displayName: 'Número De Destino',
				name: 'to',
				type: 'string',
				displayOptions: {
					show: { resource: ['sms'], operation: ['sendSms'] },
				},
				default: '',
				description: 'Número de telefone com DDI (ex: 5511999999999)',
				required: true,
			},
			{
				displayName: 'Usar Template De Mensagem?',
				name: 'useTemplate',
				type: 'boolean',
				displayOptions: {
					show: { resource: ['sms'], operation: ['sendSms'] },
				},
				default: false,
			},
			{
				displayName: 'Mensagem',
				name: 'message',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['sms'],
						operation: ['sendSms'],
						useTemplate: [false],
					},
				},
				default: '',
				description: 'Mensagem personalizada (máx. 160 caracteres, sem acento).',
				required: true,
			},
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
				displayName: 'Template',
				name: 'templateId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTemplates',
				},
				displayOptions: {
					show: {
						resource: ['sms'],
						operation: ['sendSms'],
						useTemplate: [true],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
				description: 'Escolha um template de mensagem',
				required: true,
			},
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Variáveis do template',
				name: 'variables',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['sms'],
						operation: ['sendSms'],
						useTemplate: [true],
					},
				},
				default: {},
				options: [
					{
						name: 'variable',
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						displayName: 'Variável do template',
						values: [
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								placeholder: 'Valor para {{n}}',
							},
						],
					},
				],
				description: 'Adicione as variáveis do template na ordem correta',
			}
		],
	};

	methods = {
		loadOptions: {
			async getTemplates(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('nvoipOAuth2Api');
				// @ts-ignore
				const accessToken = credentials.oauthTokenData.access_token;

				const response = await this.helpers.request({
					method: 'GET',
					url: 'https://api.nvoip.com.br/v3/sms/lisTemplates',
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					json: true,
				});

				//@ts-ignore
				console.log(response)
				return (response as any[]).map((tpl: any) => {
					const matches = tpl.bodyText.match(/{{\d+}}/g) || [];
					const uniqueVars = Array.from(new Set(matches.map((v: string) => v.replace(/[^\d]/g, ''))));
					return {
						name: tpl.templateName,
						value: tpl.id,
						description: `Vars: ${uniqueVars.length} - ${tpl.bodyText}`,
					};
				});
			}
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('nvoipOAuth2Api');
		// @ts-ignore
		const accessToken = credentials.oauthTokenData.access_token;

		for (let i = 0; i < items.length; i++) {
			try {
				const to = this.getNodeParameter('to', i) as string;
				const useTemplate = this.getNodeParameter('useTemplate', i) as boolean;

				let response: IDataObject;

				if (useTemplate) {
					const templateId = this.getNodeParameter('templateId', i) as number;
					const variablesRaw = this.getNodeParameter('variables', i, {}) as { variable?: Array<{ value: string }> };
					const variablesArray = Array.isArray(variablesRaw?.variable) ? variablesRaw.variable : [];
					let variables = variablesArray.map((v) => v.value);

					// Recupera todos os templates (ou salve-os em cache)
					const credentials = await this.getCredentials('nvoipOAuth2Api');
					// @ts-ignore
					const accessToken = credentials.oauthTokenData.access_token;

					const templates = await this.helpers.request({
						method: 'GET',
						url: 'https://api.nvoip.com.br/v3/sms/lisTemplates',
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
						json: true,
					});

					const selectedTemplate = templates.find((tpl: any) => tpl.id === templateId);
					const matches = selectedTemplate?.bodyText?.match(/{{\d+}}/g) || [];
					const maxVarIndex = matches
						.map((m: string) => parseInt(m.replace(/[^\d]/g, '')))
						.reduce((max: number, cur: number) => (cur > max ? cur : max), 0);

					// Preenche com strings vazias caso falte variável
					// while (variables.length < maxVarIndex) {
					// 	variables.push('');
					// }

					if (maxVarIndex > 0 && variables.length === 0) {
						// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown
						throw new Error(`O template selecionado exige ${maxVarIndex} variável(is), mas nenhuma foi preenchida. Adicione os valores nas "Variáveis do template".`);
					}

					response = await this.helpers.request({
						method: 'POST',
						url: 'https://api.nvoip.com.br/v3/sms/sendTemplate',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: {
							phoneNumber: to,
							templateId,
							variables,
						},
						json: true,
					});
				} else {
					const message = this.getNodeParameter('message', i) as string;

					response = await this.helpers.request({
						method: 'POST',
						url: 'https://api.nvoip.com.br/v3/sms',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: {
							numberPhone: to,
							message,
						},
						json: true,
					});
				}

				returnData.push({ json: response as IDataObject });
			} catch (error: any) {
				// @ts-ignore
				console.log(error);
				returnData.push({
					json: {
						error: error.message,
						itemIndex: i,
					},
				});
			}
		}

		return [returnData];
	}
}
