import {LitElement, html} from 'lit-element';
import '@unicef-polymer/etools-upload/etools-upload-multi';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';

class QuestionAttachments extends LitElement {
  render() {
    return html`
      ${gridLayoutStylesLit}
      <style>
        .container {
          background-color: var(--secondary-background-color);
          margin-left: -24px;
          margin-right: -24px;
          padding: 16px 24px;
          margin-bottom: 6px;
        }
        .header {
          font-size: 12px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.64);
        }
      </style>

      <div class="row-padding-v">
        <etools-upload-multi>
        </etools-upload-multi>
      </div>
      <div class="container">
        <div class="layout-horizontal header">
          <div class="col-2">Date Uploaded</div>
          <div class="col-3">Document Type</div>
          <div class="col-5">File Attachment</div>
          <div class="col-2"></div>
        </div>
        <div class="layout-horizontal">
          <div class="col-2"></div>
          <div class="col-3"></div>
          <div class="col-5"></div>
          <div class="col-2"></div>
        </div>
      </div>
    `;
  }
}

window.customElements.define('question-attachments', QuestionAttachments);
