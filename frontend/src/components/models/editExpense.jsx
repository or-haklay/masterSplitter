
import Input from '../common/input'
import Button from '../common/button'
import useAuth from '../../../context/auth.context'
import { useState, useEffect } from 'react'
import expensesServices from '../../services/expensesServices'
import { toast } from 'react-hot-toast'

export default function EditExpense({ isOpen, setIsOpenEditExpenseModel, setExpenseToEdit, expenseToEdit }) {    
    const [amount, setAmount] = useState(expenseToEdit?.amount || 0);
    const [title, setTitle] = useState(expenseToEdit?.title || '');

    useEffect(() => {
        const getExpense = async () => {
            if (!expenseToEdit) return;
            const response = await expensesServices.getExpense(expenseToEdit);
            setAmount(response.expense.amount);
            setTitle(response.expense.title);
        }
        getExpense();
    },[expenseToEdit, isOpen])
    
    if (!isOpen) return null;

    const handleClose = () => {
        setIsOpenEditExpenseModel(false);
        setAmount(0);
        setTitle('');
        setExpenseToEdit(null)
    }

    const handleEditExpense = async () => {
        try {
        const newExpense = {
            _id: expenseToEdit,
            title: title,
            amount: amount,
        }
        const response = await expensesServices.updateExpense(newExpense);
        console.log('response', response);
            toast.success(response.message);
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update expense');
        }
    }
    
    return (
        <>
            <div className="bg-black opacity-50" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}></div>
                <div className="card m-auto p-3 rounded-3 shadow-lg bg-white d-flex flex-column gap-3 position-fixed top-50 start-50 translate-middle col-8">
                    <button type="button" className="btn-close btn-close-black col-1 align-self-end  " onClick={handleClose} > <i className="bi bi-x-lg"></i></button>
                    <div className="d-flex flex-column gap-3  justify-content-center">
                        <h1 className="fs-5">Edit Expense</h1>
                        <Input type="text" name="title" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <Input type="number" name="amount" placeholder="Enter amount in shekels" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                        <Button onClick={handleEditExpense} text="Edit Expense" />
                    </div>
                </div>
        </>
    )
}