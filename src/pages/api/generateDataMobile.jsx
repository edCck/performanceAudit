import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

export default async function handler(req,res) {
    if (req.method === "POST") {
        const { url } = req.body;

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
      
            const mobileScores = await generateScores(url, mobileOptions);
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