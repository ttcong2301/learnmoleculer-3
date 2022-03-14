const { MoleculerClientError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const orderId = ctx.params.params.id;

		const order = await ctx.call('OrderModel.findOne', [
			{ _id: orderId },
			{ updatedAt: 0 },
		]);

		if (!order)
			throw new MoleculerClientError(
				'Order not found ',
				404,
				'ORDER_NOT_FOUND',
				{
					orderId,
				}
			);
		return order;
	} catch (error) {
		throw new MoleculerClientError(error.message, 500, 'PAY_ERROR');
	}
};
