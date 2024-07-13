const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    trader: {
        type: String,
    },

    purchase: {
        type: Array
    },

    user: {
        type: String,
    },

    cost:{
        type: Number,
    },

    Date: {
        type: String,
    }
})

const Purchase = mongoose.model('Purchase', purchaseSchema)
module.exports = Purchase