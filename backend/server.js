if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const User = require('./model/user')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initialize_passport = require('./passport-config')
const initialize_db = require("./db")
const initialize_routings = require('./routing')

initialize_passport(
    passport,
    email => User.findOne({email: email}),
    id => User.findById(id)
)

initialize_db()

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static(__dirname+ '/../public'))
initialize_routings(app)

app.listen(process.env.PORT)
