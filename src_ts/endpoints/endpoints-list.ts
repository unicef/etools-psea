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
    url: '/api/v2/partners/?hidden=false&externals_module=psea'
  },
  unicefUsers: {
    url: '/api/v3/users/?verbosity=minimal',
    exp: 60 * 60 * 1000, // 1h
    cachingKey: 'unicefUsers'
  },
  assessment: {
    url: '/api/psea/assessment/'
  },
  assessmentStatusUpdate: {
    template: '/api/psea/assessment/<%=id%>/<%=statusAction%>/'
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
    template: '/api/v2/partners/<%=id%>/staff-members/?externals_module=psea'
  },
  offices: {
    url: '/api/offices/'
  },
  sections: {
    url: '/api/reports/sectors/'
  },
  actionPoints: {
    template: '/api/psea/assessment/<%=id%>/action-points/'
  },
  editActionPoint: {
    template: '/api/psea/assessment/<%=id%>/action-points/<%=actionPoint%>/'
  },
  attachmentsUpload: {
    url: '/api/v2/attachments/upload/'
  },
  getQuestionnaireAnswers: {
    template: '/api/psea/assessment/<%=assessmentId%>/answer/'
  },
  saveQuestionnaireAnswer: {
    template: '/api/psea/assessment/<%=assessmentId%>/indicator/<%=indicatorId%>/'
  },
  answerAttachment: {
    template: `/api/psea/assessment/<%=assessmentId%>/indicator/<%=indicatorId%>/attachments/`
  },
  environmentFlags: {
    url: '/api/v2/environment/flags/'
  }

};
