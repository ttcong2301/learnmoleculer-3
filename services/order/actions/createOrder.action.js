const _ = require('lodash');
const { MoleculerClientError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const orderToCreate = ctx.params.body;
		orderToCreate.userId = ctx.meta.auth.data.id;
		const order = await ctx.call('OrderModel.create', [orderToCreate]);

		return _.pick(order, ['id', 'description', 'amount', 'address', 'userId']);
	} catch (error) {
		throw new MoleculerClientError(error.message, 500, 'CREATE_ORDER_ERROR');
	}
};
