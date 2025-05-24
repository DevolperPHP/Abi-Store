const express = require('express');
const app = express();
const session = require('express-session')
const flash = require('express-flash')
const cookieParser = require('cookie-parser')
const methodOverride = require("method-override")
const db = require('./config/database')
const mongoose = require('mongoose')
const passport = require('./routes/passport');
const bodyParser = require('body-parser')
const index = require("./routes/index")
const permissions = require('./routes/permissions')
const items = require('./routes/items')
const colors = require('./routes/colors')
const size = require('./routes/size')
const purchase = require('./routes/purchase')
const sell = require('./routes/sell')
const storage = require('./routes/storage')
const analysis = require('./routes/analysis')
const dailyMoney = require('./routes/dailyMoney')
const shop = require('./routes/shop/index')
const category = require('./routes/category')
const brand = require('./routes/brand')
const fav = require('./routes/shop/fav')
const cart = require('./routes/shop/cart')
const profile = require('./routes/shop/profile')
const passportShop = require('./routes/shop/passport')
const localstoreStorage = require('./routes/localstore/storage')
const localstoreSell = require('./routes/localstore/sell')
const localstoreOrders = require('./routes/localstore/orders')
const localstoreDailyMoney = require('./routes/localstore/dailyMoney')


let PORT = 3000

app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: 'secret',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}))
app.use(flash());
app.use(cookieParser());
app.use(methodOverride("_method"))

app.use('/passport', passport)
app.use("/", index)
app.use('/permissions', permissions)
app.use("/items", items)
app.use("/colors", colors)
app.use("/size", size)
app.use("/purchase", purchase)
app.use("/sell", sell)
app.use("/storage", storage)
app.use("/analysis", analysis)
app.use("/dailymoney", dailyMoney)
app.use('/shop', shop)
app.use('/category', category)
app.use('/brand', brand)
app.use('/shop', fav)
app.use('/shop/cart', cart)
app.use('/shop/profile', profile)
app.use('/shop/passport', passportShop)
app.use('/localstore/storage', localstoreStorage)
app.use('/localstore/sell', localstoreSell)
app.use('/localstore/orders', localstoreOrders)
app.use('/localstore/dailymoney', localstoreDailyMoney)

app.listen(PORT, (err) => {
    if(err) throw err
    console.log(`Server is running on port ${PORT}`);
})