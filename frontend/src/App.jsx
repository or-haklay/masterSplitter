
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'


import Navbar from './components/navbar/navbar'
import Footer from './components/footer/footer'
import Home from './pages/home'
import { Routes, Route } from 'react-router'
import ExpensesList from './pages/expensesList'
import Login from './pages/login'

function App() {

  return (
    <>
     <Navbar />
     <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/expenses" element={<ExpensesList />} />
      <Route path="/login" element={<Login />} />
     </Routes>
     <Footer />
     </>
   );
 }
 
 export default App;
