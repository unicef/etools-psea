import {EtoolsCommonData} from './common-data';
import './common-data';


const commonDataEl = document.createElement('etools-common-data') as EtoolsCommonData;
//TODO -remove component, do the call directly here

export const getUnicefUsersData = () => {
  return commonDataEl.getUnicefUserData();
};
