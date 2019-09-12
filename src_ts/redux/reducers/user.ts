import {Reducer} from 'redux';
import {UPDATE_USER_DATA, UPDATE_USER_PERMISSIONS} from '../actions/user';
import {EtoolsUserModel, EtoolsUserPermissions} from '../../types/user-model';
import {RootAction} from '../store';

export interface UserState {
  data: EtoolsUserModel | null;
  permissions: EtoolsUserPermissions | null;
}

const INITIAL_USER_DATA: UserState = {
  data: null,
  permissions: null
};

const userData: Reducer<UserState, RootAction> = (state = INITIAL_USER_DATA, action) => {
  switch (action.type) {
    case UPDATE_USER_DATA:
      return {
        ...state,
        data: action.data
      };
    case UPDATE_USER_PERMISSIONS:
      return {
        ...state,
        permissions: action.permissions
      };
    default:
      return state;
  }
};

export default userData;
