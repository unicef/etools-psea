import '@polymer/iron-flex-layout/iron-flex-layout';
import {html} from 'lit-element';

// language=HTML
export const etoolsTableResponsiveStyles = html`
  <style>

    /*.wide-screen {*/
    
    /*}*/
    
    /*.narrow-screen {*/
    /*  @apply --layout-wrap;*/
    /*  @apply --layout-flex;*/
    /*  flex: 1 0 calc(50% - 16px);*/
    /*  max-width: calc(50% - 16px);*/
    /*}*/


    /* 
    Max width before this PARTICULAR table gets nasty
    This query will take effect for any screen smaller than 760px
    and also iPads specifically.
    */
    @media only screen and (max-width: 760px),
    (min-device-width: 768px) and (max-device-width: 1024px) {

      /* Force table to not be like tables anymore */
      table, thead, tbody, th, td, tr {
        display: block;
      }

      table tr td:first-child {
        padding: 0 0 0 50%;
      }
      
      table td {
        padding: 0 0 0 50%;
      }

      /*table tr td:last-child {*/
      /*  padding: 0;*/
      /*}*/
      
      table td, table th {
        display: block;
      }

      table tr td.pagination {
        padding: 0;
      }

      table tr td.pagination:before {
        content: "";
      }

      /* Hide table headers (but not display: none;, for accessibility) */
      thead tr {
        position: absolute;
        top: -9999px;
        left: -9999px;
      }

      tr {
        border: 1px solid #ccc;
      }

      td {
        /* Behave  like a "row" */
        border: none;
        line-height: inherit;
        /*border-bottom: 1px solid #eee;*/
        position: relative;
        padding-left: 50%;
      }

      td:before {
        /* Now like a table header */
        position: absolute;
        /* Top/left values mimic padding */
        top: 6px;
        left: 6px;
        width: 45%;
        padding-right: 10px;
        white-space: nowrap;
      }

      /*
      \tLabel the data
      \t*/
      td:nth-of-type(1):before {
        content: "Reference No.";
        display: inline-block;
        vertical-align: middle;
        color: red;
      }

      td:nth-of-type(2):before {
        content: "Assessment Date";
        display: inline-block;
        vertical-align: middle;
      }

      td:nth-of-type(3):before {
        content: "Partner Org";
        display: inline-block;
        vertical-align: middle;
      }

      td:nth-of-type(4):before {
        content: "Status";
        display: inline-block;
        vertical-align: middle;
      }

      td:nth-of-type(5):before {
        content: "Assessor";
        display: inline-block;
        vertical-align: middle;
      }

      td:nth-of-type(6):before {
        content: "SEA Risk Rating";
        display: inline-block;
        vertical-align: middle;
      }
      
    }
    
    
  </style>
`;
