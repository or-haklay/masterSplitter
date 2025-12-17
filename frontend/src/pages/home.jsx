import { useState } from 'react'
import logo from '../assets/logo-glow.png'

export default function Home() {
    const [user, setUser] = useState({ name: "Or Haklay", balance: 1000, owned: 500 })
    return (
        <div className="container-fluid p-0">
                    <div className="row text-bg-dark align-items-center">
                        <img src={logo} alt="Master Splitter Expenses Logo" className="col-4" style={{ height: '100%', objectFit: 'contain' }} />
                        <div className="col-8 justify-content-evenly text-center ">
                            <h2 className="text-white">Hello {user.name}</h2>
                            <h6 className="text-danger">You own {user.balance}₪</h6>
                            <h6 className="text-success">You owned {user.owned}₪</h6>
                        </div>
            </div>
        </div>
    );
}