export interface EtoolsEndpoint {
  url?: string;
  template?: string;
  exp?: any;
  cachingKey?: string;
  cacheTableName?: string;
}
export interface EtoolsEndpoints {
  [key: string]: EtoolsEndpoint;
}

export const etoolsEndpoints: EtoolsEndpoints = {
  userProfile: {
    url: '/api/v3/users/profile/'
  },
  changeCountry: {
    url: '/api/v3/users/changecountry/'
  },
  partners: {
    url: ''
  },
  unicefUsers: {
    url: '/api/v3/users/?verbosity=minimal',
    exp: 60 * 60 * 1000, // 1h
    cachingKey: 'unicefUsers'
  }
  // agreements: {
  //   template: '/api/v2/agreements/',
  //   exp: 30 * 60 * 1000, // 30min
  //   cacheTableName: 'agreements'
  // },
};

