import { FaCopyright } from "react-icons/fa";
import style from './footer.module.css'


export default function Footer() {
 

    return (
        <footer className={style.footer}>
            <div>
                <p className={style.copyright}>Copyright Alexis Delecroix <FaCopyright /> 2024</p>
            </div>
        </footer>
    );
}
