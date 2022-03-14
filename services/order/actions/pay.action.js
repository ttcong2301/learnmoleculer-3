const {
	Status,
	PaymentMethods,
} = require('../constants/paymentMethods.constant');
const randomstring = require('randomstring');
const { MoleculerClientError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const userid = ctx.meta.auth.data._id;

		const { orderId, method } = ctx.params.body;
		const order = await ctx.call('OrderModel.findOne', [
			{
				_id: orderId,
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

		const wallet = await ctx.call('WalletModel.findOne', [{ userId: userid }]);

		if (method === PaymentMethods.WALLET) {
			if (wallet.balance < order.amount)
				throw new MoleculerClientError(
					'Insufficient balance',
					400,
					'INSUFFICIENT_BALANCE',
					{ balance: wallet.balance }
				);

			const [updatedWallet, updatedOrder] = await ctx.mcall([
				{
					action: 'WalletModel.findOneAndUpdate',
					params: [{ userId: userid }, { $inc: { balance: -order.amount } }],
				},
				{
					action: 'OrderModel.findOneAndUpdate',
					params: [
						{ _id: orderId },
						{
							status: 'paid',
							payDate: Date.now(),
							paymentMethod: PaymentMethods.WALLET,
							transactionNo: randomstring.generate({
								length: 10,
								charset: 'numeric',
							}),
						},
						{ new: true },
					],
				},
			]);

			return updatedOrder;
		}

		if (method === PaymentMethods.ATM) {
			const { bankId } = ctx.params.body;
			const paymentURL = `https://payment.${bankId}.com/?orderId=${orderId}&amount=${order.amount}`;

			const transactonId = randomstring.generate({
				length: 10,
				charset: 'numeric',
			});

			await ctx.call('OrderModel.findOneAndUpdate', [
				{ _id: orderId },
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
