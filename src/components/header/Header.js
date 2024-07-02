'use client'

import style from './header.module.css';
import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
    const [open, setOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté au chargement du composant
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <>
            <header className={style.header}>
                <div>
                    <Image src={logo} alt="Logo de LightHouse" width={150} priority={true} />
                </div>
                <nav className={`${style.navigation} ${open ? style.open : ''}`}>
                    <ul className={style.list}>
                        <Link href="/"><li className={style.nav_item}>Accueil</li></Link>
                        {!isAuthenticated ? (
                            <Link href="/connexion"><li className={style.nav_item}>Connexion</li></Link>
                        ) : (
                            <>
                                <Link href="/history"><li className={style.nav_item}>Historique</li></Link>
                                <li className={style.nav_item} onClick={handleLogout}>Se déconnecter</li>
                            </>
                        )}
                    </ul>
                </nav>
                <div className={`${style.burger} ${open ? style.actif : ''}`} onClick={() => setOpen(!open)}>
                    <span className={style.burger_bar1}></span>
                    <span className={style.burger_bar2}></span>
                    <span className={style.burger_bar3}></span>
                </div>
            </header>
        </>
    );
}
