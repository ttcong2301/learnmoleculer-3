const { MoleculerClientError } = require('moleculer').Errors;
const AsyncLock = require('async-lock');
const {
	Status,
	PaymentMethods,
} = require('../../order/constants/payment.constant');

const lock = new AsyncLock();

module.exports = async function (ctx) {
	return new this.Promise((resolve, reject) => {
		try {
			const { userId, amount, orderId } = ctx.params;
			lock.acquire(userId, async (done) => {
				// setTimeout(async () => {
				const order = await this.broker.call('OrderModel.findOne', [
					{
						id: orderId,
						userId,
					},
				]);

				if (order.status === Status.PAID) {
					return reject(
						new MoleculerClientError(
							'Order is already paid',
							400,
							'ORDER_ALREADY_PAID'
						)
					);
				}
				if (order.status === Status.CANCELED) {
					return reject(
						new MoleculerClientError(
							'Order is already canceled',
							400,
							'ORDER_ALREADY_CANCELED'
						)
					);
				}

				if (order.paymentMethod) {
					throw new MoleculerClientError(
						'Order is in payment process',
						400,
						'ORDER_IS_PAID',
						{
							orderId,
						}
					);
				}

				const wallet = await this.broker.call('WalletModel.findOne', [
					{ userId },
				]);

				if (wallet.balance < order.amount)
					throw new MoleculerClientError(
						'Insufficient balance',
						400,
						'INSUFFICIENT_BALANCE',
						{ balance: wallet.balance }
					);

				const updatedWallet = await this.broker.call(
					'WalletModel.findOneAndUpdate',
					[{ userId }, { $inc: { balance: -amount } }, { new: true }]
				);

				const walletHistory = await this.broker.call(
					'WalletHistoryModel.create',
					[
						{
							userId,
							amount,
							balanceBefore: wallet.balance,
							balanceAfter: updatedWallet.balance,
							serviceId: 1, // common payment
							date: Date.now(),
						},
					]
				);
				if (walletHistory.id) {
					resolve(updatedWallet);
					done();
				}
				// }, 2000);
			});
		} catch (error) {
			reject(new MoleculerClientError(error.message, 500, 'PAY_ERROR'));
		}
	});
};
