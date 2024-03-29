import {css} from 'lit-element';

// language=HTML
export const labelAndvalueStylesLit = css`
  .paper-label {
    font-size: var(--paper-label-font-size);
    color: var(--secondary-text-color);
    padding-top: 6px;
  }

  .input-label {
    min-height: 24px;
    padding-top: 4px;
    padding-bottom: 6px;
    min-width: 0;
    font-size: 16px;
  }

  .input-label[empty]::after {
    content: '—';
    color: var(--secondary-text-color);
  }
`;
