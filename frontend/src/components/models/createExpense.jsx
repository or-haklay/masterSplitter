
import Input from '../common/input'
import Button from '../common/button'
import useAuth from '../../../context/auth.context'
import { useState, useEffect } from 'react'
import apartmentServices from '../../services/apartmentServices'
import expensesServices from '../../services/expensesServices'
import { toast } from 'react-hot-toast'

export default function CreateExpense({ isOpen, setIsOpenCreateExpenseModel, setExpenseToEdit }) {
    const { userData } = useAuth();
    const [apartment, setApartment] = useState(null);
    const [amount, setAmount] = useState();
    const [title, setTitle] = useState('');

    useEffect(() => {
        const getApartment = async () => {
            const response = await apartmentServices.getMyApartment();
            setApartment(response.data.apartment);
        }
        getApartment();
    },[])
    
    if (!isOpen) return null;

    const handleClose = () => {
        setIsOpenCreateExpenseModel(false);
        setExpenseToEdit(null)
        setAmount(0);
        setTitle('');
    }

    const handleCreateExpense = async () => {
        const newExpense = {
            apartment: apartment._id,
            title: title,
            amount: amount,
            payer: userData.user._id,
            payerName: userData.user.name,
        }
        const response = await expensesServices.createManualExpense(newExpense);
        console.log('response', response);
        if (response.status === 201) {
            toast.success(response.message);
            handleClose();
        } else {
            toast.error(response.error);
        }
    }
    
    return (
        <>
            <div className="bg-black opacity-50 container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}></div>
                <div className="card m-auto p-3 rounded-3 shadow-lg bg-white d-flex flex-column gap-3 position-fixed top-50 start-50 translate-middle col-8">
                    <button type="button" className="btn-close btn-close-black col-1 align-self-end  " onClick={handleClose} > <i className="bi bi-x-lg"></i></button>
                    <div className="d-flex flex-column gap-3">
                        <h1 className="fs-5">Create Expense</h1>
                        <Input type="text" name="title" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <Input type="number" name="amount" placeholder="Enter amount in shekels" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                        <Button onClick={handleCreateExpense} text="Create Expense" />
                    </div>
                </div>
        </>
    )
}