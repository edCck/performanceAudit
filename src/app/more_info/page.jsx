
import style from './more_info.module.css'

export default function more_info() {
    return (
        <>
            <section className={style.section}>
                <div>
                    <div>
                        <h1 className={style.titre}>Les Principaux Critères de Performance</h1>
                        <span className={style.line}></span>
                    </div>
                    <p className={style.paragraphe}>{`Découvrez les principaux éléments à prendre en compte pour évaluer la performance d'une application web. Ces critères vous aideront à améliorer l'expérience utilisateur et à optimiser vos systèmes.`}</p>
                </div>

                <div>
                    <div className={style.container_paragraphe}>
                        <div>
                            <h2>1. Performance</h2>
                        </div>
                        <div>
                            <p>{`Un temps de chargement rapide réduit le taux de rebond et améliore la satisfaction des utilisateurs.`}</p>
                            <p>{`Optimiser les ressources, comme les images et les scripts, contribue à une meilleure performance.`}</p>
                            <p>{`L'utilisation de techniques de mise en cache permet de réduire le temps de réponse du serveur.`}</p>
                            <p>{`Surveiller et améliorer les performances au fil du temps est essentiel pour maintenir une application compétitive.`}</p>
                        </div>
                    </div>
                    <div className={style.container_paragraphe}>
                        <div>
                            <h2>2. Accessibilité</h2>
                        </div>
                        <div>
                            <p>{`Assurer une navigation clavier et des lecteurs d'écran fonctionnels est essentiel.`}</p>
                            <p>{`Utiliser des contrastes de couleurs adéquats pour les utilisateurs ayant des déficiences visuelles.`}</p>
                            <p>{`Fournir des descriptions alternatives pour les images et autres médias visuels.`}</p>
                            <p>{`Adopter des pratiques de développement inclusives dès le début du projet.`}</p>
                        </div>
                    </div>
                    <div className={style.container_paragraphe}>
                        <div>
                            <h2>3. SEO</h2>
                        </div>
                        <div>
                            <p>{`Utiliser des balises HTML appropriées pour structurer le contenu de manière claire.`}</p>
                            <p>{`Optimiser les temps de chargement des pages pour améliorer le classement dans les résultats de recherche.`}</p>
                            <p>{`Inclure des mots-clés pertinents dans les titres, descriptions et contenus.`}</p>
                            <p>{`Maintenir un contenu de haute qualité et régulièrement mis à jour pour attirer et fidéliser les visiteurs.`}</p>
                        </div>
                    </div>
                    <div className={style.container_paragraphe}>
                        <div>
                            <h2>4. Meilleures Pratiques</h2>
                        </div>

                        <div>
                            <p>{`Suivre des conventions de codage claires et cohérentes.`}</p>
                            <p>{`Effectuer des revues de code régulières pour assurer la qualité et la sécurité.`}</p>
                            <p>{`Utiliser des outils d'intégration continue pour automatiser les tests et les déploiements.`}</p>
                            <p>{`Documenter le code et les processus pour faciliter la collaboration et la maintenance.`}</p>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}
