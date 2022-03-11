const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	balance: {
		type: Number,
		default: 100000000,
		min: 0,
	},
});

module.exports = mongoose.model('Wallet', walletSchema);
