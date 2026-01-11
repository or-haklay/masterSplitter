
import Header from '../components/header'
import PieChartComponent from '../components/pieChart'
import useAuth from "../../context/auth.context.jsx";
import { useState, useEffect } from 'react';
import expensesServices from '../services/expensesServices'
import { toast } from 'react-hot-toast'
import CreateSettlement from '../components/models/createSettlement'
import Button from '../components/common/button'

function Home() {
    const [expenses, setExpenses] = useState([])
    const { user, userData } = useAuth();
    const [owned, setOwned] = useState([])
    const [isOpenCreateSettlementModel, setIsOpenCreateSettlementModel] = useState(false)
    const [data, setData] = useState()

    // get expenses
    useEffect(() => {
        async function getExpenses() {
            const resExpenses = await expensesServices.getApartmentExpenses(userData?.user?.apartmentId)
            if (resExpenses) {
                setExpenses(resExpenses.expenses)
            } else {
                toast.error(resExpenses.message)
            }
        }
        if (userData?.user?.apartmentId) {
            getExpenses()
        }
    }, [userData, user])

    // data for chart
    useEffect(() => {
        let newChartData = []
        for (const expense of expenses ){
            let found = false
            for (const data of newChartData) {
                if (data.label === expense.payerName) {
                    data.y += expense.amount
                    found = true
                    break
                }
            }
            if (!found) {
                newChartData.push({
                    y: expense.amount,
                    label: expense.payerName
                })
            }
        }
        setData(newChartData)
    }, [expenses])

    // get owned
    useEffect(() => {
    async function getOwned() {
        const resOwned = await expensesServices.getMyOwnedUsers()
        if (resOwned) {
            setOwned(resOwned.owned)
            
        } else {
            toast.error(resOwned.error)
        }
    }
    getOwned()
    },[userData, user])

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center h-100 p-0">
            <Header pageName="Home" pageDescription="Welcome to the home page" />
            <div className="container-fluid p-2">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                    <div className="card text-bg-secondary bg-opacity-75 mb-3 flex-grow-1 col-12 col-md-6" style={{ maxWidth: "18rem" }}>
                        <div className="card-header fs-5 fw-bold"> Hi {(userData?.user?.name.split(" ")[0])}!</div>
                        <div className="card-body">
                            <h5 className="card-title fs-6 fw-bold">Own and Owneds:</h5>
                            {owned.map((ownedItem, index) => {
                                // Determine the other user's name and if current user owes or is owed
                                // If current user is owner (owes money), show who they owe to (ownedName)
                                // If current user is owned (is owed money), show who owes them (ownerName)
                                const otherUserName = ownedItem.isOwner ? ownedItem.ownedName : ownedItem.ownerName;
                                const isOwing = ownedItem.isOwner; // If current user is owner, they owe money (red)
                                const isOwed = ownedItem.isOwned; // If current user is owned, they are owed money (green)
                                
                                // Determine display text and color
                                const displayText = isOwing 
                                    ? `חייב ל-${otherUserName}` 
                                    : `${otherUserName} חייב לך`;
                                const colorClass = isOwing ? "text-danger" : "text-success";
                                const sign = isOwing ? "-" : "+";
                                
                                return (
                                    <p className="card-text" key={index}>
                                        {displayText}: <span className={`fw-normal fs-6 fw-bold ${colorClass}`}>
                                            {sign}{ownedItem?.amount}₪
                                        </span>
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                    <div className="dlex-grow-1 col-12 col-md-6">
                        <PieChartComponent data={data} title="Expenses" />
                    </div>
                    <Button onClick={() => setIsOpenCreateSettlementModel(true)} text="Create Settlement" />
                </div>
            </div>
            <CreateSettlement isOpen={isOpenCreateSettlementModel} setIsOpenCreateSettlementModel={setIsOpenCreateSettlementModel} />
        </div>
    );
}

export default Home;