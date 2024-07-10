'use client'
import { useState } from 'react';
import Image from "next/image";
import Animation from '../../../public/images/loading.gif';
import style from './generate.module.css';

export default function GenerateReport() {
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [desktopScores, setDesktopScores] = useState(null);
  const [mobileScores, setMobileScores] = useState(null);
  const [desktopReportUrl, setDesktopReportUrl] = useState(null);
  const [mobileReportUrl, setMobileReportUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSendReport = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Etape 1: Appel à l'API pour récupérer les données desktop en format JSON
      setIsLoading("desktop");
      const desktopResponse = await fetch(`${apiUrl}/api/generateDataDesktop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url }),
      });
      const desktopData = await desktopResponse.json();

      if (desktopResponse.ok) {
        setDesktopScores({
          performance: desktopData.performance,
          seo: desktopData.seo,
          bestpractices: desktopData.bestpractices,
          accessibility: desktopData.accessibility,
        });
      } else {
        throw new Error(desktopData.error || "Erreur lors de la récupération des scores desktop.");
      }

      // Etape 2: Appel à l'API pour récupérer les données mobile en format JSON
      setIsLoading("mobile");
      const mobileResponse = await fetch(`${apiUrl}/api/generateDataMobile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url }),
      });
      const mobileData = await mobileResponse.json();

      if (mobileResponse.ok) {
        setMobileScores({
          performance: mobileData.performance,
          seo: mobileData.seo,
          bestpractices: mobileData.bestpractices,
          accessibility: mobileData.accessibility,
        });
      } else {
        throw new Error(mobileData.error || "Erreur lors de la récupération des scores mobile.");
      }

      // Etape 3: Appel à l'API pour générer les PDF
      setIsLoading("pdf");
      const generatePdfResponse = await fetch(`${apiUrl}/api/generateReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, url }),
      });

      if (generatePdfResponse.ok) {
        // Si la réponse est OK, convertir la réponse JSON en objet JavaScript
        const pdfData = await generatePdfResponse.json();
        setSuccessMessage("Les rapports ont été générés avec succès et l'email a été envoyé !");
        setDesktopReportUrl(pdfData.desktopReportUrl);
        setMobileReportUrl(pdfData.mobileReportUrl);
      } else {
        const pdfData = await generatePdfResponse.json();
        throw new Error(pdfData.error || "Erreur lors de la génération des rapports PDF.");
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

  const getBorderColorClass = (score) => {
    if (score >= 0 && score < 50) {
      return style.red;
    } else if (score >= 50 && score < 80) {
      return style.orange;
    } else if (score >= 80 && score <= 100) {
      return style.green;
    } else {
      return ''; // au cas où le score est en dehors des limites attendues
    }
  }

  return (
    <>
      <section className={style.section}>
        {/* Affiche le loader pendant le chargement des données desktop */}
        {isLoading && isLoading === "desktop" && (
          <div className={style.loader}>
            <Image src={Animation} alt="Chargement en cours" width={150} />
            <p>{`Veuillez patienter pendant la récupération des scores desktop !`}</p>
          </div>
        )}
        {/* Affiche le loader pendant le chargement des données mobile */}
        {isLoading && isLoading === "mobile" && (
          <div className={style.loader}>
            <Image src={Animation} alt="Chargement en cours" width={150} />
            <p>{`Veuillez patienter pendant la récupération des scores mobile !`}</p>
          </div>
        )}
        {/* Affiche le loader pendant la génération des PDF */}
        {isLoading && isLoading === "pdf" && (
          <div className={style.loader}>
            <Image src={Animation} alt="Chargement en cours" width={150} />
            <p>{`Veuillez patienter pendant la génération des rapports PDF !`}</p>
          </div>
        )}

        <section className={style.container}>
          {/* Affiche les scores de performance pour la version ordinateur si disponibles */}
          {desktopScores && (
            <>
              <div className={style.title_container}>
                <h1 className={style.titre}>Félicitation !</h1>
                <span className={style.line}></span>
              </div>
              <div className={style.score_container}>
                <h2>Scores de performance - Version ordinateur</h2>
                <div className={style.score}>
                  <div className={style.item}>
                    <div className={`${style.round} ${getBorderColorClass(desktopScores.performance)}`}>
                      <p>{desktopScores.performance}</p>
                    </div>
                    <p>Performance</p>
                  </div>
                  <div className={style.item}>
                    <div className={`${style.round} ${getBorderColorClass(desktopScores.seo)}`}>
                      <p>{desktopScores.seo}</p>
                    </div>
                    <p>SEO</p>
                  </div>
                  <div className={style.item}>
                    <div className={`${style.round} ${getBorderColorClass(desktopScores.bestpractices)}`}>
                      <p>{desktopScores.bestpractices}</p>
                    </div>
                    <p>Best Practices</p>
                  </div>
                  <div className={style.item}>
                    <div className={`${style.round} ${getBorderColorClass(desktopScores.accessibility)}`}>
                      <p>{desktopScores.accessibility}</p>
                    </div>
                    <p>Accessibility</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Affiche les scores de performance pour la version mobile si disponibles */}
          {mobileScores && (
            <div className={style.score_container}>
              <h2>Scores de performance - Version mobile</h2>
              <div className={style.score}>
                <div className={style.item}>
                  <div className={`${style.round} ${getBorderColorClass(mobileScores.performance)}`}>
                    <p>{mobileScores.performance}</p>
                  </div>
                  <p>Performance</p>
                </div>
                <div className={style.item}>
                  <div className={`${style.round} ${getBorderColorClass(mobileScores.seo)}`}>
                    <p>{mobileScores.seo}</p>
                  </div>
                  <p>SEO</p>
                </div>
                <div className={style.item}>
                  <div className={`${style.round} ${getBorderColorClass(mobileScores.bestpractices)}`}>
                    <p>{mobileScores.bestpractices}</p>
                  </div>
                  <p>Best Practices</p>
                </div>
                <div className={style.item}>
                  <div className={`${style.round} ${getBorderColorClass(mobileScores.accessibility)}`}>
                    <p>{mobileScores.accessibility}</p>
                  </div>
                  <p>Accessibilité</p>
                </div>
              </div>
            </div>
          )}
        </section>


        {/* Affiche le message de succès avec les liens vers les rapports PDF */}
        {successMessage && (
          <div className={style.success_message}>
            <div>
              <p className={style.paragraphe}>
                {successMessage}
                <br />
                Veuillez trouver ci-dessous les rapports de performance de votre site en version ordinateur et version mobile.
              </p>
            </div>
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
        )}

        {/* Affiche le formulaire pour entrer l'email et l'URL du site si aucune opération n'est en cours */}
        {!isLoading && !successMessage && (
          <>
            <section>
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
              <form className={style.form} onSubmit={handleSendReport}>
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
                  <button type="submit" className={style.btn}>Tester votre site</button>
                </div>
              </form>
            </section>
          </>
        )}
      </section>
    </>
  );
}
