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

  etools-dropdown[readonly] {
    --paper-input-container-underline: {
      display: none;
    }
  }

</style>
`;
