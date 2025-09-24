// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Nvoip Plataforma de Comunicação Ltda.
import {
  ICredentialType,
  INodeProperties,
  IAuthenticateGeneric,
} from 'n8n-workflow';

export class NvoipAccessTokenApi implements ICredentialType {
  name = 'nvoipAccessTokenApi';
  displayName = 'Nvoip Access Token API';
  documentationUrl = 'https://nvoip.docs.apiary.io';
  properties: INodeProperties[] = [
    {
      displayName: 'Access Token',
      name: 'accessToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Bearer token emitido pelo seu painel',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.accessToken}}',
      },
    },
  };


}
