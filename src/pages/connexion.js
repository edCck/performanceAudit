import React, { useState } from 'react';
import Header from "../components/header/Header";
import Footer from "@/components/footer/footer";
import '../app/globals.css';
import style from "./styles/connexion.module.css";
import { useRouter } from 'next/router';

export default function Connexion() {
    const [showRegistrationForm, setShowRegistrationForm] = useState(false); 
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [errorMessage, setErrorMessage] = useState(''); 
    const [successMessage, setSuccessMessage] = useState(''); 

    // Fonction pour basculer entre le formulaire de connexion et le formulaire d'inscription
    const handleShowRegistrationForm = (e) => {
        e.preventDefault();
        setShowRegistrationForm(!showRegistrationForm);
        setErrorMessage('');
        setSuccessMessage('');
    };

    // Fonction pour gérer l'inscription
    const handleRegister = async (e) => {
        e.preventDefault();
        

        // Vérification de la force du mot de passe
        const passwordValidation = isStrongPassword(password);
        if (!passwordValidation.isValid) {
            let errorMessage = 'Le mot de passe doit contenir';
            if (!passwordValidation.lengthCheck) {
                errorMessage += ' au moins 8 caractères,';
            }
            if (!passwordValidation.uppercaseCheck) {
                errorMessage += ' au moins une majuscule,';
            }
            if (!passwordValidation.lowercaseCheck) {
                errorMessage += ' au moins une minuscule,';
            }
            if (!passwordValidation.digitCheck) {
                errorMessage += ' au moins un chiffre,';
            }
            if (!passwordValidation.specialCharCheck) {
                errorMessage += ' au moins un caractère spécial';
            }
            setErrorMessage(errorMessage);
            return;
        }

        // Vérification si les mots de passe correspondent
        if (password !== confirmPassword) {
            setErrorMessage('Les mots de passe ne correspondent pas');
            return;
        }

        // Appel API pour l'inscription
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Utilisateur inscrit avec succès:', data);
                setSuccessMessage('Inscription réussie !');
                // Réinitialisation des champs du formulaire après une inscription réussie
                setEmail('');
                setErrorMessage('');
                setPassword('');
                setConfirmPassword('');
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Erreur lors de l\'inscription.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            setErrorMessage('Une erreur s\'est produite. Veuillez réessayer plus tard.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
  
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Utilisateur connecté avec succès:', data);
                setSuccessMessage('Connexion réussie !');
                localStorage.setItem('token', data.token);
                // Réinitialiser les champs du formulaire
                setEmail('');
                setPassword('');
                setErrorMessage('');
        
                window.location.href = '/history';

            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Erreur lors de la connexion.');
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            setErrorMessage('Une erreur s\'est produite. Veuillez réessayer plus tard.');
        }
    };

    // Fonction pour vérifier la force du mot de passe
    const isStrongPassword = (password_admin) => {
        const lengthCheck = password_admin.length >= 8;
        const lowercaseCheck = /[a-z]/.test(password_admin);
        const uppercaseCheck = /[A-Z]/.test(password_admin);
        const digitCheck = /\d/.test(password_admin);
        const specialCharCheck = /[@$!%*?&]/.test(password_admin);

        return {
            isValid: lengthCheck && lowercaseCheck && uppercaseCheck && digitCheck && specialCharCheck,
            lengthCheck: lengthCheck,
            lowercaseCheck: lowercaseCheck,
            uppercaseCheck: uppercaseCheck,
            digitCheck: digitCheck,
            specialCharCheck: specialCharCheck
        };
    };

    return (
        <>
            <Header />
            <section className={style.section}>
                <div>
                {showRegistrationForm ? ( 
                    <form className={style.form} onSubmit={handleRegister}>
                        <h1 className={style.titre}>Inscription</h1>
                        {errorMessage && <p className={style.error}>{errorMessage}</p>}
                        {successMessage && <p className={style.success}>{successMessage}</p>}
                        <input
                            className={style.input}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className={style.input}
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            className={style.input}
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button className={style.btn} type="submit">{`S'inscrire`}</button>
                        <button className={style.btn2} onClick={handleShowRegistrationForm}>
                            Retour à la connexion
                        </button>
                    </form>
                ) : (
                    <form className={style.form} onSubmit={handleLogin}>
                         {errorMessage && <p className={style.error}>{errorMessage}</p>}
                        <h1 className={style.titre}>Connexion</h1>
                        <input className={style.input}
                         type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          />
                        <input className={style.input}
                         type="password" placeholder="Mot de passe"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         />
                        <button className={style.btn} type="submit">Se connecter</button>
                        <button className={style.btn2} onClick={handleShowRegistrationForm}>
                            {`Vous n'êtes pas encore inscrit`}
                        </button>
                    </form>
                )}
                       </div>
            </section>
            <Footer />
        </>
    );
}
