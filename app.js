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

app.listen(PORT, (err) => {
    if(err) throw err
    console.log(`Server is running on port ${PORT}`);
})