import {Action, ActionCreator} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../store';
import {ROOT_PATH} from '../../config/config';
import {DEFAULT_ROUTE, EtoolsRouter, ROUTE_404, updateAppLocation} from '../../routing/routes';
import {RouteDetails} from '../../routing/router';
import {getFilePathsToImport} from '../../routing/component-lazy-load-config';
import {getRedirectToListPath} from '../../routing/subpage-redirect';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

const LOGS_PREFIX = 'Redux app actions';

export const UPDATE_ROUTE_DETAILS = 'UPDATE_ROUTE_DETAILS';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';

export interface AppActionUpdateRouteDetails extends Action<'UPDATE_ROUTE_DETAILS'> {
  routeDetails: any;
}
export interface AppActionUpdateDrawerState extends Action<'UPDATE_DRAWER_STATE'> {
  opened: boolean;
}

export type AppAction = AppActionUpdateRouteDetails | AppActionUpdateDrawerState;

type ThunkResult = ThunkAction<void, RootState, undefined, AppAction>;

const updateStoreRouteDetails: ActionCreator<AppActionUpdateRouteDetails> = (routeDetails: any) => {
  return {
    type: UPDATE_ROUTE_DETAILS,
    routeDetails
  };
};

const loadPageComponents: ActionCreator<ThunkResult> = (routeDetails: RouteDetails) => (dispatch) => {
  // logInfo('loadPageComponents for current route', LOGS_PREFIX, routeDetails);
  if (!routeDetails) {
    // invalid route => redirect to 404 page
    updateAppLocation(ROUTE_404, true);
    return;
  }

  const importBase = '../../'; // relative to current file
  // start importing components (lazy loading)
  const filesToImport: string[] = getFilePathsToImport(routeDetails);
  filesToImport.forEach((filePath: string) => {
    import(importBase + filePath).catch((importError: any) => {
      logError('component import failed...', LOGS_PREFIX, importError);
    });
  });

  // add page details to redux store, to be used in other components
  dispatch(updateStoreRouteDetails(routeDetails));
};

export const updateDrawerState: ActionCreator<AppActionUpdateDrawerState> = (opened: boolean) => {
  return {
    type: UPDATE_DRAWER_STATE,
    opened
  };
};

export const navigate: ActionCreator<ThunkResult> = (path: string) => (dispatch) => {
  // Check if path matches a valid app route, use route details to load required page components

  // if app route is accessed, redirect to default route (if not already on it)
  // @ts-ignore
  if (path === ROOT_PATH) {
    updateAppLocation(DEFAULT_ROUTE, true);
    return;
  }

  // Ignore urls that are not from the psea app
  if (path && path.toLowerCase().indexOf('psea') < 0) {
    return;
  }

  // some routes need redirect to subRoute list
  const redirectPath: string | undefined = getRedirectToListPath(path);
  if (redirectPath) {
    updateAppLocation(redirectPath, true);
    return;
  }

  const routeDetails: RouteDetails | null = EtoolsRouter.getRouteDetails(path);
  /**
   * TODO:
   *  - create template page with detail about routing (including tabs subpages navigation), creating a new page
   */
  dispatch(loadPageComponents(routeDetails));
};
