const mongoose = require('mongoose')

const uesrSchema = new mongoose.Schema({
    name:{
        type: String
    },

    email: {
        type: String
    },

    password: {
        type: String
    },

    cart: {
        type: Array
    },

    purchase: {
        type: Array,
        default: [],
    },

    permissions: {
        type: Array
    },

    isAdmin: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model("User", uesrSchema)
module.exports = User