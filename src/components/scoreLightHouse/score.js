import { useEffect, useState } from 'react';
import style from './score.module.css';

export default function Score() {
    const [scores, setScores] = useState({ performance: 0, accessibility: 0, bestPractices: 0, seo: 0 });


    // Fonction useEffect qui incrémente les valeurs des scores jusqu'à un maximum de 100.
    useEffect(() => {
        // Initialisation d'un intervalle pour mettre à jour les scores de manière continue
        const interval = setInterval(() => {
            setScores(prevScores => ({
                performance: Math.min(prevScores.performance + 1, 100),
                accessibility: prevScores.performance >= 20 ? Math.min(prevScores.accessibility + 1, 100) : prevScores.accessibility,
                bestPractices: prevScores.accessibility >= 30 ? Math.min(prevScores.bestPractices + 1, 100) : prevScores.bestPractices,
                seo: prevScores.bestPractices >= 40 ? Math.min(prevScores.seo + 1, 100) : prevScores.seo
            }));
        }, 10);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className={style.section}>
            <div>
                <div className={style.round}>
                    <span className={style.score}>{scores.performance}</span>
                </div>
                <div>
                    <p className={style.center}>Performance</p>
                </div>
            </div>

            <div>
                <div className={style.round}>
                    <span className={style.score}>{scores.accessibility}</span>
                </div>
                <div>
                    <p className={style.center}>Accessibility</p>
                </div>
            </div>

            <div>
                <div className={style.round}>
                    <span className={style.score}>{scores.bestPractices}</span>
                </div>
                <div>
                    <p className={style.center}>Best Practices</p>
                </div>
            </div>

            <div>
                <div className={style.round}>
                    <span className={style.score}>{scores.seo}</span>
                </div>
                <div>
                    <p className={style.center}>SEO</p>
                </div>
            </div>
        </section>
    );
}