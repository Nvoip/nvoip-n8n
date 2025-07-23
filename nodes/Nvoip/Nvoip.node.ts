import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';

export class Nvoip implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Nvoip',
		name: 'nvoip',
		icon: {
			light: 'file:Logo_nvoip_250x60.svg',
			dark: 'file:Logo_nvoip_250x60.svg',
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
				displayName: 'Template (Não Funcional Ainda)',
				name: 'templateId',
				type: 'hidden',
				displayOptions: {
					show: {
						resource: ['sms'],
						operation: ['sendSms'],
						useTemplate: [true],
					},
				},
				default: 'tpl_promo',
			},
		],
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
            const message = this.getNodeParameter('message', i) as string;

            const response = await this.helpers.request({
                method: 'POST',
                url: 'https://api.nvoip.com.br/v3/sms',
                headers: {
									'Content-Type': 'application/json',
									'Authorization': `Bearer ${accessToken}`,
							},
                body: {
                    numberPhone: to,
                    message,
                },
                json: true,
            });

            returnData.push({ json: response as IDataObject });
        } catch (error: any) {

					//@ts-ignore
					console.log(error)
            returnData.push({
                json: {
                    error: error.message,
                    itemIndex: i,
                },
            });
        }
    }

    return [returnData];
}}
