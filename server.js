if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const User = require('./model/user')
const Group_Expense = require('./model/group-expense')
const Transaction = require('./model/transaction')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => User.findOne({email: email}),
    id => User.findById(id)
)

mongoose.connect(process.env.MONGODB_URI);

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
app.use(express.static(__dirname + '/public'));

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/group-expenses', checkAuthenticated, async (req, res) => {
    res.render('group-expenses.ejs', {
        group_expenses: await Group_Expense.find({
            $expr: {
                $in: [
                    req.user.email,
                    "$users"
                ]
            }
        })
    })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

app.post('/add-group-expense', checkAuthenticated, async (req, res) => {
    const group_expense = await Group_Expense.create({
        name: req.body.name,
        users: [req.user.email]
    })
    res.redirect('/group-expenses')
})

app.post('/add-user', checkAuthenticated, async (req, res) => {
    await Group_Expense.updateOne(
        {_id: req.body.groupExpenseId},
        {
            $push: {users: req.body.email}
        })

    res.redirect('/group-expenses');
})

app.post('/add-transaction', checkAuthenticated, async (req, res) => {
    const peopleArray = req.body.people.split(" ");
    const transaction = await Transaction.create({
        people: peopleArray,
        name: req.body.name,
        cost: req.body.cost,
        lender: req.body.lender
    })

    await Group_Expense.updateOne(
        {_id: req.body.groupExpenseId},
        {
            $push: {transactions: transaction}
        })

    res.redirect('/group-expenses');
})

app.delete('/delete-group-expense', checkAuthenticated, async (req, res) => {
    await Group_Expense.deleteOne({"name": req.body.name});

    res.redirect('/group-expenses');
})

app.delete('/delete-user', checkAuthenticated, async (req, res) => {
    await Group_Expense.updateOne(
        {_id: req.body.groupExpenseId},
        {$pull: {users: req.body.email}}
    );

    res.redirect('/group-expenses');
})

app.delete('/delete-transaction', checkAuthenticated, async (req, res) => {
    await Group_Expense.updateOne(
        {_id: req.body.groupExpenseId},
        {
            $pull: {
                transactions: {
                    name: req.body.name
                }
            }
        })

    res.redirect('/group-expenses');
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(process.env.PORT)
