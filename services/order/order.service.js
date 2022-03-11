const _ = require('lodash');
const { sign } = require('jsonwebtoken');
const { PaymentMethods } = require('./constants/paymentMethods.constant');
const { MoleculerClientError } = require('moleculer').Errors;

module.exports = {
	name: 'Order',

	/**
	 * Settings
	 */
	settings: {},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		create: {
			rest: {
				method: 'POST',
				fullPath: '/order',
				auth: {
					strategies: ['jwt'],
					mode: 'required',
				},
			},
			params: {
				body: {
					$$type: 'object',
					amount: 'number',
					description: 'string|optional',
					address: 'string|optional',
				},
			},
			handler: async function (ctx) {
				const orderToCreate = ctx.params.body;
				orderToCreate.userId = ctx.meta.auth.data._id;
				const order = await ctx.call('OrderModel.create', [orderToCreate]);
				return order;
			},
		},
		pay: {
			rest: {
				method: 'POST',
				fullPath: '/order/pay',
				auth: {
					strategies: ['jwt'],
					mode: 'required',
				},
			},
			params: {
				body: {
					$$type: 'object',
					orderId: 'string',
					method: {
						type: 'string',
						enum: Object.values(PaymentMethods),
					},
					bankId: 'string|optional',
				},
			},
			hooks: {
				before(ctx) {
					if (
						ctx.params.body.method === PaymentMethods.ATM &&
						!ctx.params.body.bankId
					) {
						throw new MoleculerClientError(
							'BankId is required',
							400,
							'BANK_ID_REQUIRED'
						);
					}
				},
			},
			handler: require('./actions/pay.action'),
		},
		ipnReturn: {
			rest: {
				method: 'POST',
				fullPath: '/order/ipn-return',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
					b_amount: 'number',
					b_bankId: 'string',
					b_payDate: 'string',
					b_transactionNo: 'string',
					b_transactionStatus: {
						type: 'string',
						enum: ['SUCCESS', 'FAIL'],
					},
				},
			},
			handler: require('./actions/ipnReturn.action'),
		},
		getOrder: {
			rest: {
				method: 'GET',
				fullPath: '/order/:id',
				auth: false,
			},
			handler: require('./actions/getOrder.action'),
		},
	},
	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Service created lifecycle event handler
	 */
	created() {},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {},
};
