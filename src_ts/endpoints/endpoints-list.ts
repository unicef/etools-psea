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
  externalIndividuals: {
    url: '/api/v3/users/external/'
  },
  partners: {
    url: '/api/v2/partners/?hidden=false'
  },
  unicefUsers: {
    url: '/api/v3/users/?verbosity=minimal',
    exp: 60 * 60 * 1000, // 1h
    cachingKey: 'unicefUsers'
  },
  assessment: {
    url: '/api/psea/assessment/'
  },
  assessor: {
    template: '/api/psea/assessment/<%=id%>/assessor/'
  },
  questionnaire: {
    url: '/api/psea/indicator/'
  },
  auditorFirm: {
    template: '/api/audit/purchase-orders/sync/<%=id%>/?auditor_firm__unicef_users_allowed=False'
  },
  auditorFirms: {
    url: '/api/audit/audit-firms/?page_size=all'
  },
  staffMembers: {
    template: '/api/audit/audit-firms/<%=id%>/staff-members/'
  },
  partnerStaffMembers: {
    template: '/api/v2/partners/<%=id%>/staff-members/'
  },
  offices: {
    url: '/api/offices/',
    exp: 23 * 60 * 60 * 1000, // 23h
    cachingKey: 'offices'
  },
  sections: {
    url: '/api/reports/sectors/',
    exp: 24 * 60 * 60 * 1000, // 24h
    cachingKey: 'sections'
  },
  // agreements: {
  //   template: '/api/v2/agreements/',
  //   exp: 30 * 60 * 1000, // 30min
  //   cacheTableName: 'agreements'
  // },
  actionPoints: {
    template: '/api/psea/assessment/<%=id%>/action-points/'
  },
  editActionPoint: {
    template: '/api/psea/assessment/<%=id%>/action-points/<%=actionPoint%>/'
  },
  attachmentsUpload: {
    url: '/api/v2/attachments/upload/'
  }
};
