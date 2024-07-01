import React, { useState } from 'react';
import Header from "../components/header/Header";
import Footer from "@/components/footer/footer";
import '../app/globals.css';
import style from "./styles/connexion.module.css"

export default function Connexion() {
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

    const handleShowRegistrationForm = () => {
        setShowRegistrationForm(!showRegistrationForm);
    };

    return (
        <>
            <Header />
            <section className={style.section}>
                {showRegistrationForm ? (
                    <form>
                          <h1>Connexion</h1>
            
            
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Mot de passe" />
                        <button type="submit">Se connecter</button>
                    </form>
                ) : (
                    <form>

                      <h1>Inscription</h1>
                     
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Mot de passe" />
                        <input type="password" placeholder="Confirmer le mot de passe" />
                        <button type="submit">{`S'inscrire`}</button>
                    </form>
                )}
                <button onClick={handleShowRegistrationForm}>
                    {showRegistrationForm ?  "Vous n'êtes pas encore inscrit" : "Retour à la connexion"}
                </button>
            </section>
            <Footer />
        </>
    );
}