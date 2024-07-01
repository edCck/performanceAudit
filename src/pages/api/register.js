import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction pour vérifier la force du mot de passe
function isStrongPassword(password_admin) {
    const lengthCheck = password_admin.length >= 8;
    const lowercaseCheck = /[a-z]/.test(password_admin);
    const uppercaseCheck = /[A-Z]/.test(password_admin);
    const digitCheck = /\d/.test(password_admin);
    const specialCharCheck = /[@$!%*?&]/.test(password_admin);

    return {
        isValid: lengthCheck && lowercaseCheck && uppercaseCheck && digitCheck && specialCharCheck,
        lengthCheck: lengthCheck,
        lowercaseCheck: lowercaseCheck,
        uppercaseCheck: uppercaseCheck,
        digitCheck: digitCheck,
        specialCharCheck: specialCharCheck
    };
}

export default async function register(req, res) {
    if (req.method === 'POST') {
        // Récupération des données du corps de la requête
        const { email, password } = req.body;

          // Vérification de la force du mot de passe
          const passwordValidation = isStrongPassword(password);
          if (!passwordValidation.isValid) {
              let errorMessage = 'Le mot de passe doit contenir';
  
              if (!passwordValidation.lengthCheck) {
                  errorMessage += ' au moins 8 caractères,';
              }
  
              if (!passwordValidation.uppercaseCheck) {
                  errorMessage += ' au moins une majuscule,';
              }
  
              if (!passwordValidation.lowercaseCheck) {
                  errorMessage += ' au moins une minuscule,';
              }
  
              if (!passwordValidation.digitCheck) {
                  errorMessage += ' au moins un chiffre,';
              }
  
              if (!passwordValidation.specialCharCheck) {
                  errorMessage += ' au moins un caractère spécial';
              }
  
              res.status(400).json({
                  message: errorMessage
              });
  
              return;
          }

          try {
            // Vérification si l'email existe déjà dans la base de données
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: email
                }
            });

            if (existingUser) {
                return res.status(409).json({ message: 'Cette adresse e-mail est déjà utilisée' });
            }

            // Génération du sel et hachage du mot de passe
            const salt = bcrypt.genSaltSync(10); // Génère un sel avec un facteur de coût de 10
            const hashedPassword = bcrypt.hashSync(password, salt); // Hache le mot de passe avec le sel généré

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
    } else {
        // Si la méthode HTTP n'est pas POST, répondre avec un statut 405 (Méthode non autorisée)
        res.status(405).json({ message: 'Method not allowed' });
    }
}