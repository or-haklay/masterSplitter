import logo from '../../assets/logo-glow.png'

export default function Footer() {
    return (
        <footer className="bg-dark text-white position-fixed bottom-0 start-0 end-0 w-100 d-none d-md-block" style={{ height: '70px'}}>
            <div className="container-fluid p-0">
                <div className="row p-3 align-items-center">
                    <div className="col-sm-8 fs-6 text-center text-white fw-bold">
                        כל הזכויות שמורות למאסטר ספליטר חובה לפני כל זכויות יוצרים © {new Date().getFullYear()}
                    </div>
 
                    <div className="col-sm-4 text-center p-0">
                        <img src={logo} alt="Master Splitter Expenses Logo" style={{ height: '50px', marginRight: '10px' }} />
                    </div>
                </div>
            </div>
        </footer>
    )
}