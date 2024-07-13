const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Sell = require('../models/Sell');
const moment = require('moment');
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const sell = await Sell.find({}).sort({ Date: -1 })
        const uniqueSellNames = await Sell.distinct('name');
        const uniqueSell = [];
        const data = sell.map((item) => `${item.name}`)
        const uniqueArray = [... new Set(data)]

        for (const name of uniqueSellNames) {
            const product = await Sell.findOne({ name });
            if (product) {
                uniqueSell.push(product);
            }
        }

        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                res.render("sell/dashboard", {
                    user: user,
                    sell: sell,
                    data: uniqueArray,
                })
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/new', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const products = await Product.find({})
        const data = products.map((item) => `${item.name} - ${item.size}`)
        const uniqueArray = [... new Set(data)]
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                if (user.cart.length > 0) {
                    const cost = user.cart.map(x => x.total)
                    const total = cost.reduce((a, b) => a + b)
                    res.render("sell/new", {
                        user: user,
                        data: uniqueArray,
                        err: req.flash('cart-filter-error'),
                        qty_err: req.flash('qty-error'),
                        total: total,
                        search_err: req.flash('not-found-error'),
                        stock_err: req.flash('stock-err'),
                    })
                } else {
                    res.render("sell/new", {
                        user: user,
                        data: uniqueArray,
                        err: req.flash('cart-filter-error'),
                        qty_err: req.flash('qty-error'),
                        total: 0,
                        search_err: req.flash('not-found-error'),
                        stock_err: req.flash('stock-err'),
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

router.get('/get/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Product.findOne({ _id: req.params.id })
        const products = await Product.find({ _id: req.params.id })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                res.render("sell/get-item", {
                    user: user,
                    data: data,
                    products: products
                })
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect('/passport/sign-up')
        }
    } catch (err) {
        console.log(err);
    }
})

router.put('/add-by-code/:code', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Product.findOne({ barcode: req.params.code })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                if (data) {
                    const filter = user.cart.find((item) => item.barcode === req.params.code)
                    if (filter) {
                        req.flash('cart-filter-error', 'error')
                    } else {
                        if (data.qty > 0) {
                            await User.updateOne({ _id: id }, {
                                $push: {
                                    cart: {
                                        name: data.name,
                                        price: data.sell_price,
                                        image: data.image,
                                        color: data.color,
                                        size: data.size,
                                        qty: 1,
                                        id: data.id,
                                        total: data.sell_price,
                                        barcode: data.barcode
                                    }
                                }
                            })

                            await Product.updateOne({ barcode: req.params.code }, {
                                $set: {
                                    qty: data.qty - 1
                                }
                            })
                        }
                    }
                } else {
                    req.flash('not-found-error', 'error')
                }

                res.redirect('/sell/new')
            }
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/edit-qty/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Product.findOne({ _id: req.params.id })

        if (user.isAdmin == true || user.permissions.includes('Sell')) {
            res.render('sell/edit-qty', {
                user: user,
                data: data
            })
        }
    } catch (err) {
        console.log(err);
    }
})

router.put('/edit-qty/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Product.findOne({ _id: req.params.id })

        if (user.isAdmin == true || user.permissions.includes('Sell')) {
            const qty = Number(req.body.qty)
            const getItem = user.cart.find(item => item.id === req.params.id)
            const oldQty = getItem.qty
            if (qty > oldQty) {
                if (data.qty + oldQty >= qty) {
                    await Product.updateOne({ _id: req.params.id }, {
                        $set: {
                            qty: data.qty + oldQty - qty
                        }
                    })

                    await User.updateOne({ _id: id, 'cart.id': req.params.id }, {
                        $set: {
                            'cart.$.qty': qty,
                            'cart.$.total': data.sell_price * qty
                        }
                    })
                } else {
                    req.flash('stock-err', 'err')
                }
            } else if (qty < oldQty) {
                const confusing = oldQty - qty
                if (data.qty + oldQty >= qty) {
                    await Product.updateOne({ _id: req.params.id }, {
                        $set: {
                            qty: data.qty + confusing
                        }
                    })

                    await User.updateOne({ _id: id, 'cart.id': req.params.id }, {
                        $set: {
                            'cart.$.qty': qty,
                            'cart.$.total': data.sell_price * qty
                        }
                    })
                } else {
                    req.flash('stock-err', 'err')

                }
            }


            res.redirect('/sell/new')
        }
    } catch (err) {
        console.log(err);
    }
})

