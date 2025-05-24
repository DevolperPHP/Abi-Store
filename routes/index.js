const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Product = require('../models/Product')
const Sell = require('../models/Sell')

router.get("/", async (req, res) => {
    const id = req.cookies.id
    const user = await User.findOne({ _id: id })

    const count = await Product.countDocuments();
    const randomIndex = Math.floor(Math.random() * count)
    const product = await Product.findOne().skip(randomIndex)
    if (user && user.isAdmin == true) { 
        if (product) {
            const score = product.score.map(x => parseInt(x.num)).slice(-10)
            const scoreDate = product.score.map(x => x.Date).slice(-10)
            const orders = await Sell.find({}).sort({ Date: -1 }).limit(4)
            const products = await Product.find({}).sort({ qty: 1 }).limit(5)


            res.render("index/index", {
                user: user,
                err: req.flash("permission-error"),
                product: product,
                score: score,
                scoreDate: scoreDate,
                sell: orders,
                products: products
            })
        } else {
            res.render("index/index", {
                user: user,
                err: req.flash("permission-error"),
                product: product,
                score: "",
                scoreDate: "",
                sell: "",
                products: ""
            })
        }
    } else {
        res.redirect("/passport/sign-up")
    }
})

module.exports = router