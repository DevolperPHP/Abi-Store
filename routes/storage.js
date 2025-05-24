const express = require('express')
const User = require('../models/User')
const Product = require('../models/Product')
const Size = require('../models/Size')
const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const id = req.cookies.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect("/passport/sign-up");
        }

        const hasPermission = user.isAdmin || user.permissions.includes('Storage');
        if (!hasPermission) {
            req.flash("permission-error", "error");
            return res.redirect("/");
        }

        const sizes = await Size.find({});
        const productDataForAutocomplete = await Product.find({}, 'name size');
        const uniqueArray = [
            ...new Set(productDataForAutocomplete.map(item => `${item.name} - ${item.size}`))
        ];
        const totalsResult = await Product.aggregate([
            {
                $group: {
                    _id: null, // Group all products
                    totalSellValue: { $sum: { $multiply: ["$qty", "$sell_price"] } },
                    totalBuyValue: { $sum: { $multiply: ["$qty", "$price"] } }
                }
            }
        ]);

        const totalSell = totalsResult[0]?.totalSellValue || 0;
        const totalBuy = totalsResult[0]?.totalBuyValue || 0;
        const page = 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const products = await Product.find({})
            .sort({ Date: -1 })
            .skip(skip)
            .limit(limit);

        res.render("storage/storage", {
            user: user,
            products: products,
            size: sizes,
            totalSell: totalSell,
            totalBuy: totalBuy,
            data: uniqueArray,
            initialLimit: limit
        });

    } catch (err) {
        console.error("Error fetching storage data:", err);
        res.status(500).send("Server error occurred.");
    }
});

router.get("/api", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const products = await Product.find({})
            .sort({ Date: -1 })
            .skip(skip)
            .limit(limit);

        res.json(products);

    } catch (err) {
        console.error("Error fetching storage API data:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

router.get("/filter/qty-most", async (req, res) => {
    try {
        const id = req.cookies.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect("/passport/sign-up");
        }

        const hasPermission = user.isAdmin || user.permissions.includes('Storage');
        if (!hasPermission) {
            req.flash("permission-error", "error");
            return res.redirect("/");
        }

        const sizes = await Size.find({});
        const productDataForAutocomplete = await Product.find({}, 'name size');
        const uniqueArray = [
            ...new Set(productDataForAutocomplete.map(item => `${item.name} - ${item.size}`))
        ];
        const totalsResult = await Product.aggregate([
            {
                $group: {
                    _id: null, // Group all products
                    totalSellValue: { $sum: { $multiply: ["$qty", "$sell_price"] } },
                    totalBuyValue: { $sum: { $multiply: ["$qty", "$price"] } }
                }
            }
        ]);

        const totalSell = totalsResult[0]?.totalSellValue || 0;
        const totalBuy = totalsResult[0]?.totalBuyValue || 0;
        const page = 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const products = await Product.find({}).sort({ qty: -1 })
            .sort({ Date: -1 })
            .skip(skip)
            .limit(limit);

        res.render("storage/storage", {
            user: user,
            products: products,
            size: sizes,
            totalSell: totalSell,
            totalBuy: totalBuy,
            data: uniqueArray,
            initialLimit: limit
        });

    } catch (err) {
        console.error("Error fetching storage data:", err);
        res.status(500).send("Server error occurred.");
    }
})

router.get("/filter/qty-less", async (req, res) => {
    try {
        const id = req.cookies.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect("/passport/sign-up");
        }

        const hasPermission = user.isAdmin || user.permissions.includes('Storage');
        if (!hasPermission) {
            req.flash("permission-error", "error");
            return res.redirect("/");
        }

        const sizes = await Size.find({});
        const productDataForAutocomplete = await Product.find({}, 'name size');
        const uniqueArray = [
            ...new Set(productDataForAutocomplete.map(item => `${item.name} - ${item.size}`))
        ];
        const totalsResult = await Product.aggregate([
            {
                $group: {
                    _id: null, // Group all products
                    totalSellValue: { $sum: { $multiply: ["$qty", "$sell_price"] } },
                    totalBuyValue: { $sum: { $multiply: ["$qty", "$price"] } }
                }
            }
        ]);

        const totalSell = totalsResult[0]?.totalSellValue || 0;
        const totalBuy = totalsResult[0]?.totalBuyValue || 0;
        const page = 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const products = await Product.find({}).sort({ qty: 1 })
            .sort({ Date: -1 })
            .skip(skip)
            .limit(limit);

        res.render("storage/storage", {
            user: user,
            products: products,
            size: sizes,
            totalSell: totalSell,
            totalBuy: totalBuy,
            data: uniqueArray,
            initialLimit: limit
        });

    } catch (err) {
        console.error("Error fetching storage data:", err);
        res.status(500).send("Server error occurred.");
    }
})

