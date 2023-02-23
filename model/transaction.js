const mongoose = require('mongoose')
const Schema = mongoose.Schema

var Transaction = new Schema({
    people: {
        type: [String],
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    lender: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Transaction', Transaction)