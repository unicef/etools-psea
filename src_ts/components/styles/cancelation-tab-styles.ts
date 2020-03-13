import {css} from 'lit-element';

// language=HTML
export const cancellationTabStyles = css`
  etools-content-panel.cancellation-tab {
    margin-bottom: 20px;

    --epc-header: {
      padding: 2px;
    };
      --ecp-header-bg: var(--primary-shade-of-darkorange);
      --ecp-header-height: 2px;

    --ecp-content: {
      padding-left: 100px;
    }

    --ecp-header-btns-wrapper: {
      opacity: 1;
    };
  }

  etools-content-panel.cancellation-tab .cancellation-title {
    font-weight: 500;
    font-size: 19px;
    text-transform: uppercase;
    color: var(--primary-shade-of-darkorange);
    margin: 15px 0 26px;
  }

  etools-content-panel.cancellation-tab .cancellation-text {
    font-size: 17px;
    white-space: pre-wrap;
    color: var(--gray-darkest);
  }

  div[slot="panel-btns"].bookmark {
    position: absolute;
    top: 5px;
    right: auto;
    left: 20px;
    color: var(--primary-shade-of-darkorange);
    -webkit-transform: scale(0.9, 1.5);
    -moz-transform: scale(0.9, 1.5);
    -ms-transform: scale(0.9, 1.5);
    -o-transform: scale(0.9, 1.5);
    transform: scale(0.9, 1.5);
  }

  div[slot="panel-btns"].bookmark iron-icon {
    width: 70px !important;
    height: 70px !important;
  }
`;
