export const isJsonStrMatch = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const cloneDeep = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

export const getFileNameFromURL = (url?: string) => {
  if (!url) {
    return '';
  }
  // @ts-ignore
  return url.split('?').shift().split('/').pop();
};

export const onListPage = (routeDetails: any) => {
  return routeDetails.routeName === 'assessments' && routeDetails.subRouteName == 'list';
};

export const resetRequiredField = (e: CustomEvent) => {
  if (!e || !e.target) {
    return;
  }
  (e.target as any).invalid = false;
};
