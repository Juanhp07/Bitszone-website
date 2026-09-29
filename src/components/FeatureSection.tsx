import React from 'react';
import { Scroll3DGallery } from './ui/Scroll3DGallery';

const albums = [
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/500x500bb.jpg",
    alt: "Michael Jackson - Thriller",
    title: "Thriller",
    artist: "Michael Jackson",
    color: "#eab308"
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ac/f9/f2/acf9f236-eae7-023a-120d-6c071797512d/cover.jpg/500x500bb.jpg",
    alt: "Adolescent's Orquesta - Ahora Más Que Nunca",
    title: "Ahora Más Que Nunca",
    artist: "Adolescent's Orquesta",
    color: "#ca8a04"
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/1f/14/af/1f14af69-7164-3ea6-65dc-ccd79ee5c340/18CRGIM08038.rgb.jpg/500x500bb.jpg",
    alt: "Ismael Rivera - Esto Fue Lo Que Trajo El Barco",
    title: "Esto Fue Lo Que Trajo El Barco",
    artist: "Ismael Rivera",
    color: "#d97706"
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a4/61/13/a461132e-73b6-10f9-5267-a64e53a01004/195079913662.jpg/500x500bb.jpg",
    alt: "Zaperoko - Coverizando",
    title: "Coverizando",
    artist: "Zaperoko",
    color: "#22c55e"
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/dd/7d/72/dd7d7259-d27f-5b3e-ce64-9e304d2cb40f/dj.rxzrauer.jpg/500x500bb.jpg",
    alt: "LINKIN PARK - Meteoro",
    title: "Meteoro",
    artist: "LINKIN PARK",
    color: "#3b82f6"
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6c/13/27/6c13279a-399b-2631-3cb2-6233a91d7a53/19UMGIM78325.rgb.jpg/500x500bb.jpg",
    alt: "Post Malone - Hollywood's Bleeding",
    title: "Hollywood's Bleeding",
    artist: "Post Malone",
    color: "#7c3aed"
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/04/31/61/0431617b-8479-58fe-3cc3-9fbfef175a71/20UMGIM06593.rgb.jpg/500x500bb.jpg",
    alt: "5 Seconds of Summer - CALM",
    title: "CALM",
    artist: "5 Seconds of Summer",
    color: "#f43f5e"
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Features/ab/71/ff/dj.klgvouou.jpg/500x500bb.jpg",
    alt: "El Gran Combo de Puerto Rico - 25th Anniversary",
    title: "25th Anniversary",
    artist: "El Gran Combo de Puerto Rico",
    color: "#dc2626"
  }
];

export const FeatureSection = () => {
  return (
    <section className="relative w-full z-20">
      <Scroll3DGallery albums={albums} />
    </section>
  );
};
