const _ = require('lodash');
const { response } = require('../../../helper/response');
const { MoleculerClientError } = require('moleculer').Errors;
const uuid = require('uuid').v4;

module.exports = async function (ctx) {
	try {
		const orderToCreate = ctx.params.body;
		orderToCreate.userId = ctx.meta.auth.data.id;

		orderToCreate.transaction = uuid();
		orderToCreate.expiredAt = Date.now() + 1000 * 20; // 2 hours

		const order = await this.broker.call('OrderModel.create', [orderToCreate]);

		if (order._id) {
			return response({
				data: _.pick(order, [
					'id',
					'description',
					'amount',
					'address',
					'userId',
					'transaction',
				]),
				code: 201,
			});
		} else {
			throw new MoleculerClientError(error.message, 500, 'CREATE_ORDER_ERROR');
		}
	} catch (error) {
		throw new MoleculerClientError(error.message, 500, 'CREATE_ORDER_ERROR');
	}
};
