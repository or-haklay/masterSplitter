
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './theme/theme.css'

import { Routes, Route } from 'react-router'
import { Toaster } from 'react-hot-toast'
import useAuth from '../context/auth.context.jsx'
import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react';

import Home from './pages/home'
import ExpensesList from './pages/expensesList'
import Login from './pages/connections/login.jsx'
import Register from './pages/connections/register.jsx'
import Profile from './pages/profile'
import Settings from './pages/settings'
import Logout from './pages/connections/logout.jsx'
import ForgotPassword from './pages/forgotPassword'
import ConnectApartment from './pages/connections/connectApartment.jsx'
import ConnectGroup from './pages/connections/connectToGroup.jsx'
import InvateFriend from './pages/connections/invateFriend.jsx'

import Background from './components/background.jsx'
import Navbar from './components/navbar.jsx'
import Footer from './components/footer.jsx'


function App() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [showNavbar, setShowNavbar] = useState(false);


  useEffect(() => {
    if(!userData) {
      setTimeout(() => {
        setShowNavbar(false);
      }, 5);
    }
    else {
      setTimeout(() => {
        setShowNavbar(true);
      }, 5);
    }
  }, [userData, navigate])

  return (
    <>
     <Background />
     <div style={{ position: 'relative', zIndex: 1 }}>
       {showNavbar ? <Navbar /> : null}
       <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expenses" element={<ExpensesList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/expenses-list" element={<ExpensesList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/connect-apartment" element={<ConnectApartment />} />
        <Route path="/connect-group" element={<ConnectGroup />} />
        <Route path="/invate-friend" element={<InvateFriend />} />
       </Routes>
       <Footer />
     </div>
     <Toaster />
     </>
   );
 }
 
 export default App;