router.put('/plus/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                const data = await Product.findOne({ _id: req.params.id })
                if (data.qty > 0) {
                    await User.updateOne(
                        {
                            _id: id,
                            'cart.id': req.params.id
                        },
                        {
                            $inc: { 'cart.$.qty': 1 }
                        }
                    );

                    await Product.updateOne({ _id: req.params.id }, {
                        $set: {
                            qty: data.qty - 1
                        }
                    })
                } else {
                    req.flash('stock-err', 'error')
                }
                res.redirect('/sell/new')
            }
        }
    } catch (err) {
        console.log(err);
    }
})

router.put('/add/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Product.findOne({ _id: req.params.id })
        const { qty } = req.body
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                const qtyCheck = Number(data.qty) - Number(qty)
                const filter = user.cart.find((item) => item.id === req.params.id)
                if (filter) {
                    req.flash('cart-filter-error', 'error')
                } else {
                    if (qtyCheck < 0) {
                        req.flash("qty-error", "error")
                        res.redirect("/sell/new")
                    } else {
                        await User.updateOne({ _id: id }, {
                            $push: {
                                cart: {
                                    name: data.name,
                                    price: data.sell_price,
                                    image: data.image,
                                    color: data.color,
                                    size: data.size,
                                    qty: qty,
                                    id: data.id,
                                    total: qty * data.sell_price,
                                }
                            }
                        })

                        await Product.updateOne({ _id: req.params.id }, {
                            $set: {
                                qty: data.qty - qty
                            },

                            $push: {
                                score: {
                                    num: qty,
                                    Date: moment().locale("ar-kw").format("l")
                                }
                            }
                        })
                    }
                }
                res.redirect("/sell/new")
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect('/passport/sign-up')
        }
    } catch (err) {
        console.log(err);
    }
})



