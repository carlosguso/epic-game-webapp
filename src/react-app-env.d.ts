/// <reference types="react-scripts" />
export {};
declare global {
  interface Window {
    ethereum: any;
  }
}

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    value?: string;
  }
}
