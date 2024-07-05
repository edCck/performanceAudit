'use client'


import Score from '@/components/scoreLightHouse/score';
import style from './styles/home.module.css'
import Link from 'next/link';


export default function Home() {

  return (
    <>
      <section className={style.section}>
        <div>
          <h1 className={style.titre}>Optimisez votre Site Web</h1>
          <span className={style.line}></span>
        </div>

        <p className={style.paragraphe}>
          {`Notre outil permet`}
          <span className={style.key}> {`d'analyser la performance de votre site web`}  </span>
          {`selon divers critères essentiels tels que la vitesse de chargement, l'optimisation mobile,
             et l'accessibilité pour tous les utilisateurs. Utilisant la `}
          <span className={style.key}>puissance de Lighthouse</span>
          {`, notre outil évalue ces aspects clés pour vous fournir des `}
          <span className={style.key}>rapports précieux</span>
          {` sur la qualité et l'efficacité de votre site. Cela vous permet de comprendre rapidement les domaines où des
              améliorations sont nécessaires et de mettre en œuvre des stratégies pour améliorer l'expérience utilisateur. 
                Commencez dès maintenant en utilisant notre outil en cliquant sur le bouton ci-dessous et découvrez comment
                  optimiser votre site pour atteindre ses objectifs!`}
        </p>


        <div className={style.block_btn}>
          <Link href='/more_info' className={style.btn}>En savoirs plus</Link>
          <Link href='/generate_report' className={style.btn}>Faites le test</Link>
        </div>
        <Score />
      </section>
    </>
  );
}
