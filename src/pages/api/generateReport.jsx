import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

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

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        // Vérification de l'URL
        const urlExists = await checkUrlExists(url);
        if (!urlExists) {
            return res.status(400).json({ error: "L'URL fournie n'est pas valide ou accessible." });
        }

        let userId = null;

        // Vérification de la présence du token
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            userId = getUserIdFromToken(token);
            console.log('User ID from token:', userId);

            if (!userId) {
                console.log('Token invalide ou expiré, utilisateur invité.');
            } else {

            }
        }

        const domainName = getDomainName(url);

        // Enregistrement du rapport dans la base de données
        if (userId) {
            await prisma.report.create({
                data: {
                    userId: userId,
                    siteName: domainName,
                }
            });
            console.log('Rapport enregistré dans la base de données.');
        } else {
            console.log('Utilisateur invité, rapport non enregistré dans la base de données.');
        }

        // Envoyer une réponse HTTP 200 OK après avoir traité la requête avec succès
        return res.status(200).json({
            message: 'Rapport généré avec succès.',
            domainName
        });

    } else {
        return res.status(405).json({ error: 'Méthode non autorisée.' });
    }
}
