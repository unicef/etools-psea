import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {getEndpoint} from '../../endpoints/endpoints';
import {GenericObject} from "../../types/globals";
import {store} from "../../redux/store";
import {updateUserData, updateUserPermissions} from "../../redux/actions/user";
import {makeRequest, RequestEndpoint} from '../utils/request-helper';
import {etoolsEndpoints} from "../../endpoints/endpoints-list";
import {connect} from "pwa-helpers/connect-mixin";
import EtoolsAjaxRequestMixin from "@unicef-polymer/etools-ajax/etools-ajax-request-mixin";
import {EtoolsUserPermissions} from "../../types/user-model";

/**
 * @customElement
 * @polymer
 */
export class EtoolsUser extends connect(store)(PolymerElement) {

  // getCurrentUserData = () => {
  //   // TODO: find a better way of getting user data or continue with this
  //   userEl.getUserData(); // should req data and polpuate redux state...
  // };

  updateCurrentUserData = (profile: any) => {
    return userEl.updateUserData(profile);
  };

  changeCurrentUserCountry = (countryId: number) => {
    return userEl.changeCountry(countryId);
    // .then(() => {
    //   // refresh user data (no other way, country change req returns 204)
    //   getCurrentUserData();
    // });
  };

  public getUserData() {
    const endpoint = new RequestEndpoint(getEndpoint(etoolsEndpoints.userProfile).url);
    return makeRequest(endpoint).then((response: GenericObject) => {
      // console.log('response', response);
      store.dispatch(updateUserData(response));
      store.dispatch(updateUserPermissions(this.getUserPermissions(response)));
    }).catch((error: GenericObject) => {
      console.error('[EtoolsUser]: getUserData req error...', error);
      throw error;
    });
  }

  public updateUserData(profile: GenericObject) {
    const options = new RequestEndpoint(getEndpoint(etoolsEndpoints.userProfile).url!, 'PATCH');
    return makeRequest(options, profile).then((response: GenericObject) => {
      store.dispatch(updateUserData(response));
      store.dispatch(updateUserPermissions(this.getUserPermissions(response)));
    }).catch((error: GenericObject) => {
      console.error('[EtoolsUser]: updateUserData req error ', error);
      throw error;
    });
  }

  private getUserPermissions(user: GenericObject): EtoolsUserPermissions {
    const permissions: EtoolsUserPermissions = {
      canAddAssessment: user && user.groups && Boolean(user.groups.find((group: any) => group.name === 'UNICEF User' || group.name === 'UNICEF Audit Focal Point'))
    }
    return permissions;
  }

  public changeCountry(countryId: number) {
    const options = new RequestEndpoint(getEndpoint(etoolsEndpoints.changeCountry).url!, 'POST');
    return makeRequest(options, {country: countryId}).catch((error: GenericObject) => {
      console.error('[EtoolsUser]: updateUserData req error ', error);
      throw error;
    });
  }

}

window.customElements.define('etools-user', EtoolsUser);
