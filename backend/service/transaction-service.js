const Transaction = require("../model/transaction");

async function createTransaction(people, name, cost, lender) {
    let transaction = await Transaction.create({
        people: people,
        name: name,
        cost: cost,
        lender: lender
    });
    return transaction;
}

module.exports = {
    createTransaction
}