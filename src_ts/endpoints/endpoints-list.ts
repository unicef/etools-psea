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
    url: '/api/v2/partners/?hidden=false',
  },
  unicefUsers: {
    url: '/api/v3/users/?verbosity=minimal',
    exp: 60 * 60 * 1000, // 1h
    cachingKey: 'unicefUsers'
  },
  auditorFirm: {
    template: '/api/audit/purchase-orders/sync/<%=id%>/?auditor_firm__unicef_users_allowed=False'
  },
  staffMembers: {
    template: '/api/audit/audit-firms/<%=id%>/staff-members/'
  },
  partnerStaffMembers: {
    template: '/api/v2/partners/<%=id%>/staff-members/'
  },
  // agreements: {
  //   template: '/api/v2/agreements/',
  //   exp: 30 * 60 * 1000, // 30min
  //   cacheTableName: 'agreements'
  // },
};
