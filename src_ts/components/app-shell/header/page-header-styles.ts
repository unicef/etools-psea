import {css} from 'lit-element';
import {layoutFlex, layoutHorizontal, layoutCenter} from '../../styles/lit-styles/flex-layout-styles';
// language=HTML
export const pageHeaderStyles = css`
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
    ${layoutHorizontal}
    ${layoutCenter}
  }

  .titlebar {
    ${layoutFlex}
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

  support-btn {
    color: var(--header-icon-color);
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
      white-space: nowrap;
    }
    #app-logo {
      width: 90px;
    }
    .titlebar img {
      margin: 0 8px 0 12px;
    }
    support-btn {
      margin-left: 0px;
    }
    etools-profile-dropdown {
      margin-left: 0px;
      width: 40px;
    }
  }

  @media (max-width: 576px) {
    etools-app-selector {
      --app-selector-button-padding: 18px 8px;
    }
    #app-logo {
      display: none;
    }
    .titlebar img {
      margin: 0 8px 0 4px;
    }
    .envWarning {
      font-size: 10px;
      line-height: 12px;
      white-space: nowrap;
      margin-left: 2px;
    }
    app-toolbar {
      padding-right: 0px;
    }
  }
`;
