const { MongoClient } = require("mongodb");
const { endianness } = require("os");
const URI = process.env.MONGODB_LOCAL_URI;

module.exports = {
	filterProducts: async (req, res) => {
		const client = new MongoClient(URI, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		});

		try {
			await client.connect();

			const database = client.db("webscrape");
			const collection = database.collection("products");

			const item = req.query.term

			const page = parseInt(req.query.page);
			const limit = parseInt(req.query.limit);
			const startIndex = (page - 1) * limit;
			const endIndex = page * limit;

			let data = await collection
				.aggregate([
					{
						$search: {
							autocomplete: {
								query: `${req.query.term}`,
								path: "displayCategory",
								fuzzy: {
									maxEdits: 1,
								},
							},
						},
					},
					{
						$project:{
							_id : 0
						}
					},	
					{
						$limit: 500,
					},
				])
				.toArray();

			const results = {};

			if (endIndex < data.length) {
				results.next = {
					page: page + 1,
					limit: limit,
				};
			}
			if (startIndex > 0) {
				results.previous = {
					page: page - 1,
					limit: limit,
				};
			}

			results.result = data.slice(startIndex, endIndex);

			res.status(200).json({
				requestedURL: item,
				totalProducts: data.length,
				totalPages: Math.ceil(data.length / limit),
				maxLimit: 50,
				message: results.result.length < 1 ? "not found" : item,
				results: results.result.length,
				data: results,
			});
			console.log("result", results);
		} catch (e) {
			console.error(e);
		}
		await client.close();
	},
};
