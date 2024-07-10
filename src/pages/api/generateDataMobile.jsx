import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

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

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { url } = req.body;

    let userId = null;
    let lastReport = null;
    let chrome = null;

    // Vérification de la présence du token
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      userId = getUserIdFromToken(token);
      console.log("User ID from token:", userId);

      if (!userId) {
        console.log("Token invalide ou expiré, utilisateur invité.");
      }
    }

    const generateScores = async (url, options) => {
      const runnerResult = await lighthouse(url, options);

      const performance = runnerResult.lhr.categories.performance.score * 100;
      const seo = runnerResult.lhr.categories.seo.score * 100;
      const bestPractices =
        runnerResult.lhr.categories["best-practices"].score * 100;
      const accessibility =
        runnerResult.lhr.categories.accessibility.score * 100;

      return { performance, seo, bestPractices, accessibility };
    };

    try {
      chrome = await launch({ chromeFlags: ["--headless"] });

      const mobileOptions = {
        logLevel: "info",
        output: "html",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
        port: chrome.port,
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 2,
          disabled: false,
        },
      };

      if (userId) {
        // Récupérer uniquement l'ID du dernier rapport créé
        lastReport = await prisma.report.findFirst({
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });

        if (!lastReport) {
          throw new Error("Aucun rapport trouvé.");
        }
        console.log("Dernier rapport ID:", lastReport.id);
      }

      const mobileScores = await generateScores(url, mobileOptions);

      if (userId) {
        await prisma.mobilePerformanceScore.create({
          data: {
            reportId: lastReport.id,
            performance: mobileScores.performance,
            seo: mobileScores.seo,
            accessibility: mobileScores.accessibility,
            bestpractices: mobileScores.bestPractices,
          },
        });
      }
      res.status(200).json(mobileScores);
    } catch (error) {
      console.error("Erreur lors de l'analyse Lighthouse pour mobile :", error);
      res
        .status(500)
        .json({
          error:
            "Erreur lors de la génération des données de performance mobile.",
        });
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  } else {
    res.status(405).json({ error: "Méthode non autorisée." });
  }
}
