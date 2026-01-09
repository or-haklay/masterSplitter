const {User} = require('../models/User');
const Expense = require('../models/Expense');
const {Apartment} = require('../models/Apartment');

async function refreshOwned(apartmentId) {
    try{

        //?system validation
        const apartment = await Apartment.findOne({ _id: apartmentId });
        if (!apartment) return res.status(404).json({ error: 'Apartment not found' });

        const users = apartment.members;
        if (!users) return res.status(404).json({ error: 'Users not found' });

        const expenses = await Expense.find({ apartment: apartmentId }).lean();
        if (!expenses) return res.status(404).json({ error: 'Expenses not found' });

        //*process*//
        //calculate apartment overall
        
        let apartmentOverall = 0;
        for (const expense of expenses) {
            if (expense.type !== 'SETTLEMENT') {
                apartmentOverall = apartmentOverall + expense.amount;
            }
        }

        //calculate user balance
        for (const userId of users) {
            let userPaid = 0;

        for (const expense of expenses) {
            const isPayer = expense.payer && String(expense.payer) == String(userId);
            const isRecipient = expense.recipient && String(expense.recipient) == String(userId);

            if (expense.type !== 'SETTLEMENT' && isPayer) {
                userPaid = userPaid + expense.amount;
            }

            if (expense.type === 'SETTLEMENT' && expense.status === 'APPROVED') {
                if (isPayer) {
                    userPaid = userPaid + expense.amount;
                }
                if (isRecipient) {
                    userPaid = userPaid - expense.amount;
                }
            }
        }
        const userBalance = userPaid - (Math.round(apartmentOverall / users.length));            
        await User.findOneAndUpdate({ _id: userId }, { balance: userBalance });
    }
        //split users to 2 groups - positive and negative balance
        const positiveBalanceUsers = [];
        const negativeBalanceUsers = [];
        for (const user of users) {
            const userData = await User.findOne({ _id: user }).lean();
            if (userData.balance >= 0) {
                positiveBalanceUsers.push(userData);
            }
            else {
                negativeBalanceUsers.push(userData);
            }
        }

        //calculate the ownership between positive and negative balance users
        let remainingDebts =negativeBalanceUsers.map(u => ({
            name: u.name,
            _id: u._id,
            remainingDebt: Math.abs(u.balance) 
        }));

        usersOwnership = [];
        for (const positiveUser of positiveBalanceUsers) {
            for (const debtInfo of remainingDebts) {
                while (positiveUser.balance > 0 && debtInfo.remainingDebt > 0) {
                    if (positiveUser.balance >= debtInfo.remainingDebt) {
                        usersOwnership.push({
                            owned: positiveUser._id,
                            ownedName: positiveUser.name,
                            owner: debtInfo._id,
                            ownerName: debtInfo.name,
                            ownedAmount: debtInfo.remainingDebt
                        });
                        positiveUser.balance = positiveUser.balance - debtInfo.remainingDebt;
                        debtInfo.remainingDebt = 0;
                    }else {
                        usersOwnership.push({
                            owned: positiveUser._id,
                            owner: debtInfo._id,
                            ownerName: debtInfo.name,
                            ownedName: positiveUser.name,
                            ownedAmount: positiveUser.balance
                        });
                        debtInfo.remainingDebt = debtInfo.remainingDebt - positiveUser.balance;
                        positiveUser.balance = 0;
                    }
                }
            }                    
            console.log("usersOwnership: ", usersOwnership);
        }

    //calculate the ownership between positive and negative balance users

    //update the users
    for (const userId of users) {
        const owned = [];
        for (const ownership of usersOwnership) {
            if (String(ownership.owned) == String(userId) || String(ownership.owner) == String(userId)) {
                owned.push({
                    owner: ownership.owner,
                    ownerName: ownership.ownerName,
                    owned: ownership.owned,
                    ownedName: ownership.ownedName,
                    amount: ownership.ownedAmount
                });
            }
        }
        await User.findOneAndUpdate({ _id: userId }, { owned: owned });
    }

    return true;
    
    }catch(err){
        console.error(err);
        return false;
    }
    
}

module.exports = { refreshOwned };