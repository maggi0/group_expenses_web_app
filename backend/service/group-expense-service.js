const Group_Expense = require("../model/group-expense");

async function findByEmail(email) {
    let user = await Group_Expense.find({
        $expr: {
            $in: [
                email,
                "$users"
            ]
        }
    });
    return user;
}

async function createGroupExpense(name, emails) {
    await Group_Expense.create({
        name: name,
        users: emails
    })
}

async function addUserToGroupExpense(id, email) {
    await Group_Expense.updateOne(
        {_id: id},
        {
            $push: {users: email}
        })
}

async function addTransactionToGroupExpense(id, transaction) {
    await Group_Expense.updateOne(
        {_id: id},
        {
            $push: {transactions: transaction}
        })
}

async function deleteGroupExpense(name) {
    await Group_Expense.deleteOne({"name": name})
}

async function deleteUserFromGroupExpense(id, email) {
    await Group_Expense.updateOne(
        {_id: id},
        {$pull: email}
    );
}

async function deleteTransactionFromGroupExpense(id, transactionName) {
    await Group_Expense.updateOne(
        {_id: id},
        {
            $pull: {
                transactions: {
                    name: transactionName
                }
            }
        })
}

module.exports = {
    findByEmail,
    createGroupExpense,
    addUserToGroupExpense,
    addTransactionToGroupExpense,
    deleteGroupExpense,
    deleteUserFromGroupExpense,
    deleteTransactionFromGroupExpense
}