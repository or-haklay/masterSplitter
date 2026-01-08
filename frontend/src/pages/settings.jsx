import Header from '../components/header'
import {useNavigate} from 'react-router';
import Button from '../components/common/button';
import useAuth from '../../context/auth.context';

export default function Settings() {
    const navigate = useNavigate();
    const { userData } = useAuth();
    
    return (
        <div className="d-flex p-2 m-2 rounded-4 my-bg-quaternary flex-column align-items-center justify-content-center gap-2">
            <Header pageName="Settings" pageDescription="Settings page" />
            <Button text="Logout" onClick={() => navigate('/logout')} />
            {!userData?.user?.apartmentId && <Button text="Connect to Group" onClick={() => navigate('/connect-group')} />}
            {userData?.user?.apartmentId && <Button text="Invite Friend" onClick={() => navigate('/invate-friend')} />}
            {!userData?.user?.apartmentId && <Button text="Connect Apartment" onClick={() => navigate('/connect-apartment')} />}
        </div>
    )
}