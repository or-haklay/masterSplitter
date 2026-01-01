import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import useAuth from '../../context/auth.context.jsx'
import { useEffect } from 'react';

export default function Navbar() {
    const navigate = useNavigate();
    const { userData } = useAuth();

    useEffect(() => {
    }, [userData]);

    if(!userData) {
        return null;
    }

    return (
        <>
        <div className="container-fluid mb-5"></div>
        <div className=" fixed-bottom navbar-expand-lg my-bg-secondary d-md-none">
        <ul className="nav justify-content-around fs-3 p-2 text-white">
            <li className="nav-item">
                <a className="nav-link bg-white rounded-4 fw-bold" onClick={() => navigate('/')}><i className="bi bi-house my-text-primary-dark"></i></a>
            </li>
            <li className="nav-item">
                <a className="nav-link bg-white rounded-4 fw-bold" onClick={() => navigate('/expenses-list')}><i className="bi bi-list-check my-text-primary-dark"></i></a>
            </li>
            <li className="nav-item">
                <a className="nav-link bg-white rounded-4 fw-bold" onClick={() => navigate('/settings')} aria-label="Settings"><i className="bi bi-gear-wide-connected my-text-primary-dark"></i></a>
            </li>
        </ul>
        </div>
          <div className="navbar fixed-top navbar-expand-lg my-bg-secondary d-none d-md-block">
            <nav className="navbar bg-body-primary">
                <div className="container-fluid">
                    <a className="navbar-brand text-white" onClick={() => navigate('/')}><img src={logo} alt="Logo" width="30" height="30" className="d-inline-block align-text-top"/> Master Splitter Expenses</a>
                </div>
            </nav>
        </div>
        </>
    )
}
