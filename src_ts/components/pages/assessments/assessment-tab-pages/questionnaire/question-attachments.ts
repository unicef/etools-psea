import {LitElement, html, customElement, property, css} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-upload/etools-upload-multi';
import {gridLayoutStylesLit} from '../../../../styles/grid-layout-styles-lit';
import {SharedStylesLit} from '../../../../styles/shared-styles-lit';
import {etoolsEndpoints} from '../../../../../endpoints/endpoints-list';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {getFileNameFromURL} from '../../../../utils/utils';
import {prettyDate} from '../../../../utils/date-utility';
import {AnswerAttachment, UploadedFileInfo} from '../../../../../types/assessment';
import {labelAndvalueStylesLit} from '../../../../styles/label-and-value-styles-lit';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown';

@customElement('question-attachments')
export class QuestionAttachmentsElement extends LitElement {
  static get styles() {
    return [labelAndvalueStylesLit, gridLayoutStylesLit,
      css`
        .container {
          background-color: var(--secondary-background-color);
          margin-left: -24px;
          margin-right: -24px;
          padding: 16px 24px;
          margin-bottom: 6px;
          color: black;
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

        .extra-padd-right {
          padding-right: 38px;
        }

        .delete {
          color: var(--error-color);
        }

        div.att > div[class^="col-"] {
          box-sizing: border-box;
        }

        iron-icon[icon="file-download"] {
          color: var(--primary-color);
          margin-left: -4px;
        }

        etools-upload-multi {
          margin-left: -4px;
        }

        .padd-top {
          padding-top: 16px;
        }

        .break-word {
          overflow-wrap: break-word;
        }
      `
    ];
  }

  render() {
    return html`
      <style>
        etools-dropdown[required][no-star] {
          --paper-input-container-label: {
            background: none;
            color: var(--secondary-text-color, #737373)
          };
          --paper-input-container-label-floating: {
            background: none;
            color: var(--secondary-text-color, #737373);
          }
        }
      </style>
      ${SharedStylesLit}

      <div class="row-padding-v">
        <etools-upload-multi ?hidden="${!this.editMode}"
          .uploadEndpoint="${etoolsEndpoints.attachmentsUpload.url}"
          @upload-finished="${this.handleUploadedFiles}"
          class="padd-top">
        </etools-upload-multi>
        <label class="paper-label" ?hidden="${this.editMode}">Files</label>
      </div>
      <div class="container">
        ${this._getAttachmentsHeaderTemplate(this.attachments)}

        ${this._getAttachmentsTemplate(this.attachments, this.editMode)}
      </div>
    `;
  }

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: Array})
  attachments: AnswerAttachment[] = [];

  @property({type: Array})
  documentTypes = [];

  _getAttachmentsHeaderTemplate(attachments: any) {
    if (!attachments || !attachments.length) {
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
  _getAttachmentsTemplate(attachments: any, editMode: boolean) {
    if (!attachments || !attachments.length) {
      return html`<div class="row-padding-v">No attachments.</div>`;
    }
    return attachments.map((att: AnswerAttachment) => {
      return html`
        <div class="layout-horizontal row-padding-v align-items-center att">
          <div class="col-2 padd-right">${prettyDate(att.created)}</div>
          <div class="col-4 extra-padd-right">
            <etools-dropdown no-label-float
               id="${'filetype' + att.id}"
              .options="${this.documentTypes}"
              .selected="${att.file_type}"
              option-value="id"
              option-label="label"
              .readonly="${!this.editMode}"
              hide-search
              auto-validate
              required
              no-star
              trigger-value-change-event
              @etools-selected-item-changed="${(e: CustomEvent) => this._setSelectedDocType(e, att)}">
            </etools-dropdown>
          </div>
          <div class="col-5 padd-right break-word">
            ${this._getAttachmentNameTemplate(att)}
          </div>
          <div class="col-1 delete" ?hidden="${!editMode}">
            <paper-button @tap="${() => this.deleteAttachment(att.id!, !att.url)}">DELETE</paper-button>
          </div>
        </div>
      `;
    });
  }

  _getAttachmentNameTemplate(att: AnswerAttachment) {
    if (att.url) {
      return html`
        <a target="_blank" href="${att.url}"><iron-icon icon="file-download"></iron-icon>
          ${getFileNameFromURL(att.url)}
        </a>
      `;
    } else {
      return html`
        ${att._filename}
      `;
    }
  }

  _setSelectedDocType(e: CustomEvent, attachment: any) {
    attachment.file_type = e.detail.selectedItem && e.detail.selectedItem.id;
  }

  handleUploadedFiles(e: CustomEvent) {
    if (e.detail.error && e.detail.error.length) {
      fireEvent(this, 'toast', {text: formatServerErrorAsText({response: e.detail.error})});
    }
    const uploadedFiles = e.detail.success;
    if (!uploadedFiles || !uploadedFiles.length) {
      return;
    }

    uploadedFiles.forEach((f: UploadedFileInfo) => {
      this.attachments.push(this._parseUploadedFileResponse(f));
    });
    this.attachments = [...this.attachments];
  }

  _parseUploadedFileResponse(response: UploadedFileInfo) {
    const answerAttachment: AnswerAttachment = {
      id: response.id,
      _filename: response.filename,
      created: response.created
    };
    return answerAttachment;
  }

  getAttachmentsForSave() {
    // At the moment, the endpoint expects all attachments to be sent, not just the modified ones
    return this.attachments;
  }

  validate(attachments?: AnswerAttachment[]) {
    if (attachments === undefined) {
      attachments = this.attachments;
    }
    if (!attachments || !attachments.length) {
      return true;
    }
    let valid = true;
    attachments.forEach((att) => {
      if (!att.file_type) {
        const dropD = this.shadowRoot!.querySelector('#filetype' + att.id) as EtoolsDropdownEl;
        if (dropD) {
          dropD.invalid = true;
        }
        valid = false;
      }
    });
    return valid;
  }

  deleteAttachment(attId: string, isNotSavedYet: boolean) {
    fireEvent(this, 'delete-attachment', {attachmentId: attId, isNotSavedYet: isNotSavedYet});
  }
}

