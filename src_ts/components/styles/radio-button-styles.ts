import {css} from 'lit-element';
// language=HTML
export const radioButtonStyles = css`
  mwc-radio.red {
    --mdc-theme-secondary: var(--primary-shade-of-red);
    --mdc-radio-disabled-color: var(--primary-shade-of-red);
    --mdc-radio-unchecked-color: var(--primary-shade-of-red);
  }
  mwc-radio.orange {
    --mdc-theme-secondary: var(--primary-shade-of-orange);
    --mdc-radio-disabled-color: var(--primary-shade-of-orange);
    --mdc-radio-unchecked-color: var(--primary-shade-of-orange);
  }
  mwc-radio.green {
    --mdc-theme-secondary: var(--primary-shade-of-green);
    --mdc-radio-disabled-color: var(--primary-shade-of-green);
    --mdc-radio-unchecked-color: var(--primary-shade-of-green);
  }
  mwc-formfield {
    height: 30px;
    --mdc-typography-body2-font-size: 16px;
  }
  .red-border {
    border: solid 1px var(--primary-shade-of-red);
  }
  .orange-border {
    border: solid 1px var(--primary-shade-of-orange);
  }
  .green-border {
    border: solid 1px var(--primary-shade-of-green);
  }
`;
