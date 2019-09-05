import {EtoolsFilter, EtoolsFilterTypes} from '../../../common/layout/filters/etools-filters';
import {GenericObject} from '../../../../types/globals';
import {isJsonStrMatch} from '../../../utils/utils';

export const defaultSelectedFilters: GenericObject = {
  q: '',
  status: [],
  unicef_focal_point: [],
  partner: [],
  assessment_date: null
};

export const assessmentsFilters: EtoolsFilter[] = [
  {
    filterName: 'Search assesment',
    filterKey: 'q',
    type: EtoolsFilterTypes.Search,
    selectedValue: '',
    selected: true
  },
  {
    filterName: 'Staff Member',
    filterKey: 'staff_member',
    type: EtoolsFilterTypes.DropdownMulti,
    selectionOptions: [],
    selectedValue: [],
    selected: false,
    minWidth: '350px',
    hideSearch: true,
    disabled: false,
    optionValue: 'id',
    optionLabel: 'name'
  },
  {
    filterName: 'Status',
    filterKey: 'status',
    type: EtoolsFilterTypes.DropdownMulti,
    selectionOptions: [
      {
        status: 'draft',
        label: 'Draft'
      },
      {
        status: 'submitted-accepted',
        label: 'Submitted/Accepted'
      },
      {
        status: 'report-submitted',
        label: 'Report submitted'
      },
      {
        status: 'rejected',
        label: 'Rejected'
      },
      {
        status: 'completed',
        label: 'Completed'
      }
    ],
    optionValue: 'status',
    optionLabel: 'label',
    selectedValue: [],
    selected: true,
    minWidth: '350px',
    hideSearch: true,
    disabled: false
  },
  {
    filterName: 'Unicef Focal Point',
    filterKey: 'unicef_focal_point',
    type: EtoolsFilterTypes.DropdownMulti,
    selectionOptions: [],
    selectedValue: [],
    selected: true,
    minWidth: '350px',
    hideSearch: true,
    disabled: false,
    optionValue: 'id',
    optionLabel: 'name'
  },
  {
    filterName: 'Partner Org',
    filterKey: 'partner',
    type: EtoolsFilterTypes.DropdownMulti,
    selectionOptions: [],
    selectedValue: [],
    selected: true,
    minWidth: '350px',
    hideSearch: true,
    disabled: false,
    optionValue: 'id',
    optionLabel: 'name'
  },
  {
    filterName: 'Assessment Date',
    filterKey: 'assessment_date',
    type: EtoolsFilterTypes.Date,
    selectedValue: null,
    selected: false
  }
];

export const updateFiltersSelectedValues = (selectedFilters: GenericObject, filters: EtoolsFilter[]) => {
  const updatedFilters = [...filters];
  for (const fKey in selectedFilters) {
    if (selectedFilters[fKey]) {
      const filter = updatedFilters.find((f: EtoolsFilter) => f.filterKey === fKey);
      if (filter) {
        filter.selectedValue = selectedFilters[fKey] instanceof Array
          ? [...selectedFilters[fKey]]
          : selectedFilters[fKey];
      }
    }
  }
  return updatedFilters;
};

export const updateFilterSelectionOptions = (filters: EtoolsFilter[], fKey: string, options: GenericObject[]) => {
  const filter = filters.find((f: EtoolsFilter) => f.filterKey === fKey);
  if (filter) {
    if (!isJsonStrMatch(filter.selectionOptions, options)) {
      filter.selectionOptions = [...options];
      filters = [...filters];
    }
  }
  return filters;
};
