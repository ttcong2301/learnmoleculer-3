const { Status, PaymentMethods } = require('../constants/payment.constant');
const randomstring = require('randomstring');
const { MoleculerClientError } = require('moleculer').Errors;
const _ = require('lodash');

module.exports = async function (ctx) {
	try {
		const userid = ctx.meta.auth.data.id;

		const { orderId, method } = ctx.params.body;
		const order = await ctx.call('OrderModel.findOne', [
			{
				id: orderId,
				status: Status.PENDING,
				userId: userid,
			},
		]);
		if (!order)
			throw new MoleculerClientError(
				'Order not found or is paid',
				404,
				'ORDER_NOT_FOUND',
				{ orderId }
			);

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

		const wallet = await ctx.call('WalletModel.findOne', [{ userId: userid }]);

		if (method === PaymentMethods.WALLET) {
			if (wallet.balance < order.amount)
				throw new MoleculerClientError(
					'Insufficient balance',
					400,
					'INSUFFICIENT_BALANCE',
					{ balance: wallet.balance }
				);

			const updatedWallet = await ctx.call('WalletModel.findOneAndUpdate', [
				{ userId: userid },
				{ $inc: { balance: -order.amount } },
			]);
			const updatedOrder = await ctx.call('OrderModel.findOneAndUpdate', [
				{ id: orderId },
				{
					status: Status.PAID,
					payDate: Date.now(),
					paymentMethod: PaymentMethods.WALLET,
					transactionNo: randomstring.generate({
						length: 10,
						charset: 'numeric',
					}),
				},
				{ new: true },
			]);
			return _.omit(updatedOrder, ['_id', '__v', 'updatedAt']);
		}

		if (method === PaymentMethods.ATM) {
			const { bankId } = ctx.params.body;
			const paymentURL = `https://payment.${bankId}.com/?orderId=${orderId}&amount=${order.amount}`;

			const transactonId = randomstring.generate({
				length: 10,
				charset: 'numeric',
			});

			await ctx.call('OrderModel.findOneAndUpdate', [
				{ id: orderId },
				{
					partnerTransactionNo: transactonId,
					paymentMethod: PaymentMethods.ATM,
					bankId,
				},
			]);

			return {
				paymentURL,
			};
		}
	} catch (error) {
		throw new MoleculerClientError(error.message, 500, 'PAY_ERROR');
	}
};
