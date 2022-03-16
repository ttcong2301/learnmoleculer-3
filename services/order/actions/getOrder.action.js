const { MoleculerClientError } = require('moleculer').Errors;
const _ = require('lodash');

module.exports = async function (ctx) {
	try {
		const orderId = ctx.params.params.id;

		const order = await this.broker.call('OrderModel.findOne', [
			{ id: orderId },
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
		return _.omit(order, ['_id', 'updatedAt', '__v']);
	} catch (error) {
		throw new MoleculerClientError(error.message, 500, 'PAY_ERROR');
	}
};
