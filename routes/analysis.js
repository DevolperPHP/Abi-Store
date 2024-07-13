const express = require('express')
const User = require('../models/User')
const Sell = require('../models/Sell')
const Purchase = require('../models/Purchase')
const DailyMoney = require('../models/DailyMoney')
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })

        if (user.isAdmin == true) {
            res.render("analysis/dashboard", {
                user: user
            })
        } else {
            req.flash("permission-error", "error")
            res.redirect("/")
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/get/:start/:end', async (req, res) => {
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
                            { $lte: [{ $dateFromString: { dateString: '$Date', format: '%d/%m/%Y' } }, new Date(endDateString)] },
                        ]
                    }
                }
            },
            {
                $match: {
                    status: 'done'
                }
            }
        ]);

        const purchase = await Purchase.aggregate([
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
        ])

        const dailyMoney = await DailyMoney.aggregate([
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
        ])

        const sellTotalArray = [];
        const purchaseTotalArray = [];
        if (dailyMoney.length > 0) {
            var dailyMoneyTotal = dailyMoney.map(x => x.total).reduce((a, b) => a + b)
        } else {
            dailyMoneyTotal = 0
        }

        if (purchase.length > 0) {
            for (let i = 0; i < purchase.length; i++) {
                for (let j = 0; j < purchase[i].purchase.length; j++) {
                    purchaseTotalArray.push(purchase[i].purchase[j].total);
                }
            }
            var purchaseTotal = purchaseTotalArray.reduce((a, b) => a + b)
            var purchaseCost = purchase.map(x => x.cost).reduce((a, b) => a + b)
            purchaseTotal = purchaseTotal + purchaseCost
        } else {
            purchaseTotal = 0
        }

        if (sell.length > 0) {
            for (let i = 0; i < sell.length; i++) {
                for (let j = 0; j < sell[i].products.length; j++) {
                    sellTotalArray.push(sell[i].products[j].total)
                }
            }
            var sellTotal = sellTotalArray.reduce((a, b) => a + b)
        } else {
            sellTotal = 0
        }

        if (user.isAdmin == true) {
            res.render("analysis/result", {
                user: user,
                sell: sell,
                purchases: purchase,
                purchaseTotal: purchaseTotal,
                sellTotal: sellTotal,
                dailyMoneyTotal: dailyMoneyTotal,
                dailyMoney: dailyMoney,
                start: startDateString,
                end: endDateString,
            })
        } else {
            req.flash("permission-error", "error")
            res.redirect("/")
        }
    } catch (err) {
        console.log(err);
    }
})

module.exports = router