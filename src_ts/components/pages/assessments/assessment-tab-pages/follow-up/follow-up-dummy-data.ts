/**
 * TODO: this file will be removed after engagements list API is ready
 */
// import {EtoolsPaginator} from '../../../../common/layout/etools-table/pagination/paginator';

const priorities: string[] = ['Low', 'High', 'Medium'];
const statuses: string[] = ['Assigned', 'Submitted', 'Rejected'];
const assignees: string[] = ['John Doe', 'Jane Doe', 'Bruce Wayne'];
const categories: string[] = ['Change cash transfer modality (DCT, reimbursement or direct payment), Invoice and receive reimbursement of ineligible expenditure']
const randomValue = (myArray: string[]) => myArray[Math.floor(Math.random() * myArray.length)];

const listDataModel: any = {
  id: 1,
  ref_number: '2019/11',
  date: '2019-08-01',
  partner_name: 'Partner name',
  status: '',
  assignee: 'John Doe',
  priority: 'Low',
  priority_points: 23,
  category: 'Invoice and receive reimbursement of ineligible expenditure'
};

let i = 0;
const data: any[] = [];
while (i < 15) {
  const item = {...listDataModel};
  item.id = item.id + i;
  item.assignee = randomValue(assignees);
  item.status = randomValue(statuses);
  item.priority = randomValue(priorities);
  item.category = randomValue(categories)
  item.partner_name = item.partner_name + ' ' + (i + 1);
  data.push(item);
  i++;
}

export const getFollowUpDummydata = () => {
  return new Promise((resolve, reject) => {
    try {
      // const sliceStart = (paginator.page - 1) * paginator.page_size;
      // const sliceEnd = paginator.page_size * paginator.page;
      // const pageData = data.slice(sliceStart, sliceEnd);
      const paginatedData: any = {
        count: data.length,
        results: data
      };
      resolve(paginatedData);
    } catch (err) {
      reject(err);
    }
  });
};
