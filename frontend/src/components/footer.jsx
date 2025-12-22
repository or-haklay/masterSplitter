
export default function Footer() {
    return (
        <footer className="my-bg-secondary text-white fixed-bottom d-none d-md-block d-flex align-items-center justify-content-center p-2" >
            <p className="text-center text-white fw-bold fs-6 m-auto">© {new Date().getFullYear()} Master Splitter Expenses</p>
        </footer>
    );
}