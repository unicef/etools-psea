import {html} from 'lit-element';

export const SharedStylesLit = html`
<style>
  :host {
    display: block;
    box-sizing: border-box;
    font-size: 16px;
  }

  *[hidden] {
    display: none !important;
  }

  h1, h2 {
    color: var(--primary-text-color);
    margin: 0;
    font-weight: normal;
  }

  h1 {
    text-transform: capitalize;
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  a {
    color: var(--primary-color);
    text-underline: none;
  }

  section {
    background-color: var(--primary-background-color);
  }

  paper-input-container {
      margin: 0 12px;
      --paper-input-container-focus-color: var(--module-primary);
      --paper-input-container: {
        color: var(--gray-50) !important;
        font-size: 13px;
        opacity: 1 !important;
      };
      --paper-input-container-underline: {
        display: none !important;
      };
      --paper-input-container-underline-focus: {
        display: none;
      };
      --paper-input-container-underline-disabled: {
        display: block !important;
        border-bottom: 1px dashed var(--gray-20) !important;
      };
  }

  .repeatable-item-container{
    position: relative;
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .repeatable-item-container[without-line]{
    padding: 0 12px !important;
  }

  .repeatable-item-container .repeatable-item-content{
    border-left: none;
    margin-left: 0;
    padding-left: 0;
    width:100%;
    padding-bottom:8px;
  }

   etools-dropdown[readonly], etools-dropdown-multi[readonly], datepicker-lite[readonly] {
    --paper-input-container-underline: {
      display: none;
    };
    --paper-input-container-input-focus: {
      pointer-events: none;
    };
    --paper-input-container-label-focus: {
      pointer-events: none;
    };
    --paper-input-container-underline-focus: {
      display: none;
    };
  }

  :host > * {
      --required-star-style: {
        background: url('./images/required.svg') no-repeat 99% 20%/8px;
        width: auto !important;
        max-width: 100%;
        right: auto;
        padding-right: 15px;
      };
    }

    paper-input,
    paper-input-container,
    datepicker-lite,
    etools-dropdown,
    etools-dropdown-multi,
    etools-upload,
    etools-currency-amount-input {
      --paper-input-container-label: {
        color: var(--secondary-text-color, #737373)
      };
      --paper-input-container-label-floating: {
        color: var(--secondary-text-color, #737373);
      }
    }

    paper-input[required][label],
    paper-input-container[required],
    datepicker-lite[required],
    etools-dropdown[required],
    etools-dropdown-multi[required],
    etools-upload[required],
    etools-currency-amount-input[required] {
      --paper-input-container-label: {
        @apply --required-star-style;
        color: var(--secondary-text-color, #737373)
      };
      --paper-input-container-label-floating: {
        @apply --required-star-style;
        color: var(--secondary-text-color, #737373);
      }
    }

</style>
`;
