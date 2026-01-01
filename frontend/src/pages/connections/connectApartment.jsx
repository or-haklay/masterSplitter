// connectApartment.jsx
import { useState, useEffect } from 'react'
import whatsappServices from '../../services/whatsappServices'
import {QRCodeSVG} from 'qrcode.react';
import Header from '../../components/header';
// או ישירות:
import httpServices from '../../services/httpServices';

function ConnectApartment() {
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState('DISCONNECTED');
    const [apartmentId, setApartmentId] = useState(null);
    const [error, setError] = useState(null);
    
    // התחל תהליך חיבור מיד (בלי לחכות ל-apartmentId)
    useEffect(() => {
        const initiateConnection = async () => {
            try {
                // קרא ל-connectApartment בלי apartmentId - השרת יצור דירה חדשה אם צריך
                const response = await whatsappServices.connectApartment();
                // השרת מחזיר את ה-apartmentId בתגובה
                if (response.apartmentId) {
                    setApartmentId(response.apartmentId);
                }
                setStatus('INITIALIZING');
            } catch (error) {
                setError(error.response?.data?.error || error.message || 'Failed to start connection');
            }
        };
        
        initiateConnection();
    }, []); // רוץ רק פעם אחת כשהקומפוננטה נטענת
    
    useEffect(() => {
        // 2. Polling ל-QR code (רק אחרי שיש apartmentId)
        if (status === 'INITIALIZING' && apartmentId) {
            const qrInterval = setInterval(async () => {
                try {
                    const response = await whatsappServices.getQRCode(apartmentId);
                    if (response.qrCode) {
                        setQrCode(response.qrCode);
                        setStatus('QR_READY');
                        clearInterval(qrInterval);
                    }
                } catch (error) {
                    // QR עדיין לא מוכן או כבר מחובר
                    if (error.response?.status === 409) {
                        setStatus('CONNECTED');
                        clearInterval(qrInterval);
                    }
                }
            }, 2000); // כל 2 שניות
            
            return () => clearInterval(qrInterval);
        }
    }, [status, apartmentId]);
    
    useEffect(() => {
        // 3. Polling לסטטוס חיבור (רק אם QR_READY - כלומר סרוקו את הקוד)
        if (status === 'QR_READY' && apartmentId) {
            const statusInterval = setInterval(async () => {
                try {
                    const response = await whatsappServices.getStatus(apartmentId);
                    if (response.status === 'CONNECTED') {
                        setStatus('CONNECTED');
                        setQrCode(null);
                        clearInterval(statusInterval);
                    } else if (response.status === 'DISCONNECTED') {
                        // אם חזר ל-DISCONNECTED, נפסיק את הבדיקה
                        clearInterval(statusInterval);
                    }
                } catch (error) {
                    // רק שגיאות אמיתיות - לא 404 שזה מצב תקין
                    if (error.response?.status !== 404) {
                        console.error('Status check failed:', error);
                    }
                }
            }, 3000); // כל 3 שניות
            
            return () => clearInterval(statusInterval);
        }
    }, [status, apartmentId]);
    
    if (error) {
        console.error(error);
        
        return (
            <div>
                <Header pageName="Connect Apartment" pageDescription="Connect Apartment To Whatsapp Group" />
                <h1>שגיאה</h1>
                <p>{error}</p>
            </div>
        );
    }
    
    return (
        <div>
            <Header pageName="Connect Apartment" pageDescription="Connect Apartment To Whatsapp Group" />
            {status === 'INITIALIZING' && <p className='text-center'>Starting connection process...</p>}
            {status === 'QR_READY' && qrCode && (
                <div className='d-flex flex-column p-3 justify-content-center align-items-center'>
                    <p className='text-center'>Scan the QR code with WhatsApp:</p>
                    <div className='p-3 border rounded-3 shadow-sm bg-white'>
                    <QRCodeSVG value={qrCode} size={256} />
                    </div>
                </div>
            )}
            {status === 'CONNECTED' && (
                <div className='d-flex flex-column p-3 m-3 justify-content-center align-items-center gap-2 bg-white rounded-3 shadow-sm'>
                <p className='text-center'>✅ Connected successfully!</p>
                <p className='text-center'>To Finish the connection, end On the WhatsApp group and send the command </p>
                <p className='text-center'>!connect_group 2506</p>
                </div>
            )}
            {status === 'DISCONNECTED' && <p className='text-center'>Not connected</p>}
        </div>
    )
}

export default ConnectApartment;