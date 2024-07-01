import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient();

export default async function login(req,res) {
    if (req.method === 'POST') {
        // Récupération des données du corps de la requête
        const { email, password } = req.body;

        // Recherche de l'utilisateur dans la base de données par email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Vérification si l'utilisateur existe et si le mot de passe correspond
        if (user && bcrypt.compareSync(password, user.password)) {
            // Génération d'un token JWT
            const token = jwt.sign(
                { id: user.id, email: user.email }, // Payload du token
                process.env.JWT_SECRET, // Clé secrète pour signer le token
                { expiresIn: '1h' } // Expiration du token
            );
            // Réponse avec un statut 200 et le token
            res.status(200).json({ token });
        } else {
            // Réponse avec un statut 401 (Non autorisé) si l'email ou le mot de passe est incorrect
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } else {
        // Si la méthode HTTP n'est pas POST, répondre avec un statut 405 (Méthode non autorisée)
        res.status(405).json({ message: 'Method not allowed' });
    }
}