import {makeRequest, RequestEndpoint} from '../utils/request-helper';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';
import {getEndpoint} from '../../endpoints/endpoints';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {EtoolsErrorWarnBox} from '../common/layout/etools-error-warn-box';
import '../common/layout/etools-error-warn-box';


export function checkEnvFlags() {
  makeRequest(getEndpoint(etoolsEndpoints.environmentFlags) as RequestEndpoint)
    .then((response: any) => {
      handleEnvFlagsReceived(response);
    })
    .catch((err: any) => {logError('[AppShell]', 'checkEnvFlags', err);});
}

function handleEnvFlagsReceived(envFlags: any) {
  if (envFlags && envFlags.active_flags && envFlags.active_flags.includes('psea_disabled')) {
    const bodyEl = document.querySelector('body');
    if (bodyEl) {
      bodyEl.querySelectorAll('*').forEach(el => el.remove());
      const warnBox = document.createElement('etools-error-warn-box') as EtoolsErrorWarnBox;
      warnBox.messages = ['You are not authorized to use this application'];
      bodyEl.appendChild(warnBox);
    }
  }
}
