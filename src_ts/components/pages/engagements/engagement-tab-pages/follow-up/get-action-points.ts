// import {PolymerElement} from "@polymer/polymer";
import {LitElement, property} from 'lit-element';
// import {property} from "@polymer/decorators";
import {fireEvent} from "../../../../utils/fire-custom-event";
import {getEndpoint} from '../../../../../endpoints/endpoints';
import {Constructor} from '../../../../../types/globals';
import { makeRequest } from '../../../../utils/request-helper';
// import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

export class GetActionPoints extends (LitElement as Constructor<LitElement>) {
  @property({type: Number, observer: '_engagementIdChanged'})
  engagementId!: number;

  @property({type: Array})
  actionPoints!: object[];

  _handleResponse(data: object[]) {
    this.actionPoints = data.length && data || [];
    fireEvent(this, 'ap-loaded', {success: true});
  }

  _handleError() {
    fireEvent(this, 'ap-loaded');
  }

  _engagementIdChanged(engagementId: string) {
    if (!engagementId) {return;}
    let apBaseUrl = getEndpoint('engagementInfo', {id: engagementId, type: 'engagements'}).url;
    let url = `${apBaseUrl}action-points/?page_size=all`;

    this._getActionPoints(url);
  }

  _getActionPoints(url: string) {
    const requestOptions = {
      endpoint: {
        url,
      }
    };

    makeRequest(requestOptions)
      .then((resp: object[]) => this._handleResponse(resp))
      .catch(() => this._handleError());
  }
}
