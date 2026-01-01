import Header from '../components/header'
import expensesServices from '../services/expensesServices'
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast'
import useAuth from '../../context/auth.context.jsx'
import CreateExpense from '../components/models/createExpense'
import EditExpense from '../components/models/editExpense'

export default function ExpensesList() {
    const [expenses, setExpenses] = useState([])
    const { userData } = useAuth();
    const [isOpenCreateExpenseModel, setIsOpenCreateExpenseModel] = useState(false)
    const [isOpenEditExpenseModel, setIsOpenEditExpenseModel] = useState(false)
    const [expenseToEdit, setExpenseToEdit] = useState(null)
    
    const getExpenses = useCallback(async () => {
        try {
            const resExpenses = await expensesServices.getMyApartmentExpenses()
            if (resExpenses) {
                setExpenses(resExpenses.expenses)
            } else {
                toast.error(resExpenses.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to fetch expenses')
        }
    }, [isOpenCreateExpenseModel, isOpenEditExpenseModel])
    
    useEffect(() => {
        if (userData) {
            getExpenses()
        }
    }, [userData, expenseToEdit])
    
    const handleAddExpense = () => {
        setIsOpenCreateExpenseModel(true)
    }

    const handleEditExpense = (expenseId) => {
        console.log('edit expense', expenseId)
        setExpenseToEdit(expenseId)
        setIsOpenEditExpenseModel(true)
    }

    const handleDeleteExpense = async (expenseId) => {
        try{
            const resDelete = await expensesServices.deleteExpense(expenseId)
            if (resDelete) {
                toast.success(resDelete.message)
                await getExpenses()
            }
        } catch (error) {
            toast.error(error.response.data.error)
        }
    }

    return (
        <div className="d-flex flex-column flex-fill pb-5 position-relative mb-5">
            <Header pageName="Expenses List" pageDescription="List of all expenses" />
            <table className="table text-center">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Title</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Payer</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense, index) => (
                    <tr key={index} className="text-center">
                        <th scope="row">{index + 1}</th>
                        <td>{expense.title}</td>
                        <td>{expense.amount}</td>
                        <td>{expense.payerName}</td>
                        <td>
                            {expense.payer === userData.user._id && <div className="dropdown ">
                                <button className="btn btn-secondary dropdown-toggle my-bg-secondary text-white" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li><a className="dropdown-item" href="#" onClick={() => handleEditExpense(expense._id)}>Edit</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={() => handleDeleteExpense(expense._id)}>Delete</a></li>
                                </ul>
                            </div>}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
                <button className="btn btn-success" style={{ position: 'fixed', bottom : '80px', left: '40px', transform: 'translateX(-50%)' }} onClick={() => handleAddExpense()}>
                    <i className="bi bi-plus-circle"></i>
                </button>
                <EditExpense isOpen={isOpenEditExpenseModel} setIsOpenEditExpenseModel={setIsOpenEditExpenseModel} expenseToEdit={expenseToEdit} setExpenseToEdit={setExpenseToEdit}/>
            <CreateExpense isOpen={isOpenCreateExpenseModel} setIsOpenCreateExpenseModel={setIsOpenCreateExpenseModel} expenses={expenses} setExpenses={setExpenses}/>
        </div>
    )
}