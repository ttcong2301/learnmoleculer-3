const _ = require('lodash');
const { MoleculerClientError } = require('moleculer').Errors;
const uuid = require('uuid').v4;

module.exports = async function (ctx) {
	try {
		const orderToCreate = ctx.params.body;
		orderToCreate.userId = ctx.meta.auth.data.id;

		orderToCreate.transaction = uuid();
		orderToCreate.expiredAt = Date.now() + 1000 * 60 * 60 * 2; // 2 hours

		const order = await this.broker.call('OrderModel.create', [orderToCreate]);

		if (order._id) {
			return _.pick(order, [
				'id',
				'description',
				'amount',
				'address',
				'userId',
				'transaction',
			]);
		}
	} catch (error) {
		throw new MoleculerClientError(error.message, 500, 'CREATE_ORDER_ERROR');
	}
};
