import {
	RDSDataClient,
	ExecuteStatementCommand
} from '@aws-sdk/client-rds-data';

const client = new RDSDataClient();

export const handler = async (event) => {
	const sqlParams = {
		database: process.env.DATABASE_NAME,
		parameters: [
			{
				name: 'cellar_description',
				value: {
					stringValue: event.cellar_description
				}
			},
			{
				name: 'cellar_name',
				value: {
					stringValue: event.cellar_name
				}
			},
			{
				name: 'user_id',
				typeHint: 'UUID',
				value: {
					stringValue: event.user_id
				}
			}
		],
		resourceArn: process.env.DATABASE_CLUSTER_ARN,
		secretArn: process.env.DATABASE_CREDENTIALS_SECRETS_STORE_ARN,
		sql: 'INSERT INTO public.cellars (cellar_description, cellar_name, user_id) VALUES (:cellar_description, :cellar_name, :user_id)'
	};

	const command = new ExecuteStatementCommand(sqlParams);

	const response = await client.send(command);
};
