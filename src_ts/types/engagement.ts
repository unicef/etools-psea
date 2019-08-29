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
