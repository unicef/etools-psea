import {LitElement, html, customElement, property} from 'lit-element';
import '@unicef-polymer/etools-upload/etools-upload-multi';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '../../../../utils/ajax-error-parser';
import {getFileNameFromURL} from '../../../../utils/utils';
import {prettyDate} from '../../../../utils/date-utility';
import {AnswerAttachment} from '../../../../../types/assessment';

@customElement('question-attachments')
export class QuestionAttachmentsElement extends LitElement {
  render() {
    return html`
      ${SharedStylesLit}${gridLayoutStylesLit}
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
        div.header>div {
          padding-right: 16px;
        }

        .padd-right {
          padding-right: 16px;
        }

        .delete {
          color: var(--error-color);
        }

        div.att > div[class^="col-"] {
          box-sizing: border-box;
        }
      </style>

      <div class="row-padding-v">
        <etools-upload-multi ?hidden="${!this.editMode}"
          .uploadEndpoint="${etoolsEndpoints.attachmentsUpload.url}"
          @upload-finished="${this.handleUploadedFiles}">
        </etools-upload-multi>
      </div>
      <div class="container">
        ${this._getAttachmentsHeaderTemplate(this.attachments)}

        ${this._getAttachmentsTemplate(this.attachments)}
      </div>
    `;
  }

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: Array})
  attachments = [];

  @property({type: Array})
  documentTypes = [];

  _getAttachmentsHeaderTemplate(attachments: any) {
    if (!attachments|| !attachments.length) {
      return '';
    }

    return html`
      <div class="layout-horizontal header row-padding-v att">
        <div class="col-2">Date Uploaded</div>
        <div class="col-4">Document Type</div>
        <div class="col-5">File Attachment</div>
        <div class="col-1"></div>
      </div>
    `;
  }
  _getAttachmentsTemplate(attachments: any) {
    if (!attachments|| !attachments.length) {
      return html`<div class="row-padding-v">No attachments.</div>`;
    }
    return attachments.map((att: AnswerAttachment) => {
      return html`
        <div class="layout-horizontal row-padding-v align-items-center att">
          <div class="col-2 padd-right">${att.url ? prettyDate(att.created) : att.created}</div>
          <div class="col-4 padd-right">
            <etools-dropdown no-label-float
              .options="${this.documentTypes}"
              .selected="${att.file_type}"
              option-value="id"
              option-label="label"
              .readonly="${!this.editMode}"
              hide-search
              trigger-value-change-event
              @etools-selected-item-changed="${(e: CustomEvent) => this._setSelectedDocType(e, att)}">
            </etools-dropdown>
          </div>
          <div class="col-5 padd-right">${att._filename ? att._filename : getFileNameFromURL(att.url)}</div>
          <div class="col-1 delete">DELETE</div>
        </div>
      `;
    })
  }

  _setSelectedDocType(e: CustomEvent, attachment: any) {
    attachment.file_type = e.detail.selectedItem && e.detail.selectedItem.id;
  }

  handleUploadedFiles(e:CustomEvent) {
    if (!!(e.detail.error && e.detail.error.length)) {
      fireEvent(this, 'toast', {text: formatServerErrorAsText(e.detail.error)});
    }
    let uploadedFiles = e.detail.success;
    if (!uploadedFiles || !uploadedFiles.length) {
      return;
    }

    uploadedFiles.forEach(f => {
      this.attachments.push(this._parseUploadedFileResponse(JSON.parse(f)));
    });
    this.attachments = [...this.attachments];
  }

  _parseUploadedFileResponse(response: any) {
    return {
      id: response.id,
      _filename: response.filename,
      created: response.created
    }
  }

  getAttachmentsForSave() {
    return this.attachments;
  }
}

