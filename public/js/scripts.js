function showForm(formId) {
    document.getElementById(formId).style.display = 'block';
}
function hideForm(formId) {
    document.getElementById(formId).style.display = 'none';
}

function addInfo(text) {
    let info = document.createElement("p");
    info.innerHTML = text;
    document.getElementById("group-expense-info").append(info);
}

window.showGroupExpense = function showGroupExpense(group_expense) {
    group_expense = JSON.parse(decodeURIComponent(group_expense));
    updateForm(group_expense._id, "addUser");
    updateForm(group_expense._id, "addTransaction");
    updateForm(group_expense._id, "deleteUser");
    updateForm(group_expense._id, "deleteTransaction");
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("group-expense-menu").style.display = "";
    addInfo("Name: " + group_expense.name);
    addInfo("Users in this group expense: " + JSON.stringify(group_expense.users));
    if(group_expense.transactions.length === 0) {
        addInfo("No transactions");
    }
    else {
        addInfo("===== Transactions =====");
        group_expense.transactions.forEach(function (transaction) {
            addInfo("name: " + transaction.name);
            addInfo("people: " + transaction.people);
            addInfo("cost: " + transaction.cost);
            addInfo("lender: " + transaction.lender);
        })
    }
    calculateOptimalTransfers(calculateBalances(group_expense));
}

function updateForm(groupExpenseId, form) {
    let formToUpdate = document.getElementById(form);
    let input = document.createElement("input");

    input.setAttribute("type", "hidden");
    input.setAttribute("name", "groupExpenseId");
    input.setAttribute("value", groupExpenseId);

    formToUpdate.appendChild(input);
}

function calculateBalances(group_expense) {
    let balances = new Map();

    group_expense.transactions.forEach(function (transaction) {
        const cost = parseFloat(transaction.cost);
        const costPerPerson = cost / transaction.people.length;
        transaction.people.forEach(function (person) {
            if(person === transaction.lender) {
                balances.set(person, cost - costPerPerson);
            }
            else {
                balances.set(person, -costPerPerson);
            }
        })
    })

    return balances;
}

function calculateOptimalTransfers(balances) {
    let borrowers = new Map();
    let lenders = new Map();

    for (const [person, balance] of balances.entries()) {
        if(balance >= 0) {
            lenders.set(person, balance);
        } else {
            borrowers.set(person, balance);
        }
    }
    var sortedBorrowers = borrowers.size > 1 ? new Map([...borrowers.entries()].sort((a, b) => b[1] - a[1])) : borrowers;
    var sortedLenders = lenders.size > 1 ? new Map([...lenders.entries()].sort((a, b) => b[1] - a[1])) : lenders;

    let transfers = [];

    while (sortedBorrowers.size !== 0 && sortedLenders.size !== 0) {
        let firstBorrowerKey = sortedBorrowers.keys().next().value;
        let firstBorrowerValue = sortedBorrowers.values().next().value;
        let firstLenderKey = sortedLenders.keys().next().value;
        let firstLenderValue = sortedLenders.values().next().value;

        let amount = Math.min(Math.abs(firstBorrowerValue), Math.abs(firstLenderValue));

        transfers.push(firstBorrowerKey + " " + firstLenderKey + " " + amount);

        sortedBorrowers.set(firstBorrowerKey, firstBorrowerValue + amount);
        sortedLenders.set(firstLenderKey, firstLenderValue - amount);

        if(sortedBorrowers.values().next().value === 0.0) {
            sortedBorrowers.delete(firstBorrowerKey);
        }
        else {
            sortedLenders.delete(firstLenderKey);
        }
    }

    addInfo("===== Transfers =====");
    transfers.forEach(function (transfer) {
        let arr = transfer.split(" ");
        addInfo(arr[0] + " should pay " + arr[2] + "$ to " + arr[1]);
    })
}