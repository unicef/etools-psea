import {Router, RouteCallbackParams, RouteDetails} from './router';
import {store} from '../redux/store';
import {navigate} from '../redux/actions/app';
import {ROOT_PATH} from '../config/config';

export const EtoolsRouter = new Router(ROOT_PATH);
const routeParamRegex = '([^\\/?#=+]+)';

EtoolsRouter.addRoute(new RegExp('^assessments/list$'), (params: RouteCallbackParams): RouteDetails => {
  return {
    routeName: 'assessments',
    subRouteName: 'list',
    path: params.matchDetails[0],
    queryParams: params.queryParams,
    params: null
  };
})
  .addRoute(
    new RegExp(`^assessments\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: RouteCallbackParams): RouteDetails => {
      return {
        routeName: 'assessments',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          assessmentId: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(new RegExp(`^page-not-found$`), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'page-not-found',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: null
    };
  })
  .addRoute(new RegExp(`^page-two$`), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'page-two',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: null
    };
  });

/**
 * Utility used to update location based on routes and dispatch navigate action (optional)
 */
// TODO this method calls app.ts/navigate and app.ts/navigate calls this method ?!!
export const updateAppLocation = (newLocation: string, dispatchNavigation = true): void => {
  const _newLocation = EtoolsRouter.prepareLocationPath(newLocation);

  EtoolsRouter.pushState(_newLocation);

  if (dispatchNavigation) {
    store.dispatch(navigate(decodeURIComponent(_newLocation)));
  }
};

export const replaceAppLocation = (newLocation: string, dispatchNavigation = true): void => {
  const _newLocation = EtoolsRouter.prepareLocationPath(newLocation);

  EtoolsRouter.replaceState(_newLocation);

  if (dispatchNavigation) {
    store.dispatch(navigate(decodeURIComponent(_newLocation)));
  }
};

export const ROUTE_404 = '/page-not-found';
export const DEFAULT_ROUTE = '/assessments/list';
