import { Link } from 'react-router-dom'
import logo from '../../assets/logo-glow.png'
import {useState, useEffect} from 'react'

export default function Navbar() {
    const [user, setUser] = useState({name: 'Or Haklay', balance: 1000, owned: 500});

    const handleLogout = () => {
        setUser(null);
    }

    const handleLogin = () => {
        setUser({name: 'Or Haklay', balance: 1000, owned: 500});
    }
    
    return (
        <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">   
          <a className="navbar-brand text-white" href="#">
            <img src={logo} alt="Master Splitter Expenses Logo" style={{ height: '50px', marginRight: '10px' }} />
            Master Splitter Expenses
          </a>  
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon text-white"></span>
          </button>
          <div className="offcanvas offcanvas-end bg-dark" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div className="offcanvas-header bg-dark">
              <h5 className="offcanvas-title text-white" id="offcanvasNavbarLabel">Master Splitter Expenses</h5>
              <button type="button" className="btn-close text-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body bg-dark">
              {user ? <ul className="navbar-nav justify-content-end flex-grow-1 pe-3 text-white">
                <li className="nav-item">
                    <Link className="nav-link active text-white" aria-current="page" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/expenses">Expenses</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" onClick={handleLogout}>Logout</Link>
                </li>
              </ul> : <ul className="navbar-nav justify-content-end flex-grow-1 pe-3 text-white">
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login" onClick={handleLogin}>Login</Link>
                </li>
              </ul>}
            </div>
          </div>
        </div>
      </nav>           
    )
}
