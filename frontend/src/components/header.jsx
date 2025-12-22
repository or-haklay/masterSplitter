

export default function Header({pageName, pageDescription}) {
    return (
        <>
        <div className="mb-5 d-md-none d-block"></div>
        <div className="container-fluid fixed-top my-bg-secondary text-white p-0 d-md-none d-block">
            <h1 className="text-center">{pageName}</h1>
            {/* <p className="text-center">{pageDescription}</p> */}
        </div>
        <div className=" d-none d-md-block pt-5">
            <h1 className="text-center">{pageName}</h1>
            <p className="text-center">{pageDescription}</p>
        </div>
        </>
    )
}