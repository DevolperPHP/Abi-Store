const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
    },

    price: {
        type: Number
    },

    qty: {
        type: Number,
    },

    barcode: {
        type: String,
    },

    Date: {
        type: String,
    },

    score: {
        type: Array,
        default : [],
    },

    image: {
        type: String,
    },

    color: {
        type: String,
    },

    size:{
        type: String
    },

    sell_price: {
        type: Number,
    },

    sizes:{
        type: Array,
        default : [],
    },

    purchase:{
        type: Array,
        default : [],
    },

    colors:{
        type: Array,
        default : [],
    },

    colorName:{
        type: String,
    },

    saleDate:{
        type: Array,
        default : []
    }
})

const Product = mongoose.model("Product", productSchema)
module.exports = Product