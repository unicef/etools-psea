import {css} from 'lit-element';
import {layoutFlex} from '../styles/lit-styles/flex-layout-styles';
import {appDrawerStyles} from './menu/styles/app-drawer-styles';

// language=HTML
export const AppShellStyles = css`
  ${appDrawerStyles}
  :host {
    display: block;
  }

  app-header-layout {
    position: relative;
  }

  .main-content {
    ${layoutFlex}
  }

  .page {
    display: none;
  }

  .page[active] {
    display: block;
  }
`;
