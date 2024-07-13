const passport = require("passport");
const bcrypt = require("bcrypt");
const {checkAuthenticated, checkNotAuthenticated} = require("./auth-check");
const {findByEmail, createGroupExpense, addUserToGroupExpense, addTransactionToGroupExpense, deleteGroupExpense,
    deleteUserFromGroupExpense, deleteTransactionFromGroupExpense
} = require("./service/group-expense-service");
const {createUser} = require("./service/user-service");
const {createTransaction} = require("./service/transaction-service");


function initialize_routings(app) {
    app.get('/', checkAuthenticated, (req, res) => {
        res.render('index.ejs', {name: req.user.name})
    })

    app.get('/group-expenses', checkAuthenticated, async (req, res) => {
        res.render('group-expenses.ejs', {
            group_expenses: await findByEmail(req.user.email)
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
            await createUser(req.body.name, req.body.email, hashedPassword)
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
        await createGroupExpense(req.body.name, [req.user.email])
        res.redirect('/group-expenses')
    })

    app.post('/add-user', checkAuthenticated, async (req, res) => {
        await addUserToGroupExpense(req.body.groupExpenseId, req.body.email);

        res.redirect('/group-expenses');
    })

    app.post('/add-transaction', checkAuthenticated, async (req, res) => {
        const peopleArray = req.body.people.split(" ");
        const transaction = await createTransaction(peopleArray, req.body.name, req.body.cost, req.body.lender)

        await addTransactionToGroupExpense(req.body.groupExpenseId, transaction)

        res.redirect('/group-expenses')
    })

    app.delete('/delete-group-expense', checkAuthenticated, async (req, res) => {
        await deleteGroupExpense(req.body.name)

        res.redirect('/group-expenses');
    })

    app.delete('/delete-user', checkAuthenticated, async (req, res) => {
        await deleteUserFromGroupExpense(req.body.groupExpenseId, req.body.email)

        res.redirect('/group-expenses');
    })

    app.delete('/delete-transaction', checkAuthenticated, async (req, res) => {
        await deleteTransactionFromGroupExpense(req.body.groupExpenseId, req.body.name)

        res.redirect('/group-expenses');
    })
}

module.exports = initialize_routings