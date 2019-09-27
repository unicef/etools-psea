import {GenericObject} from './globals';

export class Assessment {
  id?: number;
  assessment_date: string | null = '';
  assessor: string = '';
  reference_number?: string;
  partner_name?: string;
  status: string = '';
  status_list: string[][] = [];
  available_actions: string[] = [];
  partner: string | null = '';
  focal_points?: string[] =[];
  rejected_comment: string = '';
  permissions =  new AssessmentPermissions();
  partner_details?: GenericObject;
  focal_points_details: GenericObject[] = [];
}

export class AssessmentPermissions {
  edit = {
    partner: true,
    focal_points: true,
    assessment_date: true,
    answers: false,
    assessor: false
  };
  required = {
    partner: true,
    focal_points: true,
    assessment_date: false,
    answers: false,
    assessor: false
  };

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

export class Question {
  id!: string | number;
  subject: string = '';
  content: string = '';
  ratings: Rating[] = [];
  evidences: ProofOfEvidence[] = [];
  document_types = [];
  stamp = Date.now();
}

export class ProofOfEvidence {
  id!: string;
  label: string = '';
  requires_description: boolean = false;
}

export class Rating {
  id!: string | number;
  label: string = '';
  weight: string = '';
}

export class Answer {
  id: string | null = null;
  assessment: string | null = null;
  indicator: string | null = null;
  rating: string | null = null;
  comments: string = '';
  evidences: AnswerEvidence[] = [];
  attachments: AnswerAttachment[] = [];
}

export class AnswerEvidence {
  evidence!: string; // id
  description?: string;
}

export class AnswerAttachment {
  id?: string;
  created: string = '';
  file_type: string = ''; //id
  url: string ='';
  _filename: string = ''; //temp prop , used only on frontend
}

export interface UploadedFileInfo {
  id: string;
  filename: string;
  created: string; // "11 Sep 2019"
  file_link: string; //ex. '/api/v2/attachments/file/3482/'
  uploaded_by: string; // it's the first last name of user
}
