const mongoose = require('mongoose')
const Schema = mongoose.Schema

var User = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    }
})

module.exports = mongoose.model('User', User)