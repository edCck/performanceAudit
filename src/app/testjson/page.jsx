export default async function handler(req, res) {
    if (req.method === "GET") {
        const message = { message: "Ceci est un exemple de message JSON." };
        res.status(200).json(message);
    } else {
        res.status(405).json({ error: `Méthode ${req.method} non autorisée.` });
    }
}