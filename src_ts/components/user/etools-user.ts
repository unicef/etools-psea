import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {EtoolsUserModel} from './user-model';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../redux/store';
import {getEndpoint} from '../../endpoints/endpoints';
import {GenericObject} from '../../types/globals';
import {updateUserData} from "../../redux/actions/user";
import {fireEvent} from '../utils/fire-custom-event';

const PROFILE_ENDPOINT = 'userProfile';

/**
 * @customElement
 * @polymer
 * @appliesMixin EtoolsAjaxRequestMixin
 */
export class EtoolsUser extends connect(store)(EtoolsAjaxRequestMixin(PolymerElement)) {

  @property({type: Object, notify: true})
  userData: EtoolsUserModel | null = null;

  private profileEndpoint = getEndpoint(PROFILE_ENDPOINT);

  public stateChanged(state: RootState) {
    this.userData = state.user!.data;
    console.log('[EtoolsUser]: store user data received', state.user!.data);
  }

  public getUserData() {
    return this.sendRequest({endpoint: this.profileEndpoint}).then((response: GenericObject) => {
      // console.log('response', response);
      store.dispatch(updateUserData(response));
    }).catch((error: GenericObject) => {
      console.error('[EtoolsUser]: getUserData req error...', error);
      throw error;
    });
  }

  public updateUserData(profile: GenericObject) {
    return this.sendRequest({endpoint: this.profileEndpoint, data: profile}).then((response: GenericObject) => {
      store.dispatch(updateUserData(response));
    }).catch((error: GenericObject) => {
      console.error('[EtoolsUser]: updateUserData req error ', error);
      throw error;
    });
  }

  public changeCountry(countryId): number {

  }

}

window.customElements.define('etools-user', EtoolsUser);
