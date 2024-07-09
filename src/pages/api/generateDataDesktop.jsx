import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { url } = req.body;

    const generateScores = async (url, options) => {
      const runnerResult = await lighthouse(url, options);

      const performance = runnerResult.lhr.categories.performance.score * 100;
      const seo = runnerResult.lhr.categories.seo.score * 100;
      const bestpractices = runnerResult.lhr.categories['best-practices'].score * 100;
      const accessibility = runnerResult.lhr.categories.accessibility.score * 100;

      return { performance, seo, bestpractices, accessibility};
    };

    let chrome = null;
    try {
      chrome = await launch({ chromeFlags: ["--headless"] });

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

      const desktopScores = await generateScores(url, desktopOptions);
      res.status(200).json(desktopScores);

    } catch (error) {
      console.error("Erreur lors de l'analyse Lighthouse:", error);
      res.status(500).json({ error: "Erreur lors de la génération des données de performance desktop." });
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  } else {
    res.status(405).json({ error: "Méthode non autorisée." });
  }
}
