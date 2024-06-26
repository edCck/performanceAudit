import Header from '@/components/header/Header';
import './globals.css'
import style from '../pages/styles/home.module.css'
import Link from 'next/link';

export default function Home() {
  return (
  <>
      <Header/>
      <section className={style.section}>
           
              <div className={style.block_titre}>
                <h1 className={style.titre}>Lorem Ipsum Dolor Sit Amet</h1>
                <span className={style.line}></span>
              </div>

              <p className={style.paragraphe}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sollicitudin
               porttitor lorem quis tempor. Morbi pharetra orci eu ante ultrices placerat. Nam felis felis,
                lobortis aliquet luctus sed, accumsan id est. Morbi porttitor mauris ligula, sed faucibus erat
                 molestie luctus. Nam aliquam ante ut libero luctus, quis iaculis quam lobortis. Vestibulum ante
                  ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Maecenas fringilla ipsum
                   nec iaculis semper.  ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Maecenas fringilla ipsum
                   nec iaculis semper. lobortis aliquet luctus sed.
              </p>

              <div className={style.block_btn}>
                <Link href='/more_info' className={style.btn}>En savoirs plus</Link>
                <Link href='/generate_report' className={style.btn}>Faites le test</Link>
              </div>
      </section>
  </>
  );
}
