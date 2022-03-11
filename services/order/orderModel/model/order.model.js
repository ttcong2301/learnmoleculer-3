const mongoose = require('mongoose');
const {
	PaymentMethods,
	Status,
} = require('../../constants/paymentMethods.constant');
const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
			default: '',
		},
		address: {
			type: String,
		},
		paymentMethod: {
			type: String,
			enum: Object.values(PaymentMethods),
		},
		payDate: {
			type: Date,
		},
		status: {
			type: String,
			enum: Object.values(Status),
			default: Status.PENDING,
		},
		partnerTransactionNo: {
			type: String,
		},
		transactionNo: {
			type: String,
		},
		bankId: {
			type: 'String',
		},
		cancellationReason: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Order', orderSchema);
