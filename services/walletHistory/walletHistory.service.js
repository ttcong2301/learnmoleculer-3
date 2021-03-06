const _ = require('lodash');
const { MoleculerClientError } = require('moleculer').Errors;

module.exports = {
	name: 'WalletHistory',

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
		getWalletHistory: {
			rest: {
				method: 'POST',
				fullPath: '/walletHistory',
				auth: {
					strategies: ['jwt'],
					mode: 'required',
				},
			},
			params: {
				body: {
					$$type: 'object',
					fromDate: 'string|optional',
					toDate: 'string|optional',
				},
			},
			handler: require('./actions/getWalletHistory.action'),
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
