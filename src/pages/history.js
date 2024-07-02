import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/footer';
import '../app/globals.css';
import style from './styles/history.module.css'

export default function History() {
    const [userReports, setUserReports] = useState([]);
    const router = useRouter();


    // Vérification du token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirection vers la page de connexion si aucun token n'est présent
            router.push('/connexion');
            return;
        }

        // Fonction asynchrone pour récupérer les rapports de l'utilisateur depuis l'API
        const fetchUserReports = async () => {
            try {
                const response = await fetch('/api/getUserReports', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserReports(data.reports);
                } else {
                    console.error('Erreur lors de la récupération des rapports:', response.statusText);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des rapports:', error);
            }
        };

        fetchUserReports(); // Appeler la fonction pour récupérer les rapports au chargement de la page
    }, [router]);

    return (
        <>
            <Header />
            <section className={style.historySection}>
                <h1>Historique des Rapports</h1>
                <ul className={style.reportList}>
                    {userReports.map((report, index) => (
                        <li key={index} className={style.reportItem}>
                            <h3>{report.siteName}</h3>
                            <p>Date: {new Date(report.createdAt).toLocaleDateString()}</p>
                            {/* Exemple de lien pour télécharger le rapport PDF */}
                            <a href={report.pdfUrlDesktop} target="_blank" rel="noopener noreferrer">Télécharger PDF (Desktop)</a>
                            <a href={report.pdfUrlMobile} target="_blank" rel="noopener noreferrer">Télécharger PDF (Mobile)</a>
                        </li>
                    ))}
                </ul>
            </section>
            <Footer />
        </>
    );
}
