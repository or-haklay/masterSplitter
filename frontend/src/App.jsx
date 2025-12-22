
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './theme/theme.css'

import Navbar from './components/navbar.jsx'
import Footer from './components/footer.jsx'
import Home from './pages/home'
import { Routes, Route } from 'react-router'
import ExpensesList from './pages/expensesList'
import Login from './pages/login'
import Register from './pages/register'
import Profile from './pages/profile'
import Settings from './pages/settings'
import Logout from './pages/logout'
import ForgotPassword from './pages/forgotPassword'
import ConnectApartment from './pages/connectApartment.jsx'
import Background from './components/background.jsx'

function App() {

  return (
    <>
     <Background />
     <div style={{ position: 'relative', zIndex: 1 }}>
       <Navbar />
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
       </Routes>
       <Footer />
     </div>
     </>
   );
 }
 
 export default App;
