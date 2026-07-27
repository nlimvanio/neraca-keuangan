import LoginForm from "./LoginForm";

export default function Login(){
    return(
        <main className="login-page">
            <div className="login-card">
                <h1>Login</h1>
                <LoginForm/>
            </div>
        </main>
    )
}