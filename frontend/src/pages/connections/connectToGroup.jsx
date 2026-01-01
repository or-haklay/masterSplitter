import { useState } from 'react'
import Input from '../../components/common/input';
import Button from '../../components/common/button';
import Header from '../../components/header';
import apartmentServices from '../../services/apartmentServices';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function ConnectGroup() {
    const [groupCode, setGroupCode] = useState('');
    const navigate = useNavigate();
    const handleConnect = async () => {
        if (!groupCode.trim()) {
            toast.error('Please enter a group code');
            return;
        }

        try {
            console.log('groupCode', groupCode);
            const response = await apartmentServices.connectToGroup(groupCode); 
            if (response.status === 200) {
                toast.success('Group connected successfully');
                setGroupCode('');
                navigate('/');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to connect to group';
            toast.error(errorMessage);
        }
    }

    return (
        <div>
            <Header pageName="Connect Group" pageDescription="Connect group page" />
            <div className="d-flex flex-column align-items-center justify-content-center gap-5 my-bg-quaternary pt-5 rounded-4">
                <Input 
                    type="text" 
                    placeholder="Enter group code" 
                    value={groupCode} 
                    onChange={(e) => setGroupCode(e.target.value)} 
                />            
                <Button text="Connect" onClick={handleConnect} />
            </div>
        </div>
    )
}

export default ConnectGroup;