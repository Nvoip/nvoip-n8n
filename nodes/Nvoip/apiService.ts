import { IExecuteFunctions } from 'n8n-workflow';

const apiService = (context: IExecuteFunctions) => ({
	get: async <T>(url: string): Promise<T> => {
		const response = await context.helpers.requestOAuth2!.call(
			context,
			'nvoipOAuth2Api',
			{
				method: 'GET',
				url,
				json: true,
			}
		);
		return response as T;
	},

	post: async <T>(url: string, body: any): Promise<T> => {
		const response = await context.helpers.requestOAuth2!.call(
			context,
			'nvoipOAuth2Api',
			{
				method: 'POST',
				url,
				body,
				json: true,
			}
		);
		return response as T;
	},
});

export default apiService;
