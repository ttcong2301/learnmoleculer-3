const { MoleculerClientError } = require('moleculer').Errors;
const moment = require('moment');
const { Status, TransactionStatus } = require('../constants/payment.constant');
const _ = require('lodash');

module.exports = async function (ctx) {
	try {
		const ipnPayload = ctx.params.body;

		const order = await this.broker.call('OrderModel.findOne', [
			{
				partnerTransactionNo: ipnPayload.b_transactionNo,
				status: Status.PENDING,
			},
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
		if (ipnPayload.b_transactionStatus === TransactionStatus.SUCCESS) {
			const updatedOrder = await this.broker.call(
				'OrderModel.findOneAndUpdate',
				[
					{ _id: order._id },
					{
						status: Status.PAID,
						payDate: moment(ipnPayload.b_payDate, 'DD-MM-YYYY')
							.utcOffset(7)
							.toDate(),
					},
					{ new: true },
				]
			);
			return _.omit(updatedOrder, ['_id', '__v', 'updatedAt']);
		}

		return { message: 'Payment failed' };
	} catch (error) {
		throw new MoleculerClientError(error.message, 500, 'PAY_ERROR');
	}
};
