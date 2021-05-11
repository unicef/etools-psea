import {GenericObject} from './globals';
import {UnicefUser} from './user-model';

export class AssessmentPermissions {
  edit = {
    partner: true,
    focal_points: true,
    assessment_date: true,
    assessment_type: true,
    assessment_ingo_reason: true,
    answers: false,
    assessor: false
  };
  required = {
    partner: true,
    focal_points: true,
    assessment_date: false,
    answers: false,
    assessor: false,
    assessment_type: true,
    assessment_ingo_reason: false
  };
}

export class Assessment {
  id?: number;
  assessment_date: string | null = '';
  assessor = '';
  reference_number?: string;
  partner_name?: string;
  status = '';
  status_list: string[][] = [];
  available_actions: string[] = [];
  partner: string | null = '';
  focal_points?: string[] = [];
  rejected_comment = '';
  assessment_ingo_reason: string | null = null;
  assessment_type: string | null = null;
  permissions = new AssessmentPermissions();
  partner_details?: GenericObject;
  focal_points_details: UnicefUser[] = [];
}

export class AssessmentInvalidator {
  partner = false;
  assessment_date = false;
  assessment_type = false;
}

export enum AssessorTypes {
  Staff = 'staff',
  Firm = 'firm',
  ExternalIndividual = 'external'
}

export class Assessor {
  id?: string;
  assessor_type: AssessorTypes = AssessorTypes.Staff;
  order_number: string | null = '';
  assessment: string | null = null;
  user: string | null = null;
  auditor_firm: string | null = null;
  auditor_firm_name = '';
  auditor_firm_staff: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
  user_details: UnicefUser = {} as UnicefUser;
}

export class Question {
  id!: string | number;
  subject = '';
  content = '';
  ratings: Rating[] = [];
  evidences: ProofOfEvidence[] = [];
  document_types = [];
  stamp = Date.now();
}

export class ProofOfEvidence {
  id!: string;
  label = '';
  requires_description = false;
}

export class Rating {
  id!: string | number;
  label = '';
  weight = '';
}

export class Answer {
  id?: string | null = null;
  assessment: string | number | null = null;
  indicator: string | number | null = null;
  rating: string | null = null;
  comments = '';
  evidences: AnswerEvidence[] = [];
  attachments: AnswerAttachment[] = [];
}

export class AnswerEvidence {
  evidence!: string; // id
  description?: string;
}

export class AnswerAttachment {
  id?: string;
  created = '';
  file_type?: string = ''; // id
  url?: string = '';
  _filename = ''; // temp prop , used only on frontend
}

export interface UploadedFileInfo {
  id: string;
  filename: string;
  created: string; // "11 Sep 2019"
  file_link: string; // ex. '/api/v2/attachments/file/3482/'
  uploaded_by: string; // it's the first last name of user
}
