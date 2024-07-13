const User = require("../model/user");

async function createUser(name, email, password) {
    await User.create({
        name: name,
        email: email,
        password: password
    })
}

module.exports = {
    createUser
}