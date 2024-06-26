'use client'

import Header from "../components/header/Header"
import '../app/globals.css'
import { useState } from 'react';



export default function GenerateReport() {

  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");


  const handleSendReport = async () => {
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
            alert("Les rapports ont été générés avec succès et l'email a été envoyé !");
        } else {
            alert("Erreur lors de la génération des rapports.");
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la génération des rapports.");
    }
};
    return (
      <>
      <Header/>
       <section>
          {/* <div>
            <h1>Générer votre rapport de performance ! </h1>
            <span></span>
          </div>

          <div>
            <p>

            </p>
          </div> */}
          <form>
                <p>Recevoir le rapport</p>

                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="url"
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />

                <button onClick={handleSendReport}>Envoyer</button>
          </form>
      </section>
      </>
    
         
      
        
    )
}