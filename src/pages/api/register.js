import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function register(req, res) {
    if (req.method === 'POST') {
        // Récupération des données du corps de la requête
        const { email, password } = req.body;
        
        // Génération du sel et hachage du mot de passe
        const salt = bcrypt.genSaltSync(10); // Génère un sel avec un facteur de coût de 10
        const hashedPassword = bcrypt.hashSync(password, salt); // Hache le mot de passe avec le sel généré

        try {
            // Création d'un nouvel utilisateur dans la base de données
            const newUser = await prisma.user.create({
                data: {
                    email, // Adresse email de l'utilisateur
                    password: hashedPassword // Mot de passe haché
                },
            });
            // Réponse avec un statut 201 et les données de l'utilisateur créé
            res.status(201).json(newUser);
        } catch (error) {
            // En cas d'erreur, répondre avec un statut 500 et le message d'erreur
            res.status(500).json({ message: "User creation failed", error: error.message });
        }
    } 
    else {
        // Si la méthode HTTP n'est pas POST, répondre avec un statut 405 (Méthode non autorisée)
        res.status(405).json({ message: 'Method not allowed' });
    }
}
