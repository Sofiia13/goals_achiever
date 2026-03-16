// Типи для CSS Modules
declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Типи для SVG
declare module '*.svg' {
  const content: string;
  export default content;
}

// Типи для jpg/png
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

// Уже додано твої VITE env
interface ImportMetaEnv {
  readonly VITE_API_URL: string; // або додай інші свої змінні VITE_
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}