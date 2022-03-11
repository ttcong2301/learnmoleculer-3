const Cron = require('moleculer-cron');
const moment = require('moment');

const _ = require('lodash');
const { Status } = require('../order/constants/paymentMethods.constant');
const { MoleculerClientError } = require('moleculer').Errors;

module.exports = {
	name: 'OrderCancellation',

	/**
	 * Settings
	 */
	mixins: [Cron],
	crons: [
		{
			name: 'autoCancelOrder',
			cronTime: '*/10 * * * * *', // every 10 seconds
			onTick: async function () {
				await this.getLocalService('OrderCancellation').actions.cancelOrders();
			},
			timeZone: 'Asia/Ho_Chi_Minh',
		},
	],
	settings: {
		TIME_TO_CANCEL_ORDER_IN_MINUTES: 1,
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		cancelOrders: {
			handler: async function (ctx) {
				const canceledOrders = await ctx.call('OrderModel.update', [
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
			},
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
