import { INodeType, INodeTypeDescription, NodeConnectionType, IExecuteFunctions } from 'n8n-workflow';

export class Nvoip implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Nvoip',
		name: 'nvoip',
		icon: { light: 'file:LogoIconCor.png', dark: 'file:LogoIconCor.png' },
		group: ['transform'],
		version: 1,
		description: 'Node de teste para integração local',
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
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Call', value: 'call', description: 'Ações de chamada' },
					{ name: 'SMS', value: 'sms', description: 'Ações de SMS' },
					{ name: 'WhatsApp', value: 'whatsapp', description: 'Ações de WhatsApp' },
				],
				default: 'call',
				description: 'Escolha o tipo de recurso',
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
						// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
						action: 'Send WhatsApp',
						displayOptions: { show: { resource: ['whatsapp'] } },
					},
				],
				default: 'makeCall',
				description: 'Selecione a operação',
			},
			{
				displayName: 'Número De Destino',
				name: 'to',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['call', 'sms', 'whatsapp'],
					},
				},
				default: '',
				description: 'Número de telefone de destino (com DDI, ex: +5511999999999)',
				required: true,
			},
			{
				displayName: 'Mensagem',
				name: 'message',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['sms', 'whatsapp'],
					},
				},
				default: '',
				description: 'Mensagem a ser enviada',
				required: true,
			},
		],
	};



	async execute(this: IExecuteFunctions) {
		const response = await this.helpers.requestOAuth2.call(
			this,
			'nvoipOAuth2Api',
			{
				method: 'GET',
				url: 'https://api.nvoip.com.br/v2/list/users',
				// ...outros parâmetros
			}
		);
		const items = this.getInputData();
		const returnData = [];
		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;
			const to = this.getNodeParameter('to', i) as string;
			let message = '';
			if (resource === 'sms' || resource === 'whatsapp') {
				message = this.getNodeParameter('message', i) as string;
			}

			let returnItem: { json: any } = { json: {} };

			if (resource === 'call' && operation === 'makeCall') {
				// lógica para chamada
				returnItem = { json: { resource, operation, to } };
			} else if (resource === 'sms' && operation === 'sendSms') {
				// lógica para SMS
				returnItem = { json: { resource, operation, to, message } };
			} else if (resource === 'whatsapp' && operation === 'sendWhatsapp') {
				// lógica para WhatsApp
				returnItem = { json: { resource, operation, to, message } };
			}

			returnData.push(returnItem);
		}
		returnData.push({ json: response });
		return this.prepareOutputData(returnData);
	}
}
