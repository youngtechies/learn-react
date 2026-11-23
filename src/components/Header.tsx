import { NavLink } from "react-router-dom";
import "./Header.css"

export default function Header() {
    return(
        <header className="app-header">
            <div className="logo">
                My Application
            </div>
            <nav className="nav-menu">
                <NavLink to="/" end> Home </NavLink>
                <NavLink to="/register"> Register </NavLink>
            </nav>
        </header>
    );
}