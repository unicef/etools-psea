import {html} from 'lit-element';
import {appDrawerStyles} from './menu/styles/app-drawer-styles';
import {horizontal} from '@collaborne/lit-flexbox-literals';

// language=HTML
export const AppShellStyles = html`
  ${appDrawerStyles}
  <style>
    :host {
      display: block;
    }

    app-header-layout {
      position: relative;
    }

    .main-content {
      ${horizontal}
    }

    .page {
      display: none;
    }

    .page[active] {
      display: block;
    }
  </style>
`;
