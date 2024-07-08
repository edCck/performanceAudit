'use client'

import { useState } from 'react';
import Image from "next/image";
import Animation from '../../../public/images/loading.gif'
import style from './generate.module.css';

export default function GenerateReport() {
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [desktopReportUrl, setDesktopReportUrl] = useState(null);
  const [mobileReportUrl, setMobileReportUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);


  // Fonction pour gérer l'envoi du rapport
  const handleSendReport = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Récupération du token dans le local storage
      const token = localStorage.getItem('token');
      // Envoi de la requête HTTP au serveur pour générer le rapport

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;


      const response = await fetch(`${apiUrl}/api/generateReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, url }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Les rapports ont été générés avec succès et l'email a été envoyé !");
        setDesktopReportUrl(data.desktopReportUrl);
        setMobileReportUrl(data.mobileReportUrl);
        setUrl(data.domainName);
      } else {
        setErrorMessage(data.error || "Erreur lors de la génération des rapports.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMessage("Une erreur s'est produite. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPage = () => {
    window.location.href = window.location.href; // Recharge la page actuelle
  };

  return (
    <>
      <section className={style.section}>
        {isLoading ? (
          <div className={style.loader}>
            <Image src={Animation} alt="Chargement en cours" width={150} />
            <p>{`Veuillez patienter pendant l'analyse !`}</p>
          </div>
        ) : successMessage ? (
          <div className={style.success_message}>
            <div>
              <h1 className={style.titre}>Félicitations !</h1>
              <span className={style.line}></span>
            </div>
            <p className={style.paragraphe}>
              {successMessage}
              <br />
              Veuillez trouver ci-dessous les rapports de performance de votre site en version ordinateur et version mobile.
            </p>
            <div className={style.block_reports}>
              <p className={style.url}>{url}</p>
              <div className={style.block_btn}>
                <a href={desktopReportUrl} download target="_blank" className={style.btn}>Version ordinateur</a>
                <a href={mobileReportUrl} download target="_blank" className={style.btn}>Version Mobile</a>
              </div>
            </div>
            <div>
              <button className={style.btn} onClick={refreshPage}>
                Essayer une autre analyse !
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h1 className={style.titre}>Générer votre rapport de performance !</h1>
              <span className={style.line}></span>
            </div>
            <div>
              <p className={style.paragraphe}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. In facilisis aliquam nisi et ultrices.
                Praesent id leo vestibulum, maximus lorem ut, vestibulum sapien. Proin est quam, rutrum quis
                facilisis ut, blandit vitae quam. Vivamus id felis in felis maximus egestas. Nam varius orci
                orci, et viverra lacus convallis a. Curabitur in justo porta, cursus justo nec, rutrum nunc.
                Aliquam mattis felis vel tortor imperdiet pharetra. Etiam metus ex, mollis ac maximus nec, vehicula quis neque.
              </p>
            </div>
            <form className={style.form}>
              <p className={style.titre_form}>Recevoir le rapport</p>
              {errorMessage && <p className={style.error_message}>{errorMessage}</p>}
              <div className={style.block_input}>
                <input
                  className={style.input}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className={style.block_input}>
                <input
                  className={style.input}
                  type="url"
                  placeholder="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className={style.block_btn}>
                <button onClick={handleSendReport} className={style.btn}>Tester votre site</button>
              </div>
            </form>
          </>
        )}
      </section>
    </>
  );
}
