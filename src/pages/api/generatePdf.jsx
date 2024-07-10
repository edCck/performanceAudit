import lighthouse from "lighthouse";
import { launch } from 'chrome-launcher';
import nodemailer from "nodemailer";
import path from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Fonction pour récupérer l'heure actuelle
function getFormattedTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
}

// Fonction pour récupérer l'ID utilisateur à partir du token
function getUserIdFromToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.error('Erreur lors de la vérification du token:', error.message);
        } else {
            console.error('Erreur inattendue lors de la vérification du token:', error.message);
        }
        return null;
    }
}

function getDomainName(url) {
    const domainPattern = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)(?:\/|$)/i;
    const match = url.match(domainPattern);

    if (match && match[1]) {
        const domain = match[1].split('.').slice(0, -1).join('.');
        return domain;
    }
    return null;
}

export default async function handler(req, res) {

    if (req.method === "POST") {
        const { email, url } = req.body;
        console.log("Données reçues:", { email, url });

        let userId = null;

        // Vérification de la présence du token
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            userId = getUserIdFromToken(token);
            console.log('User ID from token:', userId);

            if (!userId) {
                console.log('Token invalide ou expiré, utilisateur invité.');
            }
        }

        try {
            const domainName = getDomainName(url);
            const time = getFormattedTime();
            console.log(time);

            // Définir le chemin du répertoire des rapports
            const reportsDir = userId
                // Si userId est défini, inclure un sous-répertoire spécifique à l'utilisateur
                ? path.join(process.cwd(), 'public', 'reports', `user_${userId}`)
                // Sinon, utiliser le répertoire général des rapports
                : path.join(process.cwd(), 'public', 'reports');

            // Vérifier si le répertoire des rapports n'existe pas
            if (!fs.existsSync(reportsDir)) {
                // Créer le répertoire des rapports, y compris tous les sous-répertoires nécessaires
                fs.mkdirSync(reportsDir, { recursive: true });
            }


            // Lancer une instance chrome
            const chrome = await launch({ chromeFlags: ["--headless"] });

            // Fonction pour générer un rapport Lighthouse
            const generateReport = async (url, options, reportType) => {
                // Exécuter Lighthouse pour l'URL donnée avec les options spécifiées
                const runnerResult = await lighthouse(url, options);

                // Récupérer le rapport HTML de Lighthouse
                const reportHtml = runnerResult.report;
                console.log(`Rapport ${reportType} généré avec succès.`);

                const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                    headless: true,
                    timeout: 0
                });

                // Ouvrir une nouvelle page avec Puppeteer
                const page = await browser.newPage();
                // Définir le contenu de la page avec le rapport HTML de Lighthouse
                await page.setContent(reportHtml, { waitUntil: 'networkidle0' });
                // Définir le chemin pour sauvegarder le rapport PDF
                const reportPdfPath = path.join(reportsDir, `report-${reportType}-${domainName}-${time}.pdf`);
                // Générer le PDF du rapport et le sauvegarder
                await page.pdf({ path: reportPdfPath, format: 'A4', timeout: 120000 });
                // Fermer le navigateur Puppeteer
                await browser.close();
                console.log(`Rapport PDF ${reportType} généré avec succès à : ${reportPdfPath}`);

                return reportPdfPath;
            };

            const desktopOptions = {
                logLevel: "info",
                output: "html",
                onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
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
                onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
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

            // Générer les rapports pour le bureau et le mobile
            const desktopReportPath = await generateReport(url, desktopOptions, 'desktop');
            const mobileReportPath = await generateReport(url, mobileOptions, 'mobile');

            console.log(desktopReportPath);
            console.log(mobileReportPath);

            // Définir les URL pour accéder aux rapports
            let desktopReportUrl = `/reports/${path.basename(desktopReportPath)}`;
            let mobileReportUrl = `/reports/${path.basename(mobileReportPath)}`;

            // Ajuster les URL si l'utilisateur est identifié
            if (userId) {
                desktopReportUrl = `/reports/user_${userId}/${path.basename(desktopReportPath)}`;
                mobileReportUrl = `/reports/user_${userId}/${path.basename(mobileReportPath)}`;
            }

            await chrome.kill();


            if (userId) {
                // Récupérer uniquement l'ID du dernier rapport créé
                const lastReport = await prisma.report.findFirst({
                    orderBy: { createdAt: 'desc' },
                    select: { id: true }
                });
                if (!lastReport) {
                    throw new Error('Aucun rapport trouvé.');
                }
                // Enregistrement du rapport dans la base de données
                const pdfRecord = await prisma.pdf.create({
                    data: {
                        reportId: lastReport.id,
                        pdfUrlMobile: mobileReportUrl,
                        pdfUrlDesktop: desktopReportUrl
                    }
                });

                console.log('Rapport enregistré dans la base de données:', pdfRecord);
            }

            const transporter = nodemailer.createTransport({
                service: "hotmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Vérification de l'existence des fichiers avant de les attacher à l'email
            const attachments = [];

            if (fs.existsSync(desktopReportPath)) {
                attachments.push({
                    filename: path.basename(desktopReportPath),
                    path: desktopReportPath
                });
            } else {
                console.error(`Fichier non trouvé: ${desktopReportPath}`);
            }

            if (fs.existsSync(mobileReportPath)) {
                attachments.push({
                    filename: path.basename(mobileReportPath),
                    path: mobileReportPath
                });
            } else {
                console.error(`Fichier non trouvé: ${mobileReportPath}`);
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Rapport Lighthouse",
                html: `<h1>Bonjour</h1>
                       <br>
                       <p>Veuillez trouver les rapports Lighthouse en pièces jointes.</p>
                       <p>Bien cordialement Delecroix Alexis</p>`,
                attachments: attachments
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Erreur lors de l'envoi de l'email:", error);
                    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
                } else {
                    console.log("Email envoyé:", info.response);
                    res.status(200).json({
                        message: "Email envoyé avec succès",
                        desktopReportUrl,
                        mobileReportUrl,
                    });
                }
            });
        } catch (error) {
            console.error("Erreur lors de la génération du rapport ou de l'envoi de l'email:", error);
            res.status(500).json({ error: "Erreur lors de la génération du rapport ou de l'envoi de l'email" });
        }
    } else {
        res.status(405).json({ error: `Méthode ${req.method} non autorisée.` });
    }
}