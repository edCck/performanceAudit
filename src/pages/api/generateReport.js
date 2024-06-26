// Import des modules nécessaires
import lighthouse from "lighthouse";
import { launch } from 'chrome-launcher';
import nodemailer from "nodemailer";
import path from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs';
import fetch from 'node-fetch';

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

// Fonction pour vérifier si l'URL existe
const checkUrlExists = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error("Erreur lors de la vérification de l'URL:", error);
        return false;
    }
};

// Fonction pour récupérer l'heure actuelle
function getFormattedTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
}

// Fonction asynchrone principale, point d'entrée de l'API
export default async function handler(req, res) {
    if (req.method === "POST") {
        const { email, url } = req.body;
        console.log("Données reçues:", { email, url });

        const urlExists = await checkUrlExists(url);
        if (!urlExists) {
            return res.status(400).json({ error: "L'URL fournie n'est pas valide ou accessible." });
        }

        try {
            const domainName = getDomainName(url);
            console.log(domainName);
            const time = getFormattedTime();
            console.log(time);

            const reportsDir = path.join(process.cwd(), 'public', 'reports');
            if (!fs.existsSync(reportsDir)){
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            const chrome = await launch({ chromeFlags: ["--headless"] });

            const generateReport = async (url, options, reportType) => {
                const runnerResult = await lighthouse(url, options);

                const reportHtml = runnerResult.report;
                console.log(`Rapport ${reportType} généré avec succès.`);

                const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                    headless: true,
                    timeout: 0
                });

                const page = await browser.newPage();
                await page.setContent(reportHtml, { waitUntil: 'networkidle0' });
                const reportPdfPath = path.join(reportsDir, `report-${reportType}-${domainName}-${time}.pdf`);
                await page.pdf({ path: reportPdfPath, format: 'A4', timeout: 120000 });
                await browser.close();
                console.log(`Rapport PDF ${reportType} généré avec succès à : ${reportPdfPath}`);

                return `/reports/report-${reportType}-${domainName}-${time}.pdf`;
            };

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

            const desktopReportPath = await generateReport(url, desktopOptions, 'desktop');
            const mobileReportPath = await generateReport(url, mobileOptions, 'mobile');

            await chrome.kill();

            const transporter = nodemailer.createTransport({
                service: "hotmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

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

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Erreur lors de l'envoi de l'email:", error);
                    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
                } else {
                    console.log("Email envoyé:", info.response);
                    res.status(200).json({ 
                        message: "Email envoyé avec succès", 
                        desktopReportPath, 
                        mobileReportPath,
                        domainName
                    });
                }
            });
        } catch (error) {
            console.error("Erreur lors de la génération du rapport ou de l'envoi de l'email:", error);
            res.status(500).json({ error: "Erreur lors de la génération du rapport ou de l'envoi de l'email" });
        }
    } else {
         // Si la méthode HTTP n'est pas POST, répondre avec un statut 405 (Méthode non autorisée)
        res.status(405).json({ error: "Méthode non autorisée" });
    }
}