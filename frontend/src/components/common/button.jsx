export default function Button({ type = "button", onClick, text}) {

    return (
        <button type={type} onClick={onClick} className={"my-btn-primary  w-75 p-2 rounded-4 fw-bold text-white fs-5 "}>
            {text}
        </button>
    )
}