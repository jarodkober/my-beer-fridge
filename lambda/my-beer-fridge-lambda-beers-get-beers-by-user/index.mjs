import {
	RDSDataClient,
	ExecuteStatementCommand
} from '@aws-sdk/client-rds-data';

const client = new RDSDataClient();

export const handler = async (event) => {
	const sqlParams = {
		database: process.env.DATABASE_NAME,
		includeResultMetadata: true,
		parameters: [
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
		sql: `SELECT 
				beer_cellars.beer_cellars_id,
				beer_cellars.beer_cost,
				beer_cellars.beer_id,
				beer_cellars.beer_quantity,
				beer_cellars.beer_quantity_consumed,
				beer_cellars.cellar_id,
				beer_sizes.beer_size_id,
				beer_sizes.beer_size_name,
				beer_styles.beer_style,
				beers.beer_abv,
				beers.beer_name, 
				beers.beer_vintage,
				breweries.brewery_name,
				cellars.cellar_description,
				cellars.cellar_name
			FROM public.beer_cellars
			INNER JOIN public.beers on beer_cellars.beer_id = beers.beer_id
			INNER JOIN public.cellars on beer_cellars.cellar_id = cellars.cellar_id
			INNER JOIN public.breweries on beers.brewery_id = breweries.brewery_id
			INNER JOIN public.beer_sizes on beer_cellars.beer_size_id = beer_sizes.beer_size_id
			INNER JOIN public.beer_styles on beers.beer_style_id = beer_styles.beer_style_id
			WHERE beer_cellars.user_id = :user_id AND beer_cellars.beer_quantity > 0;`
	};

	const parseDataServiceResponse = (resp) => {
		let columns = resp.columnMetadata.map((c) => c.name);
		let data = resp.records.map((r) => {
			let obj = {};
			r.map((v, i) => {
				obj[columns[i]] = Object.values(v)[0];
			});
			return obj;
		});
		return data;
	};

	const command = new ExecuteStatementCommand(sqlParams);

	const response = await client.send(command);

	return parseDataServiceResponse(response);
};
