import { useState, type FormEvent } from "react";
import "./RegistrationStyle.css";


interface RegistrationForm {
    firstName: string;
    lastName: string;
    password: string;
}

export default function Registration() {

    const [form, setForm] = useState<RegistrationForm>({firstName: "", lastName: "", password: ""});
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);

    const  handleSubmit = async (event: FormEvent<HTMLFormElement> ) => {
        event.preventDefault();
        console.log("Registration data :", form);
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:8080/register", 
                {method: "POST", headers: {"content-Type": "application/json"}, body: JSON.stringify(form)}
            );
            if (!response.ok) {
                throw new Error("Registration failed!");
            }

            const result = await response.json();
            setSuccess(true);
            setMessage("Registration successful!");
        } catch(error) {
            setSuccess(false);
            setMessage(error instanceof Error? error.message : "Something went wrong!");
        } finally {
            //Always hide loader after API response.
            setLoading(false);
        }
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target;
        setForm( (previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    return (
       <main>
        <form onSubmit={handleSubmit} className="registration-form">
            {/* <h1>Create Account</h1> */}
            <p className="subtitle">Register to get started</p>
             <div className="name-row">
                <div className="field">
                    <label htmlFor="firstName">First Name</label>
                    <input 
                        name="firstName" 
                        id="firstName" 
                        type="text" 
                        placeholder="Enter your first name" 
                        value={form.firstName}
                        onChange={handleChange}
                        required/>
                </div>
                <div className="field">
                    <label htmlFor="LastName">Last Name</label>
                    <input 
                        name="lastName" 
                        id="lastName" 
                        type="text" 
                        placeholder="Enter your last name" 
                        value={form.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
             </div>
            
            <div className="field">
                <label htmlFor="password">Password</label>
                <input 
                    name="password" 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={form.password}
                    onChange={handleChange}
                    required/>
            </div>

            <button type="submit" disabled={loading}>Register</button>
        </form>

        {/* full screen loader */}
        { loading && <div className="loader-overlay"><div className="loader">Please wait .... Loading</div></div> }

        {!loading && message && <div style={{color: success ? "green" : "red", marginTop: "10px"}}>{message}</div> }

       </main>
    );
}