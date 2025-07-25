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
					{ name: 'Call', value: 'call', description: 'Ações de Ligação' }
				],
				default: 'sms',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['call'] },
				},
				options: [
					{
						name: 'Make Call',
						value: 'makeCall',
						description: 'Realizar uma chamada telefônica',
						action: 'Make a phone call',
					},
				],
				default: 'makeCall',
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
				displayName: 'Transferir?',
				name: 'transfer',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['makeCall'],
					},
				},
				// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
				description: 'Se a chamada deve ser uma transferência (true) ou não (false)',
			},
			{
				displayName: 'Número De Origem (Caller_id)',
				name: 'callerId',
				type: 'string',
				displayOptions: {
					show: { resource: ['call'], operation: ['makeCall'] },
				},
				default: '',
				required: true,
				description: 'Número que realizará a chamada (deve estar habilitado no painel Nvoip)',
			},
			{
				displayName: 'Número De Destino',
				name: 'destination',
				type: 'string',
				displayOptions: {
					show: { resource: ['call'], operation: ['makeCall'] },
				},
				default: '',
				required: true,
				description: 'Número que receberá a chamada (ex: 5511999999999)',
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
				displayName: 'Imagem (URL)',
				name: 'imageUrl',
				type: 'string',
				default: '',
				placeholder: 'https://exemplo.com/imagem.jpg',
				displayOptions: {
					show: {
						resource: ['whatsapp'],
						operation: ['sendWhatsapp'],
					},
				},
				description: 'URL pública da imagem para enviar junto ao template',
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

				const templates: any[] = [];
				for (const inst of response as any[]) {
					if (Array.isArray(inst.data)) {
						for (const tpl of inst.data) {
							const headerComponent = tpl.components?.find((c: any) => c.type === 'HEADER');
							const headerFormat = headerComponent?.format || null;
							const headerText = headerComponent?.text || null;

							templates.push({
								name: tpl.name,
								value: JSON.stringify({
									id: tpl.id,
									instance: inst.instance,
									language: tpl.language,
									components: tpl.components,
									header: headerText,
									headerFormat,
								}),
								description: [
									headerFormat ? `HEADER (${headerFormat})` : null,
									...(tpl.components?.map((c: any) => c.text).filter(Boolean) || []),
								].join(' | '),
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
				let response;

				// ===== SMS ==========
				if (resource === 'sms' && operation === 'sendSms') {
					const to = this.getNodeParameter('to', i) as string;
					const useTemplate = this.getNodeParameter('useTemplate', i) as boolean;

					if (useTemplate) {
						const templateId = this.getNodeParameter('templateId', i) as number;
						const variablesRaw = this.getNodeParameter('variables', i, {}) as {
							variable?: Array<{ value: string }>;
						};
						const variablesArray = Array.isArray(variablesRaw?.variable) ? variablesRaw.variable : [];
						const variables = variablesArray.map((v) => v.value);

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

				// ===== WhatsApp ==========
				} else if (resource === 'whatsapp' && operation === 'sendWhatsapp') {
					const to = this.getNodeParameter('toWhatsapp', i) as string;
					const templateOption = JSON.parse(this.getNodeParameter('templateIdWhatsapp', i) as string);
					const templateId = templateOption.id;
					const instance = templateOption.instance;
					const language = templateOption.language;
					const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;

					const variablesRaw = this.getNodeParameter('variablesWhatsapp', i, {}) as {
						variable?: Array<{ value: string }>;
					};
					const variablesArray = Array.isArray(variablesRaw?.variable) ? variablesRaw.variable : [];
					const allValues = variablesArray.map((v) => v.value);

					const requestBody: IDataObject = {
						idTemplate: templateId,
						destination: to,
						instance,
						language,
						bodyVariables: allValues,
					};

					if (imageUrl) {
						requestBody.url = imageUrl;
					}

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

				// ===== Ligação ==========
				} else if (resource === 'call' && operation === 'makeCall') {
					const caller = this.getNodeParameter('callerId', i) as string;
					const called = this.getNodeParameter('destination', i) as string;
					const transfer = this.getNodeParameter('transfer', i) as boolean;

					const requestBody: IDataObject = {
						caller,
						called,
						transfer,
					};

					//@ts-ignore
					console.log(requestBody)
					response = await this.helpers.request({
						method: 'POST',
						url: 'https://api.nvoip.com.br/v3/calls/',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: requestBody,
						json: true,
					});
				} else {
					// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown
					throw new Error(`Operação não suportada: ${resource}/${operation}`);
				}

				returnData.push({ json: response });
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
