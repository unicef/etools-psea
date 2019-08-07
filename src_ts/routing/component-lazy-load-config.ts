import {RouteDetails} from './router';

export interface RoutesLazyLoadComponentsPath {
  [key: string]: string[];
}
// each key from this object is computed from routeName_routeSubPage (if subRoute exists)
export const componentsLazyLoadConfig: RoutesLazyLoadComponentsPath = {

  'engagements_list': [
    'components/pages/engagements/engagements-list.js'
  ],
  'engagements_details': [
    'components/pages/engagements/engagement-tabs.js',
    'components/pages/engagements/engagement-tab-pages/details/engagement-details-page.js'
  ],
  'engagements_questionnaire': [
    'components/pages/engagements/engagement-tabs.js',
    'components/pages/engagements/engagement-tab-pages/questionnaire/engagement-questionnaire-page.js'
  ],
  'engagements_followup': [
    'components/pages/engagements/engagement-tabs.js',
    'components/pages/engagements/engagement-tab-pages/follow-up/follow-up-page'
  ],
  'page-not-found': [
    'components/pages/page-not-found.js'
  ],
  'page-two': [
    'components/pages/page-two.js'
  ]

};

export const getFilePathsToImport = (routeDetails: RouteDetails): string[] => {
  let routeImportsPathsKey: string = routeDetails.routeName;
  if (routeDetails.subRouteName) {
    routeImportsPathsKey += `_${routeDetails.subRouteName}`;
  }

  const filesToImport: string[] = componentsLazyLoadConfig[routeImportsPathsKey];
  if (!filesToImport || filesToImport.length === 0) {
    throw new Error('No file imports configuration found (componentsLazyLoadConfig)!');
  }
  return filesToImport;
};
