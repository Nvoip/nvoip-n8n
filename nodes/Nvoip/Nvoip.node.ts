// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Nvoip Plataforma de Comunicação Ltda.
import {
  IExecuteFunctions,
  INodeExecutionData,
  IDataObject,
  NodeOperationError,
  NodeApiError,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  ILoadOptionsFunctions,
  JsonObject,
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
    description: 'Make calls, send WhatsApp and SMS.',
    defaults: {
      name: 'Nvoip',
    },
    credentials: [
      {
        name: 'nvoipAccessTokenApi',
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
            description: 'Make an outbound call using Nvoip',
            action: 'Make a phone call',
          },
          {
            name: 'Send Interactive Voice Broadcast',
            value: 'sendVoiceBlastInteractive',
            description:
              'Send an automated voice message with the ability to receive DTMF input',
            action: 'Send interactive voice broadcast',
          },
          {
            name: 'Send Voice Broadcast',
            value: 'sendVoiceBlast',
            description:
              'Send an automated voice message delivered as audio file or TTS',
            action: 'Send voice broadcast',
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
            description: 'Send a customized SMS message to a customer',
            action: 'Send SMS',
          },
          {
            name: 'Send SMS (Template)',
            value: 'sendTemplateSms',
            description: 'Send an SMS using a predefined template',
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
              'Send WhatsApp template messages using Nvoip for automated communication',
            action: 'Send whatsapp message',
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
        description: 'Whether the call should be transferred',
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
        description: 'Number to receive the call (ex: 5511999999999)',
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
        description: 'Phone number with country code (ex: 5511999999999)',
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
        description: 'Custom message (max 160 characters, no accents)',
        required: true,
      },
      {
        displayName: 'Template Name or ID',
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
        description:
          'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
        description: 'Phone number with country code (ex: 5511999999999)',
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
        displayName: 'WhatsApp Template Name or ID',
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
        description:
          'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
        description:
          'Text or audio containing the options (ex: "Press 1 for yes, 2 for no")',
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
        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'nvoipAccessTokenApi',
          {
            method: 'GET',
            url: 'https://api.nvoip.com.br/v3/sms/lisTemplates',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          },
        );

        const arr = Array.isArray(response) ? (response as Array<Record<string, any>>) : [];
        return arr.map((tpl) => {
          const bodyText = String(tpl.bodyText ?? '');
          const matches = bodyText.match(/{{\d+}}/g) ?? [];
          const uniqueVars = Array.from(new Set(matches.map((v) => v.replace(/[^\d]/g, ''))));
          return {
            name: String(tpl.templateName ?? tpl.id ?? 'Template'),
            value: tpl.id as string | number,
            description: `Variables: ${uniqueVars.length} - ${bodyText}`,
          };
        });
      },

			async getTemplatesWhatsApp(this: ILoadOptionsFunctions) {
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'nvoipAccessTokenApi',
					{
						method: 'GET',
						url: 'https://api.nvoip.com.br/v3/wa/listTemplates',
						headers: { 'Content-Type': 'application/json' },
						json: true,
					},
				);

				const templates: Array<{ name: string; value: string; description?: string }> = [];
				const list = Array.isArray(response) ? (response as Array<Record<string, any>>) : [];

				for (const inst of list) {
					if (!Array.isArray(inst.data)) continue;

					for (const tpl of inst.data) {
						const texts: string[] = [];

						if (Array.isArray(tpl.components)) {
							for (const c of tpl.components) {
								if (typeof c?.text === 'string') texts.push(String(c.text));
								if (typeof c?.example?.header_text === 'string') texts.push(String(c.example.header_text));
								if (Array.isArray(c?.example?.body_text)) {
									texts.push(...c.example.body_text.map((t: any) => String(t)));
								}
								if (Array.isArray(c?.buttons)) {
									for (const b of c.buttons) {
										if (typeof b?.text === 'string') texts.push(String(b.text));
										if (typeof b?.url === 'string') texts.push(String(b.url));
									}
								}
							}
						}

						const joined = texts.join(' | ');
						const matches = joined.match(/{{\d+}}/g) ?? [];
						const uniqueVars = Array.from(new Set(matches.map((v) => v.replace(/[^\d]/g, ''))));
						const summary = joined ? joined.slice(0, 140) : '';

						templates.push({
							name: String(tpl.name ?? tpl.id ?? 'Template'),
							value: String(tpl.id),
							description: `Variáveis: ${uniqueVars.length}${summary ? ' - ' + summary : ''}`,
						});
					}
				}

				return templates;
			},
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;
        let response: IDataObject | undefined;

        // ===== SMS simples =====
        if (resource === 'sms' && operation === 'sendSms') {
          const to = this.getNodeParameter('to', i) as string;
          const message = this.getNodeParameter('message', i) as string;

          response = (await this.helpers.httpRequestWithAuthentication.call(
            this,
            'nvoipAccessTokenApi',
            {
              method: 'POST',
              url: 'https://api.nvoip.com.br/v3/sms',
              headers: {
                'Content-Type': 'application/json',
              },
              body: {
                numberPhone: to,
                message,
              },
              json: true,
            },
          )) as IDataObject;

          // ===== SMS via template =====
        } else if (resource === 'sms' && operation === 'sendTemplateSms') {
          const to = this.getNodeParameter('to', i) as string;
          const templateId = this.getNodeParameter('templateId', i) as string | number;
          const variablesRaw = this.getNodeParameter('variables', i, {}) as {
            variable?: Array<{ value: string }>;
          };
          const variables = (variablesRaw.variable ?? [])
            .map((v) => v.value)
            .filter((v) => v !== undefined) as string[];

          response = (await this.helpers.httpRequestWithAuthentication.call(
            this,
            'nvoipAccessTokenApi',
            {
              method: 'POST',
              url: 'https://api.nvoip.com.br/v3/sms/sendTemplate',
              headers: {
                'Content-Type': 'application/json',
              },
              body: {
                phoneNumber: to,
                templateId,
                variables,
              },
              json: true,
            },
          )) as IDataObject;

          // ===== WhatsApp =====
        } else if (resource === 'whatsapp' && operation === 'sendWhatsapp') {
          const to = this.getNodeParameter('toWhatsapp', i) as string;
          const templateId = this.getNodeParameter('templateIdWhatsapp', i) as string;
          const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;

          const templateResponse = await this.helpers.httpRequestWithAuthentication.call(
            this,
            'nvoipAccessTokenApi',
            {
              method: 'GET',
              url: `https://api.nvoip.com.br/v3/wa/listTemplates`,
              headers: {
                'Content-Type': 'application/json',
              },
              json: true,
            },
          );

          // Encontra o template selecionado
          let selectedTemplate: any = null;
          const list = Array.isArray(templateResponse)
            ? (templateResponse as Array<Record<string, any>>)
            : [];
          for (const inst of list) {
            if (Array.isArray(inst.data)) {
              const found = inst.data.find((tpl: any) => String(tpl.id) === String(templateId));
              if (found) {
                selectedTemplate = { ...found, instance: inst.instance };
                break;
              }
            }
          }

          if (!selectedTemplate) {
            throw new NodeOperationError(this.getNode(), `Template with ID ${templateId} not found`, { itemIndex: i });
          }

          const variablesRaw = this.getNodeParameter('variablesWhatsapp', i, {}) as {
            variable?: Array<{ value: string }>;
          };
          const allValues = (variablesRaw.variable ?? [])
            .map((v) => v.value)
            .filter((v) => v !== undefined) as string[];

          if (!allValues.length) {
            throw new NodeOperationError(
              this.getNode(),
              `Attempt to send WhatsApp template ID ${templateId}, but no variables were provided`,
              { itemIndex: i },
            );
          }

          const requestBody: IDataObject = {
            idTemplate: templateId,
            destination: to,
            instance: selectedTemplate.instance,
            language: selectedTemplate.language,
            bodyVariables: allValues,
          };

          if (imageUrl) {
            requestBody.url = imageUrl;
          }

          response = (await this.helpers.httpRequestWithAuthentication.call(
            this,
            'nvoipAccessTokenApi',
            {
              method: 'POST',
              url: 'https://api.nvoip.com.br/v3/wa/sendTemplates',
              headers: {
                'Content-Type': 'application/json',
              },
              body: requestBody,
              json: true,
            },
          )) as IDataObject;

          // ===== Chamada simples =====
        } else if (resource === 'call' && operation === 'makeCall') {
          const caller = this.getNodeParameter('callerId', i) as string;
          const called = this.getNodeParameter('destination', i) as string;
          const transfer = this.getNodeParameter('transfer', i) as boolean;

          const requestBody: IDataObject = {
            caller,
            called,
            transfer,
          };

          response = (await this.helpers.httpRequestWithAuthentication.call(
            this,
            'nvoipAccessTokenApi',
            {
              method: 'POST',
              url: 'https://api.nvoip.com.br/v3/calls/',
              headers: {
                'Content-Type': 'application/json',
              },
              body: requestBody,
              json: true,
            },
          )) as IDataObject;

          // ===== Torpedo de voz =====
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

          response = (await this.helpers.httpRequestWithAuthentication.call(
            this,
            'nvoipAccessTokenApi',
            {
              method: 'POST',
              url: 'https://api.nvoip.com.br/v3/torpedo/voice',
              headers: {
                'Content-Type': 'application/json',
              },
              body: requestBody,
              json: true,
            },
          )) as IDataObject;

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

          response = (await this.helpers.httpRequestWithAuthentication.call(
            this,
            'nvoipAccessTokenApi',
            {
              method: 'POST',
              url: 'https://api.nvoip.com.br/v3/torpedo/voice',
              headers: {
                'Content-Type': 'application/json',
              },
              body: requestBody,
              json: true,
            },
          )) as IDataObject;
        } else {
          throw new NodeOperationError(this.getNode(), `Unsupported operation: ${resource}.${operation}`, { itemIndex: i });
        }

        returnData.push({
          json: response,
          pairedItem: { item: i },
        });
      } catch (error: unknown) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as any)?.message ?? 'Request failed',
              itemIndex: i,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
      }
    }

    return [returnData];
  }
}
