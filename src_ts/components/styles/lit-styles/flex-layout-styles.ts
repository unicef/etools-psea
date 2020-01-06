import {css} from 'lit-element';

export const layout = css`
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
`;

export const layoutHorizontal = css`
   ${layout}
  -ms-flex-direction: row;
  -webkit-flex-direction: row;
  flex-direction: row;
`;

export const layoutVertical = css`
  ${layout}
  -ms-flex-direction: column;
  -webkit-flex-direction: column;
  flex-direction: column;
`;

export const layoutFlex = css`
  -ms-flex: 1 1 0.000000001px;
  -webkit-flex: 1;
  flex: 1;
  -webkit-flex-basis: 0.000000001px;
  flex-basis: 0.000000001px;
`;

export const layoutWrap = css`
  -ms-flex-wrap: wrap;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
`;

