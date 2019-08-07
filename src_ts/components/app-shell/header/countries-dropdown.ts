import {customElement, LitElement, html, property} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from '../../../redux/store';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';

// import EndpointsMixin from '../../endpoints/endpoints-mixin.js';
import {fireEvent} from '../../utils/fire-custom-event';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {GenericObject} from '../../../types/globals';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {EtoolsUserModel} from '../../user/user-model';

import {CountriesDropdownStyles} from './countries-dropdown-styles';

/**
 * @LitElement
 * @customElement
 */
class CountriesDropdown extends connect(store)(LitElement) {

  public render() {
    // main template
    // language=HTML
    return html`
      ${CountriesDropdownStyles}
      <!-- shown options limit set to 250 as there are currently 195 countries in the UN council and about 230 total -->
      <etools-dropdown id="countrySelector"
                       .selected="${this.currentCountry.id}"
                       placeholder="Country"
                       allow-outside-scroll
                       no-label-float
                       .options="${this.countries}"
                       .optionLabel="name"
                       .optionValue="id"
                       trigger-value-change-event
                       @etools-selected-item-changed="${this._countrySelected}"
                       shown-options-limit="250"
                       ?hidden="${!this.countrySelectorVisible}"
                       hide-search></etools-dropdown>

    `;
  }

  @property({type: Object})
  currentCountry: GenericObject = {};

  @property({type: Array, observer: '_showCountrySelector'})
  countries: any[] = [];

  @property({type: Boolean})
  countrySelectorVisible: boolean = false;

  @property({type: Object, observer: 'userDataChanged'})
  userData!: EtoolsUserModel;

  public connectedCallback() {

    super.connectedCallback();

    setTimeout(() => {
      const fitInto = document.querySelector('app-shell')!.shadowRoot!.querySelector('#appHeadLayout');
      (this.$.countrySelector as EtoolsDropdownEl).set('fitInto', fitInto);
    }, 0);
  }

  public stateChanged(state: RootState) {
    this.userData = state.user!.data;
  }

  userDataChanged(userData) {
    if (userData) {
      this.countries = userData.countries_available;
      this.currentCountry = userData.country;
    }

  }

  protected _countrySelected(e: any) {
    if (!e.detail.selectedItem) {
      return;
    }

    const selectedCountryId = parseInt(e.detail.selectedItem.id, 10);
    const selectedCountry = e.detail.selectedItem;


    if (selectedCountryId !== this.currentCountry.id) {
      // send post request to change_coutry endpoint
      // this._triggerCountryChangeRequest(selectedCountryId);
      this._triggerCountryChangeRequest(selectedCountry);
    }
  }

  protected _triggerCountryChangeRequest(selectedCountry: any) {
    const self = this;
    fireEvent(this, 'global-loading', {
      message: 'Please wait while country data is changing...',
      active: true,
      loadingSource: 'country-change'
    });

    this.currentCountry = selectedCountry;

    // this.sendRequest({
    //     endpoint: this.getEndpoint('changeCountry'),
    //     method: 'POST',
    //     body: {country: countryId}
    // }).then(function() {
    //     self._handleResponse();
    // }).catch(function(error: any) {
    //     self._handleError(error);
    // });
  }

  // protected _handleResponse() {
  //     fireEvent(this, 'update-main-path', {path: 'partners'});
  //     this.refresh();
  // }

  protected _showCountrySelector(countries: any) {
    if (Array.isArray(countries) && (countries.length > 1)) {
      this.countrySelectorVisible = true;
    }
  }

  protected _handleError(error: any) {
    logError('Country change failed!', 'countries-dropdown', error);
    (this.$.countrySelector as EtoolsDropdownEl).set('selected', this.currentCountry.id);
    fireEvent(this, 'toast', {text: 'Something went wrong changing your workspace. Please try again'});
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'country-change'});
  }

}

window.customElements.define('countries-dropdown', CountriesDropdown);
