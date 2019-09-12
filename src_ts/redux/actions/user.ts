import {Action, ActionCreator} from 'redux';
import {EtoolsUserModel, EtoolsUserPermissions} from '../../types/user-model';
// import {ThunkAction} from 'redux-thunk';
// import {RootState} from '../store';
import {GenericObject} from '../../types/globals';

export const SET_USER_DATA = 'SET_USER_DATA';
export const SET_USER_PERMISSIONS = 'SET_USER_PERMISSIONS';

export interface UserActionSet extends Action<'SET_USER_DATA'> {data: EtoolsUserModel}
export interface UserActionSetPermissions extends Action<'SET_USER_PERMISSIONS'> {permissions: GenericObject}

export type UserAction = UserActionSet | UserActionSetPermissions;
// @ts-ignore - for now
// type ThunkResult = ThunkAction<void, RootState, undefined, UserAction>;

export const setUserData: ActionCreator<UserActionSet> = (data: EtoolsUserModel) => {
  return {
    type: SET_USER_DATA,
    data
  };
};

export const setUserPermissions: ActionCreator<UserActionSetPermissions> = (permissions: EtoolsUserPermissions) => {
  return {
    type: SET_USER_PERMISSIONS,
    permissions
  };
};
