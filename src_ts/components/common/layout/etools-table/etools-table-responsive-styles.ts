import {css} from 'lit-element';

// language=HTML
export const etoolsTableResponsiveStyles = css`
  /*
    Max width before this PARTICULAR table gets nasty
    This query will take effect for any screen smaller than 760px
    and also iPads specifically.
  */
    @media only screen and (max-width: 760px),
    (min-device-width: 768px) and (max-device-width: 1024px) {

    :host {
      padding-top: 6px;
    }
    table {
      border: 0;
    }
    table caption {
      font-size: 1.3em;
      line-height: 1.5em;
      height: auto;
      padding-bottom: 6px;
    }
    table thead {
      border: none;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
    }
    table tr:not(.child-row) td {
      padding: .75rem 0 .75rem 36%;
    }
    table td, table th {
      display: block !important;
    }
    table tr td.pagination {
      padding: 0px 8px !important;
    }
    table tr td.pagination:before {
      content: "";
    }
    tr {
      border: 1px solid #ccc;
    }
    td {
      border: none !important;
      line-height: inherit;
      position: relative;
      padding-left: 36% !important;
    }
    tr:not(.child-row) td:before {
      position: absolute;
      content: attr(data-label);
      color: var(--etools-table-secondary-text-color, rgba(0, 0, 0, .54));
      left: 5px;
      right: 5px;
      width: 34%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row-actions .actions {
      visibility: visible !important;
    }
    .expand-cell {
      display: none;
    }
    .child-row {
      display: var(--child-row-responsive-display, flex);
    }
    .child-row td {
      padding: var(--child-row-td-padding, .5rem .75rem) !important;
    }
  }
`;
