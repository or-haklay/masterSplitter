import Header from '../components/header'
export default function ExpensesList() {
    return (
        <div>
            <Header pageName="Expenses List" pageDescription="List of all expenses" />
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Title</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Payer</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">2</th>
                        <td>Title</td>
                        <td>Amount</td>
                        <td>Payer</td>
                        <td>Actions</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}