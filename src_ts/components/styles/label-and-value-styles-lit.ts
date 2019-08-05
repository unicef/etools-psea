import {html} from 'lit-element';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

// language=HTML
export const labelAndvalueStylesLit = html`
  <style>
    .paper-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
      padding-top: 4px;
    }

    .input-label {
      min-height: 24px;
      padding-top: 4px;
      padding-bottom: 4px;
      min-width: 0;
    }

    .input-label[empty]::after {
      content: "—";
      color: var(--secondary-text-color);
    }
  </style>
`;
