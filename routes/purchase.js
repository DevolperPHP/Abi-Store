const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();
const moment = require('moment');
const Purchase = require('../models/Purchase');


router.get("/", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const products = await Product.find({})
        const data = products.map((item) => {
            return {
                name: item.name,
                size: item.size,

            }
        })

        const transformedArray = data.map((item) => `${item.name} - ${item.size}`);
        const uniqueArray = [...new Set(transformedArray)];

        if (user) {
            if (user.isAdmin == true || (user.permissions.includes("Purchase"))) {

                if (user.purchase.length > 0) {
                    const cost = user.purchase.map(x => x.total)
                    const total = cost.reduce((a, b) => a + b)

                    res.render("purchase/purchase", {
                        user: user,
                        data: uniqueArray,
                        err: req.flash("purchase-filter-error"),
                        err_new: req.flash("new-purchase-error"),
                        total: total,
                    })
                } else {

                    res.render("purchase/purchase", {
                        user: user,
                        data: uniqueArray,
                        err: req.flash("purchase-filter-error"),
                        err_new: req.flash("new-purchase-error"),
                        total: 0,
                    })
                }

            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/search/:name", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const searchValue = req.params.name
        const [name, size] = searchValue.split(' - ');
        const products = await Product.find({ name: name, size: size })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes("Purchase")) {
                res.render("purchase/search", {
                    user: user,
                    products: products,
                })
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/get/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const products = await Product.find({ _id: req.params.id })
        const data = await Product.findOne({ _id: req.params.id })

        if (user) {
            if (user.isAdmin == true || user.permissions.includes("Purchase")) {
                res.render("purchase/get-item", {
                    user: user,
                    products: products,
                    data: data,
                })
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/get-by-code/:code', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Product.findOne({ barcode: req.params.code })
        if(user){
            if (user.isAdmin == true || user.permissions.includes("Purchase")) {
                res.render('purchase/get-item-by-code', {
                    user: user,
                    data: data
                })
            }
        } else {
            res.redirect("/passport/sgin-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/add/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Product.findOne({ _id: req.params.id })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes("Purchase")) {
                const qty = Number(req.body.qty)
                const filter = user.purchase.find((item) => item.id === req.params.id)
                if (filter) {
                    req.flash("purchase-filter-error", "error")
                } else {
                    await User.updateOne({ _id: id }, {
                        $push: {
                            purchase: {
                                id: data.id,
                                name: data.name,
                                qty: qty,
                                image: data.image,
                                color: data.color,
                                size: data.size,
                                cost: data.price,
                                sell: data.sell_price,
                                total: qty * data.price,
                            }
                        }
                    })

                    await Product.updateOne({ _id: req.params.id }, {
                        $set: {
                            qty: qty + data.qty,
                        },

                        $push: {
                            purchase: {
                                qty: qty,
                                date: moment().locale("ar-kw").format("l")
                            }
                        }
                    })
                }

                return res.redirect("/purchase")
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/remove/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            if (user.isAdmin == true || user.permissions.includes("Purchase")) {
                const data = user.purchase.find((item) => item.id === req.params.id)
                const product = await Product.findOne({ _id: req.params.id })
                await Product.updateOne({ _id: req.params.id }, {
                    $set: {
                        qty: Number(product.qty) - Number(data.qty)
                    },

                    $pull: {
                        purchase: {
                            date: data.date
                        }
                    }
                })

                await User.updateOne({ _id: id }, {
                    $pull: {
                        purchase: {
                            id: data.id,
                        }
                    }
                })
                res.redirect("back")
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/new", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            if (user.isAdmin == true || user.permissions.includes("Purchase")) {
                if (user.purchase.length > 0) {

                    const newPurchase = [
                        new Purchase({
                            trader: req.body.trader,
                            purchase: user.purchase,
                            user: user.name,
                            cost: req.body.cost,
                            Date: moment().locale("ar-kw").format("l"),
                        })
                    ]

                    newPurchase.forEach((data) => {
                        data.save()
                    })

                    await User.updateOne({ _id: id }, {
                        $set: { purchase: [] }
                    })

                    res.redirect("/purchase/get-purchases")
                } else {
                    req.flash("new-purchase-error", "error")
                    res.redirect("back")
                }
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})


router.get("/get-purchases", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const purchases = await Purchase.find({}).sort({ Date: -1 })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes("Purchase")) {
                res.render("purchase/get-purchases", {
                    user: user,
                    purchases: purchases,
                })
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/get-purchase/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            if (user.isAdmin == true || user.permissions.includes("Purchase")) {
                const data = await Purchase.findOne({ _id: req.params.id })
                const cost = data.purchase.map(x => x.total)
                const total = cost.reduce((a, b) => a + b)
                res.render("purchase/get-purchase-data", {
                    user: user,
                    data: data,
                    total: total,
                })
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect("/")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user.isAdmin == true || user.permissions.includes("Purchase")) {
            const data = await Purchase.findOne({ _id: req.params.id })
            if (data.purchase.length > 0) {
                const cost = data.purchase.map(x => x.total)
                const total = cost.reduce((a, b) => a + b)
                res.render('purchase/edit', {
                    user: user,
                    data: data,
                    total: total,
                })
            } else {
                await Purchase.deleteOne({ _id: req.params.id })
                res.redirect("/purchase/get-purchases")
            }
        }
    } catch (err) {
        console.log(err);
    }
})


router.put("/edit/remove/:pId/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const getPurchase = await Purchase.findOne({ _id: req.params.pId})
        if (user) {
            if (user.isAdmin == true || user.permissions.includes("Purchase")) {
                const data = getPurchase.purchase.find((item) => item.id === req.params.id)
                const product = await Product.findOne({ _id: req.params.id })
                await Product.updateOne({ _id: req.params.id }, {
                    $set: {
                        qty: Number(product.qty) - Number(data.qty)
                    },

                    $pull: {
                        purchase: {
                            date: data.date
                        }
                    }
                })

                await Purchase.updateOne({ _id: req.params.pId }, {
                    $pull: {
                        purchase: {
                            id: data.id,
                        }
                    }
                })
                res.redirect(`/purchase/edit/${getPurchase.id}`)
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})


router.put('/edit/confirm/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if(user.isAdmin == true || uesr.permissions.includes("Purchase")){
            const { trader, cost } = req.body
            await Purchase.updateOne({ _id: req.params.id }, {
                $set: {
                    trader: trader,
                    cost: cost,
                    user: user.name
                }
            })

            res.redirect(`/purchase/get-purchase/${req.params.id}`)
        }
    } catch (err) {
        console.log(err);
    }
})
module.exports = router