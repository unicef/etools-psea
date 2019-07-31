import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

// language=HTML
export const labelAndvalueStyles = html`
  <style>
    .paper-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
      padding-top: 8px;
    }

    .input-label {
      min-height: 24px;
      padding-top: 4px;
      padding-bottom: 8px;
      min-width: 0;
    }

    .input-label[empty]::after {
      content: "—";
      color: var(--secondary-text-color);
    }
  </style>
`;
