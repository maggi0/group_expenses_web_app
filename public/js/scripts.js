function showForm(formId) {
    document.getElementById(formId).style.display = 'block';
}
function hideForm(formId) {
    document.getElementById(formId).style.display = 'none';
}

function addInfo(text, element, parentElement) {
    let info = document.createElement(element);
    info.innerHTML = text;
    document.getElementById(parentElement).append(info);
}

function addTransactionInfoButton(text, parentElement) {
    let info = document.createElement("button");
    info.onclick = function() {
        console.log(text);
        let elements = document.getElementsByClassName(text);
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].style.display === 'none') {
                elements[i].style.display = '';
            }
            else {
                elements[i].style.display = 'none';
            }
        }
    };
    info.className = "trans-button";
    info.innerHTML = text;
    document.getElementById(parentElement).append(info);
}

function addTransactionInfo(text, element, button, parentElement) {
    let info = document.createElement(element);
    info.className = button;
    info.innerHTML = text;
    info.style.display = 'none';
    info.style.backgroundColor = '#BDF4F8';
    document.getElementById(parentElement).append(info);
}

window.showGroupExpense = function showGroupExpense(group_expense) {
    addInfo("Users", "h2", "group-expense-users");
    addInfo("Transactions", "h2", "group-expense-transactions");
    addInfo("Transfers", "h2", "group-expense-transfers");
    group_expense = JSON.parse(decodeURIComponent(group_expense));
    updateForm(group_expense._id, "addUser");
    updateForm(group_expense._id, "addTransaction");
    updateForm(group_expense._id, "deleteUser");
    updateForm(group_expense._id, "deleteTransaction");
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("group-expense-menu").style.display = "";
    for (let i = 0; i < group_expense.users.length; i++) {
        addInfo(group_expense.users[i], "p", "group-expense-users");
    }
    if(group_expense.transactions.length === 0) {
        addInfo("No transactions", "p", "group-expense-transactions");
    }
    else {
        group_expense.transactions.forEach(function (transaction) {
            addTransactionInfoButton(transaction.name, "group-expense-transactions");
            addTransactionInfo("people: " + transaction.people, "p", transaction.name, "group-expense-transactions");
            addTransactionInfo("cost: " + transaction.cost, "p", transaction.name, "group-expense-transactions");
            addTransactionInfo("lender: " + transaction.lender, "p", transaction.name, "group-expense-transactions");
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
                if(balances.has(person)) {
                    balances.set(person, balances.get(person) + cost - costPerPerson);
                }
                else {
                    balances.set(person, cost - costPerPerson);
                }
            }
            else {
                if(balances.has(person)) {
                    balances.set(person, balances.get(person) - costPerPerson)
                }
                else {
                    balances.set(person, -costPerPerson);
                }
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

        transfers.push(firstBorrowerKey + " " + firstLenderKey + " " + Math.round(amount * 100) / 100);

        sortedBorrowers.set(firstBorrowerKey, firstBorrowerValue + amount);
        sortedLenders.set(firstLenderKey, firstLenderValue - amount);

        if(sortedBorrowers.values().next().value === 0.0) {
            sortedBorrowers.delete(firstBorrowerKey);
        }
        else {
            sortedLenders.delete(firstLenderKey);
        }
    }

    transfers.forEach(function (transfer) {
        let arr = transfer.split(" ");
        addInfo(arr[0] + " should pay " + arr[2] + "$ to " + arr[1], "p", "group-expense-transfers");
    })
}