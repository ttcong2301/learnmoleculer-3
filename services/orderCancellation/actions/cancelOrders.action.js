const { Status } = require('../../order/constants/payment.constant');
const moment = require('moment');
module.exports = async function (ctx) {
	try {
		const canceledOrders = await this.broker.call('OrderModel.update', [
			{
				status: Status.PENDING,
				createdAt: {
					$lte: moment(new Date())
						.add(-this.settings.TIME_TO_CANCEL_ORDER_IN_MINUTES, 'minutes')
						.toDate(),
				},
			},
			{
				status: Status.CANCELED,
				cancellationReason:
					'Payment time expired. Order must be paid within 2 hours',
			},
		]);
		console.log('[cronJob] - canceledOrders: ', canceledOrders.n);
	} catch (error) {
		console.log(error.message);
	}
};