router.get("/filter/cost-most", async (req, res) => {
    try {
        const id = req.cookies.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect("/passport/sign-up");
        }

        const hasPermission = user.isAdmin || user.permissions.includes('Storage');
        if (!hasPermission) {
            req.flash("permission-error", "error");
            return res.redirect("/");
        }

        const sizes = await Size.find({});
        const productDataForAutocomplete = await Product.find({}, 'name size');
        const uniqueArray = [
            ...new Set(productDataForAutocomplete.map(item => `${item.name} - ${item.size}`))
        ];
        const totalsResult = await Product.aggregate([
            {
                $group: {
                    _id: null, // Group all products
                    totalSellValue: { $sum: { $multiply: ["$qty", "$sell_price"] } },
                    totalBuyValue: { $sum: { $multiply: ["$qty", "$price"] } }
                }
            }
        ]);

        const totalSell = totalsResult[0]?.totalSellValue || 0;
        const totalBuy = totalsResult[0]?.totalBuyValue || 0;
        const page = 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const products = await Product.find({}).sort({ price: -1 })
            .sort({ Date: -1 })
            .skip(skip)
            .limit(limit);

        res.render("storage/storage", {
            user: user,
            products: products,
            size: sizes,
            totalSell: totalSell,
            totalBuy: totalBuy,
            data: uniqueArray,
            initialLimit: limit
        });

    } catch (err) {
        console.error("Error fetching storage data:", err);
        res.status(500).send("Server error occurred.");
    }
})

router.get("/filter/cost-less", async (req, res) => {
    try {
        const id = req.cookies.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect("/passport/sign-up");
        }

        const hasPermission = user.isAdmin || user.permissions.includes('Storage');
        if (!hasPermission) {
            req.flash("permission-error", "error");
            return res.redirect("/");
        }

        const sizes = await Size.find({});
        const productDataForAutocomplete = await Product.find({}, 'name size');
        const uniqueArray = [
            ...new Set(productDataForAutocomplete.map(item => `${item.name} - ${item.size}`))
        ];
        const totalsResult = await Product.aggregate([
            {
                $group: {
                    _id: null, // Group all products
                    totalSellValue: { $sum: { $multiply: ["$qty", "$sell_price"] } },
                    totalBuyValue: { $sum: { $multiply: ["$qty", "$price"] } }
                }
            }
        ]);

        const totalSell = totalsResult[0]?.totalSellValue || 0;
        const totalBuy = totalsResult[0]?.totalBuyValue || 0;
        const page = 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const products = await Product.find({}).sort({ price: 1 })
            .sort({ Date: -1 })
            .skip(skip)
            .limit(limit);

        res.render("storage/storage", {
            user: user,
            products: products,
            size: sizes,
            totalSell: totalSell,
            totalBuy: totalBuy,
            data: uniqueArray,
            initialLimit: limit
        });

    } catch (err) {
        console.error("Error fetching storage data:", err);
        res.status(500).send("Server error occurred.");
    }
})

router.get("/size/:size", async (req, res) => {
    try {
        const id = req.cookies.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect("/passport/sign-up");
        }

        const hasPermission = user.isAdmin || user.permissions.includes('Storage');
        if (!hasPermission) {
            req.flash("permission-error", "error");
            return res.redirect("/");
        }

        const sizes = await Size.find({});
        const productDataForAutocomplete = await Product.find({}, 'name size');
        const uniqueArray = [
            ...new Set(productDataForAutocomplete.map(item => `${item.name} - ${item.size}`))
        ];
        const totalsResult = await Product.aggregate([
            {
                $group: {
                    _id: null, // Group all products
                    totalSellValue: { $sum: { $multiply: ["$qty", "$sell_price"] } },
                    totalBuyValue: { $sum: { $multiply: ["$qty", "$price"] } }
                }
            }
        ]);

        const totalSell = totalsResult[0]?.totalSellValue || 0;
        const totalBuy = totalsResult[0]?.totalBuyValue || 0;
        const page = 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const products = await Product.find({ size: req.params.size }).sort({ qty: 1 })
            .sort({ Date: -1 })
            .skip(skip)
            .limit(limit);

        res.render("storage/storage", {
            user: user,
            products: products,
            size: sizes,
            totalSell: totalSell,
            totalBuy: totalBuy,
            data: uniqueArray,
            initialLimit: limit
        });

    } catch (err) {
        console.error("Error fetching storage data:", err);
        res.status(500).send("Server error occurred.");
    }
})

router.get("/search/:name", async (req, res) => {
    try {
        const id = req.cookies.id
        const user = await User.findOne({ _id: id })
        const uniqueProductNames = await Product.distinct('name');
        const searchValue = req.params.name
        const [name, size] = searchValue.split(' - ');
        const products = await Product.find({ name: name, size: size })
        const allProducts = await Product.find({})
        const data = allProducts.map((item) => `${item.name} - ${item.size}`)
        const uniqueProducts = [];
        const uniqueArray = [... new Set(data)]

        for (const name of uniqueProductNames) {
            const product = await Product.findOne({ name });
            if (product) {
                uniqueProducts.push(product);
            }
        }
        if (user) {
            if (user.isAdmin == true || user.permissions.includes('Storage')) {
                const size = await Size.find({})

                const totalSell = []
                const totalBuy = []
                for (let i = 0; i < products.length; i++) {
                    totalSell.push(products[i].qty * products[i].sell_price)
                }

                for (let i = 0; i < products.length; i++) {
                    totalBuy.push(products[i].qty * products[i].price)
                }
                res.render("storage/storage", {
                    user: user,
                    products: products,
                    size: size,
                    totalSell: totalSell.reduce((a, b) => a + b),
                    totalBuy: totalBuy.reduce((a, b) => a + b),
                    data: uniqueArray,
                    initialLimit: 1000
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