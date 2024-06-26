'use client'

import style from './header.module.css';
import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import Link from 'next/link';
import { useState } from 'react';


export default function Header() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <header className={style.header}>
                <div>
                    <Image src={logo} alt="Logo de LightHouse" width={150} priority={true} />
                </div>

                <nav className={`${style.navigation} ${open ? style.open : ''}`}>
                    <ul className={style.list}>
                        <Link href="/"><li className={style.nav_item}>Accueil</li></Link>
                        <Link href="/connexion"><li className={style.nav_item}>Connexion</li></Link>
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
