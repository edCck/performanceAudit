import lighthouse from "lighthouse";  // Module pour exécuter Lighthouse et générer des rapports de performance
import { launch } from 'chrome-launcher';  // Module pour lancer une instance de Chrome
import nodemailer from "nodemailer";  // Module pour envoyer des emails
import path from 'path';  // Module pour gérer et manipuler les chemins de fichiers
import puppeteer from 'puppeteer';  // Module pour contrôler Chrome/Chromium via des scripts
import fs from 'fs';  // Module pour interagir avec le système de fichiers

// Fonction pour extraire le nom de domaine de l'URL
function getDomainName(url) {
    const domainPattern = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)(?:\/|$)/i;
    const match = url.match(domainPattern);
  
    if (match && match[1]) {
      const domain = match[1].split('.').slice(0, -1).join('.');
      return domain;
    }
  
    return null;
}

// Fonction pour récupéré l'heure actuelle
function getFormattedTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
}

// Fonction asynchrone principale, point d'entrée de l'API
export default async function handler(req, res) {
    // Vérification de la méthode HTTP de la requête
    if (req.method === "POST") {
        const { email, url } = req.body;  // Extraction des paramètres email et url du corps de la requête
        console.log("Données reçues:", { email, url });  // Journalisation des données reçues

        try {  
            // Récupération du nom de domaine 
            const domainName = getDomainName(url);
            console.log(domainName);
            const time = getFormattedTime();
            console.log(time);

            // Créer un répertoire pour les rapports si n'existe pas
            const reportsDir = path.join(process.cwd(), 'public', 'reports');
            if (!fs.existsSync(reportsDir)){
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            // Lancement d'une instance de Chrome en mode headless
            const chrome = await launch({ chromeFlags: ["--headless"] });

            // Fonction pour générer le rapport Lighthouse
            const generateReport = async (url, options, reportType) => {
                // Exécution de Lighthouse
                const runnerResult = await lighthouse(url, options);  

                // Récupération du rapport HTML
                const reportHtml = runnerResult.report;  
                console.log(`Rapport ${reportType} généré avec succès.`);

                // Conversion directe du rapport HTML en PDF avec Puppeteer
                const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                    headless: true,
                    timeout: 0
                });

                // Création d'une nouvelle page
                const page = await browser.newPage();
                // Injection du contenu HTML du rapport dans la page
                await page.setContent(reportHtml, { waitUntil: 'networkidle0' });
                // Destination du fichier PDF une fois enregistré
                const reportPdfPath = path.join(reportsDir, `report-${reportType}-${domainName}-${time}.pdf`);
                // Enregistrement du PDF
                await page.pdf({ path: reportPdfPath, format: 'A4', timeout: 120000 });
                await browser.close();
                console.log(`Rapport PDF ${reportType} généré avec succès à : ${reportPdfPath}`);

                return `/reports/report-${reportType}-${domainName}-${time}.pdf`; // Chemin relatif
            };

            // Options de configuration pour Lighthouse en mode desktop
            const desktopOptions = {
                logLevel: "info",
                output: "html",
                onlyCategories: ["performance"],
                port: chrome.port,
                formFactor: 'desktop',
                screenEmulation: {
                    mobile: false,
                    width: 1350,
                    height: 940,
                    deviceScaleFactor: 1,
                    disabled: false,
                }
            };

            // Options de configuration pour Lighthouse en mode mobile
            const mobileOptions = {
                logLevel: "info",
                output: "html",
                onlyCategories: ["performance"],
                port: chrome.port,
                formFactor: 'mobile',
                screenEmulation: {
                    mobile: true,
                    width: 375,
                    height: 667,
                    deviceScaleFactor: 2,
                    disabled: false,
                }
            };

            // Génération des rapports pour desktop et mobile
            const desktopReportPath = await generateReport(url, desktopOptions, 'desktop');
            const mobileReportPath = await generateReport(url, mobileOptions, 'mobile');

            // Fermeture de l'instance de Chrome
            await chrome.kill();

            // Configuration du transporteur de mail
            const transporter = nodemailer.createTransport({
                service: "hotmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Options de l'email à envoyer
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Rapport Lighthouse",
                html: `<h1>Bonjour</h1>
                       <br>
                       <p>Veuillez trouver les rapports Lighthouse en pièces jointes.</p>
                       <p>Bien cordialement Delecroix Alexis</p>`,
                attachments: [
                    {
                        filename: path.basename(desktopReportPath),
                        path: path.join(process.cwd(), 'public', desktopReportPath)
                    },
                    {
                        filename: path.basename(mobileReportPath),
                        path: path.join(process.cwd(), 'public', mobileReportPath)
                    }
                ]
            };

            // Envoi de l'email avec les rapports en pièce jointe
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Erreur lors de l'envoi de l'email:", error);
                    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
                } else {
                    console.log("Email envoyé:", info.response);
                    res.status(200).json({ 
                        message: "Email envoyé avec succès", 
                        desktopReportPath, 
                        mobileReportPath 
                    });
                }
            });
        } catch (error) {
            // Gestion des erreurs
            console.error("Erreur lors de la génération du rapport ou de l'envoi de l'email:", error);
            res.status(500).json({ error: "Erreur lors de la génération du rapport ou de l'envoi de l'email" });
        }
    } else {
        // Méthode HTTP non autorisée
        res.status(405).json({ error: "Méthode non autorisée" });
    }
}
