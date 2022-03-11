const { MoleculerClientError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	console.log(ctx.params);
	const orderId = ctx.params.params.id;
	console.log('🚀 ~ orderId', orderId);
	const order = await ctx.call('OrderModel.findOne', [
		{ _id: orderId },
		{ updatedAt: 0 },
	]);

	if (!order)
		throw new MoleculerClientError('Order not found ', 404, 'ORDER_NOT_FOUND', {
			orderId,
		});
	return order;
};
