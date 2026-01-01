import { useEffect } from 'react'
import useAuth from '../../../context/auth.context.jsx';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

export default function Logout() {
    const { logOut } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        logOut();
        navigate('/login');
        toast.success('Logged out successfully');
    }, []);
    return null;
}