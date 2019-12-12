import {html} from 'lit-element';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

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
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    .titlebar {
      @apply --layout-flex;
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
      line-height: 20px;
    }

    @media (min-width: 850px) {
      #menuButton {
        display: none;
      }
    }

    @media (max-width: 972px) {
      .envLong {
        display: none;
      }
      .envWarning {
        font-size: 14px;
        line-height: 16px;
      }
      #app-logo {
        width: 90px;
      }
      .titlebar img {
        margin: 0 8px 0 12px;
      }
      support-btn {
        margin-left: 14px;
      }
      etools-profile-dropdown{
        margin-left: 0px;
        width: 40px;
      }
    }
  </style>
`;
