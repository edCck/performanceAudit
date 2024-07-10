import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function getUserReports(req, res) {
    if (req.method === 'GET') {
        try {
            // Récupérer le token d'authentification depuis le header
            const token = req.headers.authorization.split(' ')[1];
            
            // Décoder le token pour obtenir l'ID de l'utilisateur
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

              // Récupérer les rapports de l'utilisateur spécifié avec les PDF associés
              const userReports = await prisma.report.findMany({
                where: {
                    userId: userId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    pdf: true // Inclure les relations Pdf associées à chaque rapport
                }
            });

            res.status(200).json({ reports: userReports });
        } catch (error) {
            console.error('Erreur lors de la récupération des rapports de l\'utilisateur:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des rapports de l\'utilisateur' });
        }
    } else {
        res.status(405).json({ error: 'Méthode non autorisée' });
    }
}
