'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import style from './history.module.css'

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
            <section className={style.section}>
                <div>
                <h1 className={style.titre}>Historique de vos rapports LightHouse</h1>
                <span className={style.line}></span>
                </div>
              

                <div className={style.container_report}>
                    {userReports.map((report, index) => (
                        <div key={index} className={style.block_report}>
                            <div className={style.report}>
                            <p>{report.siteName}</p>
                            <p>Date: {new Date(report.createdAt).toLocaleDateString()}</p>
                            <a href={report.pdfUrlDesktop} target="_blank" rel="noopener noreferrer">Télécharger PDF (Desktop)</a>
                            <a href={report.pdfUrlMobile} target="_blank" rel="noopener noreferrer">Télécharger PDF (Mobile)</a>
                            </div>
                        </div>
                    ))}
                </div>
            
            </section>
        </>
    );
}
