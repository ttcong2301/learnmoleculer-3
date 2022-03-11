const { MoleculerClientError } = require('moleculer').Errors;
const moment = require('moment');

module.exports = async function (ctx) {
	const ipnPayload = ctx.params.body;

	const order = await ctx.call('OrderModel.findOne', [
		{ partnerTransactionNo: ipnPayload.b_transactionNo, status: 'pending' },
	]);

	if (!order)
		throw new MoleculerClientError(
			'Order with transactionNo not found or is paid',
			404,
			'ORDER_NOT_FOUND'
		);

	if (order.amount !== ipnPayload.b_amount)
		throw new MoleculerClientError(
			'Order amount is not match',
			400,
			'ORDER_AMOUNT_NOT_MATCH'
		);

	if (ipnPayload.b_transactionStatus === 'SUCCESS') {
		const updatedOrder = await ctx.call('OrderModel.findOneAndUpdate', [
			{ _id: order._id },
			{
				status: 'paid',
				payDate: moment(ipnPayload.b_payDate, 'DD-MM-YYYY')
					.utcOffset(7)
					.toDate(),
			},
			{ new: true },
		]);
		return updatedOrder;
	}

	return { message: 'Payment failed' };
};
