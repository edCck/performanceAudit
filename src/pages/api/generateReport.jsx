import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

function getUserIdFromToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.id;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
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

        // Vérification de L'url
        const urlExists = await checkUrlExists(url);
        if (!urlExists) {
            return res.status(400).json({ error: "L'URL fournie n'est pas valide ou accessible." });
        }

        let userId = null;

        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            userId = getUserIdFromToken(token);
            console.log('User ID from token:', userId);
        }

        const domainName = getDomainName(url);

        if (userId) {
            // Enregistrement du rapport dans la base de données
            await prisma.report.create({
                data: {
                    userId: userId,
                    siteName: domainName,
                }
            });
            console.log('Rapport enregistré dans la base de données.');
        }

        // Envoyer une réponse HTTP 200 OK après avoir traité la requête avec succès
        return res.status(200).json({ message: 'Rapport généré et enregistré avec succès.' });

    } else {
        return res.status(405).json({ error: 'Méthode non autorisée.' });
    }
}
