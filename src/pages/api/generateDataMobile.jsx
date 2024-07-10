import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';


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

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { url, } = req.body;

    let userId = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      userId = getUserIdFromToken(token);
      console.log('User ID from token:', userId);
    }

    const generateScores = async (url, options) => {
      const runnerResult = await lighthouse(url, options);

      const performance = runnerResult.lhr.categories.performance.score * 100;
      const seo = runnerResult.lhr.categories.seo.score * 100;
      const bestpractices = runnerResult.lhr.categories['best-practices'].score * 100;
      const accessibility = runnerResult.lhr.categories.accessibility.score * 100;

      return { performance, seo, bestpractices, accessibility };
    };

    let chrome = null;
    try {
      chrome = await launch({ chromeFlags: ["--headless"] });

      const mobileOptions = {
        logLevel: "info",
        output: "html",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        port: chrome.port,
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 2,
          disabled: false,
        }
      };

      // Récupérer uniquement l'ID du dernier rapport créé
      const lastReport = await prisma.report.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });

      if (!lastReport) {
        throw new Error('Aucun rapport trouvé.');
      }

      console.log('Dernier rapport ID:', lastReport.id);

      const mobileScores = await generateScores(url, mobileOptions);

      if (userId) {
        await prisma.mobilePerformanceScore.create({
          data: {
            reportId: lastReport.id, // Utilisez l'ID du dernier rapport
            performance: desktopScores.performance,
            seo: desktopScores.seo,
            accessibility: desktopScores.accessibility,
            bestPractices: desktopScores.bestPractices
          },
        });
      }
      res.status(200).json(mobileScores);
    } catch (error) {
      console.error("Erreur lors de l'analyse Lighthouse pour mobile :", error);
      res.status(500).json({ error: "Erreur lors de la génération des données de performance mobile." });
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  } else {
    res.status(405).json({ error: "Méthode non autorisée." });
  }
}