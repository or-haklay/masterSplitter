
import logo from '../assets/logo-glow.png'
import Header from '../components/header'
import PieChartComponent from '../components/pieChart'
import useAuth from "../../context/auth.context.jsx";
import { useState, useEffect } from 'react';

function Home() {
    const { userData } = useAuth();
    const [owned, setOwned] = useState({
        yuval: 100,
        mika: -200,
    })

    const data = [
        { y: 400, label: "or" },
        { y: 300, label: "yuval" },
        { y: 500, label: "mika" }	
        ];

    useEffect(() => {
        async function getOwned() {
        let newOwned = {};
        const userName = (userData?.user?.name?.split(" ")[0]);
        console.log("userName: ", userName);
        data.forEach((item) => {
            if (item.label.toLowerCase() !== userName.toLowerCase() ) {
                newOwned[item.label] = item.y;
            } 
        });
        setOwned((prev) => ({ ...prev, ...newOwned }));
    }
    getOwned();
    }, []);
    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center h-100 p-0">
            <Header pageName="Home" pageDescription="Welcome to the home page" />
            <div className="container-fluid p-2">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                    <div className="card text-bg-secondary bg-opacity-75 mb-3 flex-grow-1 col-12 col-md-6" style={{ maxWidth: "18rem" }}>
                        <div className="card-header fs-5 fw-bold"> Hi {(userData?.user?.name.split(" ")[0])}!</div>
                        <div className="card-body">
                            <h5 className="card-title fs-6 fw-bold">Own and Owneds:</h5>
                            {Object.keys(owned).map((key) => (
                                <p className="card-text" key={key}>{key}: <span className={`fw-normal fs-6 fw-bold ${owned[key] > 0 ? "text-success" : "text-danger"}`}>{owned[key]}₪</span></p>
                            ))}
                        </div>
                    </div>
                    <div className="dlex-grow-1 col-12 col-md-6">
                        <PieChartComponent data={data} title="Expenses" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;