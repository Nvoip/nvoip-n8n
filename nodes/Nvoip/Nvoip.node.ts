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
				options: [
					{ name: 'SMS', value: 'sms', description: 'Ações de SMS' },
					{ name: 'WhatsApp', value: 'whatsapp', description: 'Ações de WhatsApp' },
				],
				default: 'sms',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['sms'] },
				},
				options: [
					{
						name: 'Send SMS',
						value: 'sendSms',
						description: 'Enviar um SMS',
						action: 'Send SMS',
					},
				],
				default: 'sendSms',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['whatsapp'] },
				},
				options: [
					{
						name: 'Send WhatsApp',
						value: 'sendWhatsapp',
						description: 'Enviar mensagem WhatsApp',
						action: 'Send whats app',
					},
				],
				default: 'sendWhatsapp',
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
				displayName: 'Número De Destino',
				name: 'toWhatsapp',
				type: 'string',
				displayOptions: {
					show: { resource: ['whatsapp'], operation: ['sendWhatsapp'] },
				},
				default: '',
				description: 'Número de telefone com DDI (ex: 5511999999999)',
				required: true,
			},
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
				displayName: 'Template',
				name: 'templateIdWhatsapp',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTemplatesWhatsApp',
				},
				displayOptions: {
					show: {
						resource: ['whatsapp'],
						operation: ['sendWhatsapp'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
				description: 'Escolha um template de mensagem WhatsApp',
				required: true,
			},
			{
				displayName: 'Variáveis Do Template WhatsApp',
				name: 'variablesWhatsapp',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['whatsapp'],
						operation: ['sendWhatsapp'],
					},
				},
				default: {},
				options: [
					{
						name: 'variable',
						displayName: 'Variável Do Template',
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
				description: 'Adicione as variáveis do template WhatsApp na ordem correta',
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
			},
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
				console.log(response);
				return (response as any[]).map((tpl: any) => {
					const matches = tpl.bodyText.match(/{{\d+}}/g) || [];
					const uniqueVars = Array.from(
						new Set(matches.map((v: string) => v.replace(/[^\d]/g, ''))),
					);
					return {
						name: tpl.templateName,
						value: tpl.id,
						description: `Vars: ${uniqueVars.length} - ${tpl.bodyText}`,
					};
				});
			},
			async getTemplatesWhatsApp(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('nvoipOAuth2Api');
				// @ts-ignore
				const accessToken = credentials.oauthTokenData.access_token;

				const response = await this.helpers.request({
					method: 'GET',
					url: 'https://api.nvoip.com.br/v3/wa/listTemplates',
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					json: true,
				});

				// O retorno é um array de instâncias, cada uma com um array data de templates
				//@ts-ignore
				// console.log(response)
				const templates: any[] = [];
				for (const inst of response as any[]) {
					if (Array.isArray(inst.data)) {
						for (const tpl of inst.data) {
							templates.push({
								name: tpl.name,
								value: JSON.stringify({
									id: tpl.id,
									instance: inst.instance,
									language: tpl.language,
								}),
								description:
									tpl.components
										?.map((c: any) => c.text)
										.filter(Boolean)
										.join(' | ') || '',
							});
						}
					}
				}
				return templates;
			},
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
				const resource = this.getNodeParameter('resource', i);
				const operation = this.getNodeParameter('operation', i);
				let response: IDataObject;

				if (resource === 'sms' && operation === 'sendSms') {
					const to = this.getNodeParameter('to', i) as string;
					const useTemplate = this.getNodeParameter('useTemplate', i) as boolean;

					if (useTemplate) {
						const templateId = this.getNodeParameter('templateId', i) as number;
						const variablesRaw = this.getNodeParameter('variables', i, {}) as {
							variable?: Array<{ value: string }>;
						};
						const variablesArray = Array.isArray(variablesRaw?.variable)
							? variablesRaw.variable
							: [];
						const variables = variablesArray.map((v) => v.value);

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

						if (maxVarIndex > 0 && variables.length === 0) {
							// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown
							throw new Error(
								`O template selecionado exige ${maxVarIndex} variável(is), mas nenhuma foi preenchida.`,
							);
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
				} else if (resource === 'whatsapp' && operation === 'sendWhatsapp') {
					const to = this.getNodeParameter('toWhatsapp', i) as string;
					const templateOption = JSON.parse(
						this.getNodeParameter('templateIdWhatsapp', i) as string,
					);
					const templateId = templateOption.id;
					const instance = templateOption.instance;
					const language = templateOption.language;
					const variablesRaw = this.getNodeParameter('variablesWhatsapp', i, {}) as {
						variable?: Array<{ value: string }>;
					};
					const variablesArray = Array.isArray(variablesRaw?.variable) ? variablesRaw.variable : [];
					const allValues = variablesArray.map((v) => v.value);

					if (!instance || !language) {
						// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown
						throw new Error('Não foi possível encontrar o template selecionado na listagem.');
					}

					const requestBody: IDataObject = {
						idTemplate: templateId,
						destination: to,
						instance,
						language,
						bodyVariables: allValues,
					};
					//@ts-ignore
					console.log(requestBody);
					response = await this.helpers.request({
						method: 'POST',
						url: 'https://api.nvoip.com.br/v3/wa/sendTemplates',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: requestBody,
						json: true,
					});
				} else {
					// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown
					throw new Error('Operação ou recurso não suportado.');
				}

				returnData.push({ json: response as IDataObject });
			} catch (error: any) {
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
