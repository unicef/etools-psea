import {html} from 'lit-element';
import {
  centerAligned,
  displayFlex,
  endJustified,
  flexFactor,
  horizontal,
  startJustified
} from '@collaborne/lit-flexbox-literals';

// language=HTML
export const pageHeaderStyles = html`
  <style>
    app-toolbar {
      padding: 0 16px 0 0;
      height: 60px;
    }

    #menuButton {
      display: block;
      color: var(--header-color);
    }

    support-btn {
      margin-left: 24px;
      color: var(--header-color);
    }

    etools-profile-dropdown {
      margin-left: 16px;
    }
    
    .content-align {
      ${displayFlex}
      ${flexFactor}
      ${horizontal}
      ${centerAligned}
      ${endJustified}
    }

    .titlebar {
      ${displayFlex}
      ${flexFactor}
      ${startJustified}
      font-size: 28px;
      font-weight: 300;
      color: var(--header-color);
    }

    .titlebar img {
      width: 34px;
      margin: 0 8px 0 24px;
    }

    #app-logo {
      height: 32px;
      width: auto;
    }

    .envWarning {
      color: var(--nonprod-text-warn-color);
      font-weight: 700;
      font-size: 18px;
    }

    @media (min-width: 850px) {
      #menuButton {
        display: none;
      }
    }
  </style>
`;
