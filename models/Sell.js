const mongoose = require('mongoose');

const sellSchema = new mongoose.Schema({

    user: {
        type: String
    },

    name: {
        type: String,
    },

    products: {
        type: Array
    },

    phone: {
        type: String
    },

    note: {
        type: String,
    },

    status: {
        type: String,
    },

    adress: {
        type: String
    },

    total: {
        type: String,
    },

    bid: {
        type: String
    },

    Date: {
        type: String
    }
})

const Sell = mongoose.model('Sell', sellSchema)
module.exports = Sell