import { useState , useEffect} from 'react'
import Header from '../../components/header'
import Timer from '../../components/common/timer'
import apartmentServices from '../../services/apartmentServices'

export default function InvateFriend() {
    const [invateCode , setInvateCode] = useState("654651")
    const [refresh , setRefresh] = useState(0)

    const handleRefresh = (newTime) => {
        setRefresh(newTime);
    }

    useEffect( () => {
        const fetchInvateCode = async () => {
            const response = await apartmentServices.getInviteCode()
            if (response.status === 200) {
                setInvateCode(response.data.inviteCode)
            }
        }
        fetchInvateCode()
    }, [refresh])


    return (
        <>
            <Header pageName="Invate Friend" pageDescription="Invate Friend page" />
            <div className="d-flex flex-column align-items-center justify-content-center gap-2 my-bg-quaternary pt-5 rounded-4">
                <Timer minutes={5} seconds={0} handleRefresh={handleRefresh} />
                <p>Share the following link with your friend:</p>
                <h1 style={{fontSize: "50px"}}>{invateCode}</h1>
            </div>
        </>
    )
}