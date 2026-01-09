
import Input from '../common/input'
import Button from '../common/button'
import useAuth from '../../../context/auth.context'
import { useState, useEffect } from 'react'
import apartmentServices from '../../services/apartmentServices'
import expensesServices from '../../services/expensesServices'
import { toast } from 'react-hot-toast'

export default function CreateSettlement({ isOpen, setIsOpenCreateSettlementModel, setSettlementToEdit }) {
    const { userData } = useAuth();
    const [apartment, setApartment] = useState(null);
    const [ownedUsers, setOwnedUsers] = useState([]);
    const [recipient, setRecipient] = useState(null);
    const [amount, setAmount] = useState();

    useEffect(() => {
        const getApartment = async () => {
            const response = await apartmentServices.getMyApartment();
            setApartment(response.data.apartment);
            const getOwnedUsers = async () => {
                const response = await expensesServices.getMyOwnedUsers();
                setOwnedUsers(response.data.users);
            }
            getOwnedUsers();
        }
        getApartment();
    },[])
    
    if (!isOpen) return null;

    const handleClose = () => {
        setIsOpenCreateSettlementModel(false);
        setSettlementToEdit(null)
        setAmount(0);
        setRecipient(null);
    }

    const handleCreateSettlement = async () => {
        const newSettlement = {
            apartment: apartment._id,
            recipient: recipient,
            amount: amount,
        }
        const response = await expensesServices.createSettlement(newSettlement);
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
                        <h1 className="fs-5">Create Settlement</h1>
                        <Input type="text" name="recipient" placeholder="Enter recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                        <Input type="number" name="amount" placeholder="Enter amount in shekels" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                        <Button onClick={handleCreateSettlement} text="Create Settlement" />
                    </div>
                </div>
        </>
    )
}