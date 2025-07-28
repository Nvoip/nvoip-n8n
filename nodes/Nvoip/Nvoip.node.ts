/* eslint-disable n8n-nodes-base/node-param-description-excess-final-period */
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
		description: 'Node for sending SMS via Nvoip',
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
					{ name: 'SMS', value: 'sms', description: 'SMS actions' },
					{ name: 'WhatsApp', value: 'whatsapp', description: 'WhatsApp actions' },
					{ name: 'Call', value: 'call', description: 'Call actions' },
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
						description: 'Make a outbound call using Nvoip.',
						action: 'Make a phone call',
					},
					{
						name: 'Send Voice Broadcast',
						value: 'sendVoiceBlast',
						description:
							'Send an automated voice message (voicebot) from a caller to a destination. The message can be an audio file (mp3 or wav) or a text that will be read via TTS (Text-to-Speech). This action does not require or accept user interaction',
						action: 'Send voice blast',
					},
					{
						name: 'Send Interactive Voice Broadcast',
						value: 'sendVoiceBlastInteractive',
						description:
							"Send an automated voice message (voicebot) to a destination with the ability to receive user input via DTMF. The initial message is delivered as an audio file or TTS, and the system will play a follow-up audio message after receiving the user's response.",
						action: 'Send voice blast interactive',
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
						description: 'Send a customized SMS message to a customer.',
						action: 'Send SMS',
					},
					{
						name: 'Send SMS (Template)',
						value: 'sendTemplateSms',
						description: 'Send an SMS using a predefined template.',
						action: 'Send template SMS',
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
						name: 'Send WhatsApp (With HSM)',
						value: 'sendWhatsapp',
						description:
							'Send WhatsApp template messages using Nvoip for efficient and automated communication with your customers.',
						// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
						action: 'Send WhatsApp',
					},
				],
				default: 'sendWhatsapp',
			},
			{
				displayName: 'Transfer Call?',
				name: 'transfer',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['makeCall'],
					},
				},
				description: 'Whether the call should be transferred (true) or not (false)',
			},
			{
				displayName: 'Origin Number (Caller ID)',
				name: 'callerId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['sendVoiceBlast', 'makeCall', 'sendVoiceBlastInteractive'],
					},
				},
				default: '',
				required: true,
				description: 'Number that will make the call (must be enabled in the Nvoip panel)',
			},
			{
				displayName: 'Destination Number',
				name: 'destination',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['sendVoiceBlast', 'makeCall', 'sendVoiceBlastInteractive'],
					},
				},
				default: '',
				required: true,
				description: 'Number to receive the call (e.g., 5511999999999)',
			},
			{
				displayName: 'Audio Content (Text or Public MP3 URL)',
				name: 'audioContent',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['sendVoiceBlast'],
					},
				},
				default: '',
				required: true,
				description: 'Text to be spoken or URL of a public MP3 file',
			},
			{
				displayName: 'Destination Number',
				name: 'to',
				type: 'string',
				displayOptions: {
					show: { resource: ['sms'], operation: ['sendSms', 'sendTemplateSms'] },
				},
				default: '',
				description: 'Phone number with country code (e.g., 5511999999999)',
				required: true,
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['sms'],
						operation: ['sendSms'],
					},
				},
				default: '',
				description: 'Custom message (max. 160 characters, no accents).',
				required: true,
			},
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
				displayName: 'Template SMS',
				name: 'templateId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTemplates',
				},
				displayOptions: {
					show: {
						resource: ['sms'],
						operation: ['sendTemplateSms'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
				description: 'Select a message template',
				required: true,
			},
			{
				displayName: 'Destination Number',
				name: 'toWhatsapp',
				type: 'string',
				displayOptions: {
					show: { resource: ['whatsapp'], operation: ['sendWhatsapp'] },
				},
				default: '',
				description: 'Phone number with country code (e.g., 5511999999999)',
				required: true,
			},
			{
				displayName: 'Image (URL)',
				name: 'imageUrl',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/image.jpg',
				displayOptions: {
					show: {
						resource: ['whatsapp'],
						operation: ['sendWhatsapp'],
					},
				},
				description: 'Public image URL to send with the template',
			},
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
				displayName: 'Template WhatsApp',
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
				description: 'Select a WhatsApp message template',
				required: true,
			},
			{
				displayName: 'WhatsApp Template Variables',
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
						displayName: 'Template Variable',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								placeholder: 'Value for {{n}}',
							},
						],
					},
				],
				description: 'Add WhatsApp template variables in the correct order',
			},
			{
				displayName: 'Audio 1',
				name: 'audio1',
				type: 'string',
				default: '',
				placeholder: 'Text or MP3 URL',
				required: true,
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['sendVoiceBlastInteractive'],
					},
				},
				description: 'Text to be read or audio URL for the initial greeting',
			},
			{
				displayName: 'Audio 2',
				name: 'audio2',
				type: 'string',
				default: '',
				placeholder: 'Text or MP3 URL',
				required: true,
				displayOptions: {
					show: {
						resource: ['call'],
						operation: ['sendVoiceBlastInteractive'],
					},
				},
				description: 'Text or audio containing the options (e.g., "Press 1 for yes, 2 for no")',
			},
			{
				displayName: 'Template Variables',
				name: 'variables',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['sms'],
						operation: ['sendTemplateSms'],
					},
				},
				default: {},
				options: [
					{
						name: 'variable',
						displayName: 'Template Variable',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								placeholder: 'Value for {{n}}',
							},
						],
					},
				],
				description: 'Add SMS template variables in the correct order',
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

				// @ts-ignore
				console.log(response);
				return (response as any[]).map((tpl: any) => {
					const matches = tpl.bodyText.match(/{{\d+}}/g) || [];
					const uniqueVars = Array.from(
						new Set(matches.map((v: string) => v.replace(/[^\d]/g, ''))),
					);
					return {
						name: tpl.templateName,
						value: tpl.id,
						description: `Variables: ${uniqueVars.length} - ${tpl.bodyText}`,
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

				// ===== SMS simples =====
				if (resource === 'sms' && operation === 'sendSms') {
					const to = this.getNodeParameter('to', i) as string;
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

					// ===== SMS via template =====
				} else if (resource === 'sms' && operation === 'sendTemplateSms') {
					const to = this.getNodeParameter('to', i) as string;
					const templateId = this.getNodeParameter('templateId', i) as number;
					const variablesRaw = this.getNodeParameter('variables', i, {}) as {
						variable?: Array<{ value: string }>;
					};
					const variables = (variablesRaw.variable || []).map((v) => v.value);

					if (!variables || variables.length === 0) {
						// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown
						throw new Error(
							`Você está tentando enviar um SMS com template (ID ${templateId}), mas nenhuma variável foi fornecida. Verifique se o template exige variáveis e preencha os valores corretamente.`,
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

					// ===== WhatsApp =====
				} else if (resource === 'whatsapp' && operation === 'sendWhatsapp') {
					const to = this.getNodeParameter('toWhatsapp', i) as string;
					const templateOption = JSON.parse(
						this.getNodeParameter('templateIdWhatsapp', i) as string,
					);
					const templateId = templateOption.id;
					const instance = templateOption.instance;
					const language = templateOption.language;
					const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;

					const variablesRaw = this.getNodeParameter('variablesWhatsapp', i, {}) as {
						variable?: Array<{ value: string }>;
					};
					const allValues = (variablesRaw.variable || []).map((v) => v.value);

					if (!allValues || allValues.length === 0) {
						// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown
						throw new Error(
							`Você está tentando enviar template (ID ${templateId}), mas nenhuma variável foi fornecida. Verifique se o template exige variáveis e preencha os valores corretamente.`,
						);
					}

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

					// ===== Ligação simples =====
				} else if (resource === 'call' && operation === 'makeCall') {
					const caller = this.getNodeParameter('callerId', i) as string;
					const called = this.getNodeParameter('destination', i) as string;
					const transfer = this.getNodeParameter('transfer', i) as boolean;

					const requestBody: IDataObject = {
						caller,
						called,
						transfer,
					};

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

					// ===== Torpedo de voz (Voice Blast) =====
				} else if (resource === 'call' && operation === 'sendVoiceBlast') {
					const caller = this.getNodeParameter('callerId', i) as string;
					const destination = this.getNodeParameter('destination', i) as string;
					const audio = this.getNodeParameter('audioContent', i) as string;

					const requestBody = {
						caller,
						called: destination,
						audios: [
							{
								audio,
								positionAudio: 1,
							},
						],
						dtmfs: [],
					};

					response = await this.helpers.request({
						method: 'POST',
						url: 'https://api.nvoip.com.br/v3/torpedo/voice',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: requestBody,
						json: true,
					});
				} else if (resource === 'call' && operation === 'sendVoiceBlastInteractive') {
					const caller = this.getNodeParameter('callerId', i) as string;
					const destination = this.getNodeParameter('destination', i) as string;
					const audio1 = this.getNodeParameter('audio1', i) as string;
					const audio2 = this.getNodeParameter('audio2', i) as string;

					const requestBody = {
						caller,
						called: destination,
						audios: [
							{
								audio: audio1,
								positionAudio: 1,
							},
						],
						dtmfs: [
							{
								audio: audio2,
								positionAudio: 2,
								timedtmf: 4000,
								timeout: 30,
								min: 0,
								max: 1,
							},
						],
					};

					response = await this.helpers.request({
						method: 'POST',
						url: 'https://api.nvoip.com.br/v3/torpedo/voice',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: requestBody,
						json: true,
					});
				}

				returnData.push({ json: response });
			} catch (error: any) {
				returnData.push({
					json: {
						error: error.message || 'Unknown error',
						itemIndex: i,
					},
				});
			}
		}

		return [returnData];
	}
}
