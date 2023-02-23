const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Transaction = require('./transaction').schema

var Group_Expense = new Schema({
    users: {
        type: [String]
    },
    name: {
        type: String,
        unique: true
    },
    transactions: {
        type: [Transaction],
        default: null
    }
})

module.exports = mongoose.model('Group_Expense', Group_Expense)