// import {PolymerElement} from "@polymer/polymer";
// import {property} from "@polymer/decorators";
import {LitElement, property, customElement, html} from 'lit-element';
import { GenericObject, Constructor } from '../../../../../types/globals';
import { fireEvent } from '../../../../utils/fire-custom-event';
import clone from 'lodash-es/clone';
import { getEndpoint } from '../../../../../endpoints/endpoints';
import { makeRequest } from '../../../../utils/request-helper';
// import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
// import {getStaticData, setStaticData} from '../../elements/app-mixins/static-data-controller';

@customElement('get-partner-data')
export class GetPartnerData extends (LitElement as Constructor<LitElement>) {
  render() {
    return html``;
  }
  @property({type: Number})
  partnerId!: number | null;

  @property({type: Object})
  partner!: GenericObject;

  @property({type: Object})
  lastData!: GenericObject;

  @property({type: Boolean})
  lastError?: boolean;

  @property({type: Number})
  lastNumber?: number;

  updated() {
    debugger
  }

  _handleResponse(detail: GenericObject) {
    if (!detail || !detail.id) {
      this._handleError();
      return;
    }
    this.lastData = clone(detail);
    let officers = getStaticData(`officers_${detail.id}`);
    if (officers) {
      this.lastData.partnerOfficers = officers;
      this.finishRequest();
    } else {
      makeRequest(
        //@ts-ignore
        {url: getEndpoint('authorizedOfficers', {id: detail.id}).url}
      ).then((resp: any) => {
        this._handleOfficersResponse(resp);
      }).catch(() => {
        this._handleOfficersError();
      });
    }
  }

  _handleOfficersResponse(detail: GenericObject) {
    if (!detail) {
      this._handleOfficersError();
    } else {
      let activePartnerOfficers = detail.filter((officer: GenericObject) => {
        return officer && officer.active;
      });
      activePartnerOfficers = activePartnerOfficers.map((officer: GenericObject) => {
        let partnerOfficer = clone(officer);
        partnerOfficer.fullName = `${partnerOfficer.first_name} ${partnerOfficer.last_name}`;
        return partnerOfficer;
      });
      setStaticData(`officers_${this.lastData.id}`, activePartnerOfficers);
      this.lastData.partnerOfficers = activePartnerOfficers;
      this.finishRequest();
    }
  }

  finishRequest() {
    this.partner = clone(this.lastData);
    fireEvent(this, 'partner-loaded', {success: true});

    let partnerDataId = `partner_${this.partner.id}`,
      partner = getStaticData(partnerDataId);
    if (!partner) {
      setStaticData(partnerDataId, this.partner);
    }
  }

  _handleOfficersError() {
    console.error('Can not load partner officers!');
    this.finishRequest();
  }

  _handleError() {
    this.lastError = true;
    fireEvent(this, 'partner-loaded');
  }

  _partnerIdChanged(partnerId: number) {
    if (!partnerId) {return;}
    if (partnerId === this.lastNumber) {
      this.partnerId = null;
      let detail = clone(this.lastData)
      this.lastError ? this._handleError() : this._handleResponse(detail);
      return;
    }

    this.lastError = false;
    this.lastNumber = partnerId;

    let partner = getStaticData(`partner_${partnerId}`);
    if (partner) {
      this._handleResponse(partner);
    } else {
      makeRequest({
        //@ts-ignore
        url: getEndpoint('partnerInfo', {id: partnerId}).url}
      ).then((resp: GenericObject) => {
        this._handleResponse(resp);
      }).catch(() => {
        this._handleError();
      });
    }

    this.partnerId = null;
  }
}
