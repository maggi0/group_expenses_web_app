const mongoose = require('mongoose');

function initialize_db() {
    mongoose.connect(process.env.MONGODB_URI);
}

module.exports = initialize_db;