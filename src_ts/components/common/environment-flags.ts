import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';
import {getEndpoint} from '../../endpoints/endpoints';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {EtoolsErrorWarnBox} from './layout/etools-error-warn-box';
import '../common/layout/etools-error-warn-box';

export function checkEnvFlags() {
  return sendRequest({
    endpoint: getEndpoint(etoolsEndpoints.environmentFlags)
  })
    .then((response: any) => {
      handleEnvFlagsReceived(response);
      return response;
    })
    .catch((err: any) => {
      logError('checkEnvFlags error', 'environment-flags', err);
      if (err.status === 403) {
        window.location.href = window.location.origin + '/login/';
      }
      throw err;
    });
}

function handleEnvFlagsReceived(envFlags: any) {
  if (envFlags && envFlags.active_flags && envFlags.active_flags.includes('psea_disabled')) {
    const bodyEl = document.querySelector('body');
    if (bodyEl) {
      bodyEl.querySelectorAll('*').forEach((el) => el.remove());
      const warnBox = document.createElement('etools-error-warn-box') as EtoolsErrorWarnBox;
      warnBox.messages = [
        'PSEA is currently unavailable in your workspace, please stay tuned... ' +
          'In the meantime checkout our other great modules'
      ];
      bodyEl.appendChild(warnBox);
    }
  }
}
