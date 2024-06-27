'use client'

import Header from "../components/header/Header"
import Footer from "@/components/footer/footer";
import '../app/globals.css'
import { useState } from 'react';

import Animation from '../../public/images/loading.gif'
import style from './styles/generate.module.css'
import Image from "next/image";



export default function GenerateReport() {

  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [desktopReportLink, setDesktopReportLink] = useState(null);
  const [mobileReportLink, setMobileReportLink] = useState(null);



  const handleSendReport = async (e) => {
    e.preventDefault(); 
    setIsLoading(true);
    try {
        const response = await fetch("/api/generateReport", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, url }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setSuccessMessage("Les rapports ont été générés avec succès et l'email a été envoyé !");
            setDesktopReportLink(data.desktopReportPath);
            setMobileReportLink(data.mobileReportPath);
        } else {
            alert("Erreur lors de la génération des rapports.");
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la génération des rapports.");
      } finally {
        setIsLoading(false);
    }
};
return (
  <>
    <Header />
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. In facilisis aliquam nisi et ultrices.
              Praesent id leo vestibulum, maximus lorem ut, vestibulum sapien. Proin est quam, rutrum quis
              facilisis ut, blandit vitae quam. Vivamus id felis in felis maximus egestas. Nam varius orci 
              orci, et viverra lacus convallis a.
          </p>

          <div className={style.block_reports}>
          <a href={desktopReportLink} download>Télécharger le rapport pour Desktop</a>
          <a href={mobileReportLink} download>Télécharger le rapport pour Mobile</a>
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
    <Footer />
  </>
);
}