router.put('/remove/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const product = await Product.findOne({ _id: req.params.id })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                const data = user.cart.find((item) => item.id === req.params.id)
                await Product.updateOne({ _id: req.params.id }, {
                    $set: {
                        qty: Number(product.qty) + Number(data.qty)
                    },

                    $pull: {
                        score: {
                            num: data.qty,
                            Date: data.Date,
                        }
                    }
                })

                await User.updateOne({ _id: id }, {
                    $pull: {
                        cart: {
                            id: data.id
                        }
                    }
                })

                res.redirect("back")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/confirm", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const { phone, adress, note, total, name } = req.body

        const generateRandomNumber = () => {
            const min = 100000;
            const max = 999999;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        const randomNumber = generateRandomNumber();
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                const newSell = [
                    new Sell({
                        phone: phone,
                        adress: adress,
                        note: note,
                        status: "pending",
                        products: user.cart,
                        Date: moment().locale("ar-kw").format("l"),
                        user: user.name,
                        bid: randomNumber,
                        total: total,
                        name: name,
                    })
                ]

                newSell.forEach((data) => {
                    data.save()
                })

                await User.updateOne({ _id: id }, {
                    $set: {
                        cart: []
                    }
                })

                res.redirect("/sell")
            } else {
                req.flash('permission-error', 'error')
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/search-by-date/:start/:end", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const startDateString = req.params.start.replaceAll('-', '/')
        const endDateString = req.params.end.replaceAll('-', '/')

        const sell = await Sell.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $gte: [{ $dateFromString: { dateString: '$Date', format: '%d/%m/%Y' } }, new Date(startDateString)] },
                            { $lte: [{ $dateFromString: { dateString: '$Date', format: '%d/%m/%Y' } }, new Date(endDateString)] }
                        ]
                    }
                }
            }
        ]);

        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                res.render("sell/get-search", {
                    user: user,
                    sell: sell,
                    filter: `date : ${startDateString} - ${endDateString}`
                })
            } else {
                req.flash('permission-error', 'error')
                res.redirect("/")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/search-by-phone/:phone', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const phone = req.params.phone
        const sell = await Sell.find({ phone: phone }).sort({ Date: -1 })

        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                res.render("sell/get-search", {
                    user: user,
                    sell: sell,
                    filter: `phone : ${phone}`
                })
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/search-by-filter/:filter", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const filter = req.params.filter

        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                if (filter == "newest") {
                    const sell = await Sell.find({}).sort({ Date: -1 })
                    res.render("sell/get-search", {
                        user: user,
                        sell: sell,
                        filter: `filter : newst`
                    })
                }

                if (filter == "oldest") {
                    const sell = await Sell.find({}).sort({ Date: 1 })
                    res.render("sell/get-search", {
                        user: user,
                        sell: sell,
                        filter: `filter : oldest`
                    })
                }

                if (filter == "pending") {
                    const sell = await Sell.find({ status: 'pending' })
                    res.render("sell/get-search", {
                        user: user,
                        sell: sell,
                        filter: `filter : pending`
                    })
                }
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get("/get-data/:id", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Sell.findOne({ _id: req.params.id })

        if (user) {
            if (user.isAdmin == true || user.permissions.includes("Sell")) {
                if (data.products.length > 0) {
                    const total = data.products.map((x) => x.total).reduce((a, b) => a + b)
                    res.render("sell/get-data", {
                        user: user,
                        data: data,
                        total: total,
                        suc: req.flash("status-suc"),
                    })
                } else {
                    await Sell.deleteOne({ _id: req.params.id })
                    res.redirect("/sell")
                }

            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put("/return/:orderId/:itemId", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                const { orderId, itemId } = req.params
                const data = await Sell.findOne({ _id: orderId })
                const itemData = await Product.findOne({ _id: itemId })
                const item = data.products.find((item) => item.id === itemId)

                await Product.updateOne({ _id: itemId }, {
                    $set: {
                        qty: Number(itemData.qty) + Number(item.qty)
                    },

                    $pull: {
                        score: {
                            num: item.qty
                        }
                    }
                })

                await Sell.updateOne({ _id: orderId }, {
                    $pull: {
                        products: {
                            id: item.id
                        }
                    }
                })
                res.redirect("back")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put('/status/confirm/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                await Sell.updateOne({ _id: req.params.id }, {
                    $set: {
                        status: "done"
                    }
                })

                req.flash("status-suc", "success")
                res.redirect("back")
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/bill/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user) {
            const data = await Sell.findOne({ _id: req.params.id })
            const total = data.products.map((x) => x.total).reduce((a, b) => a + b)
            res.render("sell/bill", {
                user: user,
                data: data,
                total: total
            })
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Sell.findOne({ _id: req.params.id })
        const products = await Product.find({})
        const productsData = products.map((item) => `${item.name} - ${item.size}`)
        const uniqueArray = [... new Set(productsData)]

        if (data.products.length > 0) {
            const cost = data.products.map(x => x.total)
            const total = cost.reduce((a, b) => a + b)
            if (user.isAdmin == true || user.permissions.includes("Sell")) {
                res.render('sell/edit', {
                    user: user,
                    data: data,
                    total: total,
                    uniqueArray: uniqueArray,
                    err: req.flash("qty-error"),
                    uniqueErr: req.flash('cart-filter-error')
                })
            }
        } else {
            await Sell.deleteOne({ _id: req.params.id })
            res.redirect("/sell")
        }
    } catch (err) {
        console.log(err);
    }
})

router.put('/edit/remove/:sellId/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const product = await Product.findOne({ _id: req.params.id })
        const sell = await Sell.findOne({ _id: req.params.sellId })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                const data = sell.products.find((item) => item.id === req.params.id)
                await Product.updateOne({ _id: req.params.id }, {
                    $set: {
                        qty: Number(product.qty) + Number(data.qty)
                    },

                    $pull: {
                        score: {
                            num: data.qty,
                            Date: data.Date,
                        }
                    }
                })

                await Sell.updateOne({ _id: req.params.sellId }, {
                    $pull: {
                        products: {
                            id: data.id
                        }
                    }
                })
                res.redirect("back")

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

        const { name, phone, adress, note } = req.body

        if (user.isAdmin == true || user.permissions.includes("Sell")) {
            await Sell.updateOne({ _id: req.params.id }, {
                $set: {
                    name: name,
                    phone: phone,
                    adress: adress,
                    note: note,
                }
            })

            res.redirect(`/sell/get-data/${req.params.id}`)
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/edit/search/:id/:name', async (req, res) => {
    try {
        const id = req.cookies.id;
        const user = await User.findOne({ _id: id })
        const searchValue = req.params.name
        const [name, size] = searchValue.split(' - ');
        const products = await Product.find({ name: name, size: size })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                res.render('sell/edit-search', {
                    user: user,
                    products: products,
                    id: req.params.id
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

router.get('/edit/get/:id/:productId', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const data = await Product.findOne({ _id: req.params.productId })
        const products = await Product.find({ _id: req.params.id })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                res.render("sell/edit-get-item", {
                    user: user,
                    data: data,
                    products: products,
                    id: req.params.id
                })
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect('/passport/sign-up')
        }
    } catch (err) {
        console.log(err);
    }
})

router.put('/edit/add/:orderId/:id', async (req, res) => {
    try {
        const id = req.cookies.id
        const orderId = req.params.orderId
        const user = await User.findOne({ _id: id })
        const data = await Product.findOne({ _id: req.params.id })
        const order = await Sell.findOne({ _id: orderId })
        const { qty, type } = req.body
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                const qtyCheck = Number(data.qty) - Number(qty)
                const filter = order.products.find((item) => item.id === req.params.id)
                if (filter) {
                    req.flash('cart-filter-error', 'error')
                    res.redirect(`/sell/edit/${orderId}`)
                } else {
                    if (qtyCheck < 0) {
                        req.flash("qty-error", "error")
                        res.redirect(`/sell/edit/${orderId}`)
                    } else {
                        await Sell.updateOne({ _id: orderId }, {
                            $push: {
                                products: {
                                    name: data.name,
                                    price: data.sell_price,
                                    image: data.image,
                                    color: data.color,
                                    size: data.size,
                                    qty: qty,
                                    type: type,
                                    id: data.id,
                                    total: qty * data.sell_price,
                                }
                            }
                        })

                        await Product.updateOne({ _id: req.params.id }, {
                            $set: {
                                qty: data.qty - qty
                            },

                            $push: {
                                score: {
                                    num: qty,
                                    Date: moment().locale("ar-kw").format("l")
                                }
                            }
                        })
                    }
                }
                res.redirect(`/sell/edit/${orderId}`)
            } else {
                req.flash("permission-error", "error")
                res.redirect("/")
            }
        } else {
            res.redirect('/passport/sign-up')
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/search-by-name/:name', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const sell = await Sell.find({ name: req.params.name }).sort({ Date: -1 })
        const sellForSearch = await Sell.find({}).sort({ Date: -1 })
        const uniqueSellNames = await Sell.distinct('name');
        const uniqueSell = [];
        const data = sellForSearch.map((item) => `${item.name}`)
        const uniqueArray = [... new Set(data)]
        for (const name of uniqueSellNames) {
            const product = await Sell.findOne({ name });
            if (product) {
                uniqueSell.push(product);
            }
        }
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                res.render("sell/dashboard", {
                    user: user,
                    sell: sell,
                    data: uniqueArray,
                })
            }
        } else {
            res.redirect("/passport/sign-up")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/search/:name', async (req, res) => {
    try {
        const id = req.cookies.id;
        const user = await User.findOne({ _id: id })
        const searchValue = req.params.name
        const [name, size] = searchValue.split(' - ');
        const products = await Product.find({ name: name, size: size })
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Sell')) {
                res.render('sell/search', {
                    user: user,
                    products: products
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
module.exports = router