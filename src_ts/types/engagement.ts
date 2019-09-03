export class PSEAEngagement {

}

export class Assessment {
  id?: number;
  assessment_date: string | null = '';
  status: string = '';
  partner: string | null = '';
  focal_points?: string[] =[];
}

export class AssessmentInvalidator {
  partner = false;
  assessment_date = false;
}

export enum AssessorTypes {
  Staff = 'staff',
  Firm = 'firm',
  ExternalIndividual = 'external'
}

export class Assessor {
  id?: string;
  assessor_type: AssessorTypes = AssessorTypes.Staff;
  order_number: string = '';
  assessment: string | null = null;
  user: string | null = null;
  auditor_firm: string | null = null;
  auditor_firm_name: string = '';
  auditor_firm_staff: string[] = [];
}

export class QuestionnaireItem {
  id!: string | number;
  subject: string = '';
  content: string = '';
  ratings: Rating[] = [];
  evidences: ProofOfEvidence[] = [];
}

export class ProofOfEvidence {
  id!: string | number;
  label: string = '';
  required_description: boolean = false;
}

export class Rating {
  id!: string | number;
  label: string = '';
  weight: string = '';
}

