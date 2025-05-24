const express = require('express')
const router = express.Router()
const middleWare = require('../../middleware/LocalStoreAccess')
const Sell = require('../../models/Sell')
const Product = require('../../models/Product')
const User = require('../../models/User')
const mongoose = require('mongoose')
const moment = require('moment')
const { Printer } = require('@node-escpos/core');
const USB = require('@node-escpos/usb-adapter');


router.use(middleWare)

router.get('/', async (req, res) => {
    try {
        const products = await Product.find({})
        const data = products.map((item) => `${item.name} - ${item.size}`)
        const uniqueArray = [... new Set(data)]

        const cartItems = req.user.localstoreCart;
        const ids = cartItems.map((item) => mongoose.Types.ObjectId(item.id))
        const cartData = await Product.find({ _id: { $in: ids } })
        const productsWithQty = cartData.map(product => {
            const cartItem = cartItems.find(item => item.id === product._id.toString());
            return {
                ...product.toObject(),
                qty: cartItem ? cartItem.qty : 0,
                total: (cartItem ? cartItem.qty : 0) * product.sell_price

            };
        });

        var total, totalQty
        if (productsWithQty.length > 0) {
            total = productsWithQty.map((x) => x.total).reduce((a, b) => a + b)
            totalQty = productsWithQty.map((x) => x.qty).reduce((a, b) => a + b)
        } else {
            total = 0
            totalQty = 0
        }
        


        res.render('localstore/sell/sell', {
            user: req.user,
            data: uniqueArray,
            products: productsWithQty,
            err: req.flash('data-err'),
            total,
            totalQty
        })
    } catch (err) {
        console.log(err);
    }
})

router.put('/add-by-barcode/:barcode', async (req, res) => {
    try {
        const data = await Product.findOne({ barcode: req.params.barcode })
        const user = req.user;

        if (data) {
            if (data.stock > 0) {
                const filter = user.localstoreCart.find((item) => item.id === data.id)
                if (filter) {
                    const oldQty = filter.qty
                    if (oldQty == data.stock) {
                        req.flash('data-err', 'Out of stock')
                    } else {
                        await User.updateOne({ _id: user._id, 'localstoreCart.id': data.id }, {
                            $set: {
                                'localstoreCart.$.qty': oldQty + 1
                            }
                        })
                    }
                } else {
                    await User.updateOne({ _id: user._id }, {
                        $push: {
                            localstoreCart: {
                                id: data.id,
                                qty: 1,
                            }
                        }
                    })
                }
            } else {
                req.flash('data-err', 'Out of stock')
            }
        } else {
            req.flash('data-err', 'Item not found')
        }

        res.redirect('/localstore/sell')
    } catch (err) {
        console.log(err);
    }
})

router.put('/add-by-name/:id', async (req, res) => {
    try {
        const data = await Product.findOne({ _id: req.params.id })
        const user = req.user;

        if (data) {
            if (data.stock > 0) {
                const filter = user.localstoreCart.find((item) => item.id === data.id)
                if (filter) {
                    const oldQty = filter.qty
                    if (oldQty == data.stock) {
                        req.flash('data-err', 'Out of stock')
                    } else {
                        await User.updateOne({ _id: user._id, 'localstoreCart.id': data.id }, {
                            $set: {
                                'localstoreCart.$.qty': req.body.qty
                            }
                        })
                    }
                } else {
                    await User.updateOne({ _id: user._id }, {
                        $push: {
                            localstoreCart: {
                                id: data.id,
                                qty: req.body.qty,
                            }
                        }
                    })
                }
            } else {
                req.flash('data-err', 'Out of stock')
            }
        } else {
            req.flash('data-err', 'Item not found')
        }

        res.redirect('/localstore/sell')
    } catch (err) {
        console.log(err);
    }
})

router.put('/remove/:id', async (req, res) => {
    try {
        await User.updateOne({ _id: req.user._id }, {
            $pull: {
                localstoreCart: {
                    id: req.params.id
                }
            }
        })

        res.redirect('/localstore/sell')
    } catch (err) {
        console.log(err);
    }
})

router.get('/search-by-name/:name', async (req, res) => {
    try {
        const searchValue = req.params.name
        const [name, size] = searchValue.split(' - ');
        const products = await Product.find({ name: name, size: size })
        res.render('localstore/sell/search-by-name', {
            user: req.user,
            products,

        })
    } catch (err) {
        console.log(err);
    }
})

router.get('/serch-by-name-qty/:id', async (req, res) => {
    try {
        const data = await Product.findOne({ _id: req.params.id })
        res.render('localstore/sell/get-item', {
            user: req.user,
            data
        })
    } catch (err) {
        console.log(err);
        
    }
})

router.post('/confirm', async (req, res) => {
    try {
      const user = req.user;
      let cartItems = user.localstoreCart;
  
      // Extract product IDs from cart
      const ids = cartItems.map(item => mongoose.Types.ObjectId(item.id));
      const products = await Product.find({ _id: { $in: ids } });
  
      let outOfStock = false;
  
      // Filter out items with insufficient stock
      cartItems = cartItems.filter(cartItem => {
        const product = products.find(p => p._id.toString() === cartItem.id);
        if (!product || product.stock < cartItem.qty) {
          req.flash('data-err', `Only ${product?.stock || 0} of ${product?.name || 'item'} left in stock.`);
          outOfStock = true;
          return false;
        }
        return true;
      });
  
      if (outOfStock) {
        return res.redirect('/localstore/sell');
      }
  
      // Update product stock
      for (const product of products) {
        const cartItem = cartItems.find(item => item.id === product._id.toString());
        if (cartItem) {
          product.stock -= cartItem.qty;
          await product.save();
        }
      }
  
      // Generate order ID
      const generateOrderId = () => Math.floor(100000 + Math.random() * 900000);
      const orderId = generateOrderId();
  
      // Prepare order items with total prices
      const productsWithQty = products.map(product => {
        const cartItem = cartItems.find(item => item.id === product._id.toString());
        const qty = cartItem ? cartItem.qty : 0;
        return {
          ...product.toObject(),
          qty,
          price: product.sell_price,
          total: qty * product.sell_price
        };
      });
  
      // Save to Sell collection
      const total = Number(req.body.total);
      await new Sell({
        name: user.name,
        products: productsWithQty,
        phone: null,
        status: 'done',
        adress: null,
        bid: orderId,
        Date: moment().format('lll'),
        userId: user.id,
        isCashier: true,
        total
      }).save();
  
      // Clear cart
      user.localstoreCart = [];
      await user.save();
      req.flash('order-suc', 'Order confirmed');
  
      // 🖨️ Receipt Printing
      const device = new USB();
      device.open(error => {
        if (error) {
          console.error('Printer error:', error);
          return;
        }
  
        const printer = new Printer(device, { encoding: 'UTF-8' });
  
        printer
          .align('CT')
          .style('B')
          .text('Abi Store') // Customize this
          .text(`Order #: ${orderId}`)
          .text(moment().locale('ar-kw').format('l'))
          .drawLine()
          .align('LT');
  
        productsWithQty.forEach(p => {
          printer.text(`${p.name} x${p.qty} @ ${p.price.toFixed(2)} = ${p.total.toFixed(2)}`);
        });
  
        printer
          .drawLine()
          .align('RT')
          .text(`Total: ${total.toFixed(2)} IQD`)
          .align('CT')
          .text('Thank you for your purchase!')
          .cut()
          .close();
      });
  
      res.redirect('/localstore/sell');
    } catch (err) {
      console.error('Error confirming order:', err);
      res.redirect('/localstore/sell');
    }
  });

module.exports = router