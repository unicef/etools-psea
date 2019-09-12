import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {EtoolsUserModel, EtoolsUserPermissions} from './user-model';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../redux/store';
import {getEndpoint} from '../../endpoints/endpoints';
import {GenericObject} from '../../types/globals';
import {updateUserData, updateUserPermissions} from '../../redux/actions/user';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';

/**
 * @customElement
 * @polymer
 * @appliesMixin EtoolsAjaxRequestMixin
 */
export class EtoolsUser extends connect(store)(EtoolsAjaxRequestMixin(PolymerElement)) {

  @property({type: Object, notify: true})
  userData: EtoolsUserModel | null = null;

  private profileEndpoint = getEndpoint(etoolsEndpoints.userProfile);
  private changeCountryEndpoint = getEndpoint(etoolsEndpoints.changeCountry);

  public stateChanged(state: RootState) {
    this.userData = state.user!.data;
    console.log('[EtoolsUser]: store user data received', state.user!.data);
  }

  public getUserData() {
    return this.sendRequest({endpoint: this.profileEndpoint}).then((response: GenericObject) => {
      // console.log('response', response);
      store.dispatch(updateUserData(response));
      store.dispatch(updateUserPermissions(this.getUserPermissions(response)));
    }).catch((error: GenericObject) => {
      console.error('[EtoolsUser]: getUserData req error...', error);
      throw error;
    });
  }

  public updateUserData(profile: GenericObject) {
    return this.sendRequest({
      method: 'PATCH',
      endpoint: this.profileEndpoint,
      body: profile
    }).then((response: GenericObject) => {
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
    return this.sendRequest({
      method: 'POST',
      endpoint: this.changeCountryEndpoint,
      body: {country: countryId}
    }).catch((error: GenericObject) => {
      console.error('[EtoolsUser]: updateUserData req error ', error);
      throw error;
    });
  }

}

window.customElements.define('etools-user', EtoolsUser);

//todo: test branch2
