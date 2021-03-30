import {css} from 'lit-element';

// language=HTML
export const rejectionTabStyles = css`
  etools-content-panel.rejection-tab::part(ecp-header) {
    height: 5px;
    background-color: var(--primary-shade-of-orange);
    border-bottom: none;
  }

  etools-content-panel.rejection-tab {
    margin-bottom: 20px;
  }

  etools-content-panel.rejection-tab::part(ecp-header-btns-wrapper) {
    opacity: 1;
  }

  etools-content-panel.rejection-tab .rejection-title {
    font-weight: 500;
    font-size: 19px;
    text-transform: uppercase;
    color: var(--primary-shade-of-orange);
    margin: 15px 0 26px;
    padding-left: 70px;
  }

  etools-content-panel.rejection-tab .rejection-text {
    font-size: 17px;
    white-space: pre-wrap;
    color: var(--gray-darkest);
    padding-left: 70px;
  }

  div[slot='panel-btns'].bookmark {
    position: absolute;
    top: 5px;
    right: auto;
    left: 20px;
    color: var(--primary-shade-of-orange);
    -webkit-transform: scale(0.9, 1.5);
    -moz-transform: scale(0.9, 1.5);
    -ms-transform: scale(0.9, 1.5);
    -o-transform: scale(0.9, 1.5);
    transform: scale(0.9, 1.5);
  }

  div[slot='panel-btns'].bookmark iron-icon {
    width: 70px !important;
    height: 70px !important;
  }
`;
