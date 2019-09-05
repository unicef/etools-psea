import '@polymer/paper-button/paper-button';
import {customElement, html, LitElement, property} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../redux/store';

import '../../common/layout/page-content-header/page-content-header';
import {pageContentHeaderSlottedStyles}
  from '../../common/layout/page-content-header/page-content-header-slotted-styles';

import {pageLayoutStyles} from '../../styles/page-layout-styles';

import {GenericObject} from '../../../types/globals';
import '../../common/layout/filters/etools-filters';
import {updateFilterSelectionOptions} from './list/filters';
import {EtoolsFilter} from '../../common/layout/filters/etools-filters';
import {ROOT_PATH} from '../../../config/config';
import {elevationStyles} from '../../styles/lit-styles/elevation-styles';
import '../../common/layout/etools-table/etools-table';
import {
  EtoolsTableColumn,
  EtoolsTableColumnSort,
  EtoolsTableColumnType
} from '../../common/layout/etools-table/etools-table';
import {defaultPaginator, EtoolsPaginator, getPaginator} from '../../common/layout/etools-table/pagination/paginator';
import {
  buildUrlQueryString,
  EtoolsTableSortItem, getSelectedFiltersFromUrlParams,
  getSortFields, getSortFieldsFromUrlSortParams,
  getUrlQueryStringSort
} from '../../common/layout/etools-table/etools-table-utility';

import {defaultSelectedFilters, engagementsFilters, updateFiltersSelectedValues} from './list/filters';
import {RouteDetails, RouteQueryParams} from '../../../routing/router';
import {updateAppLocation} from '../../../routing/routes';
import {buttonsStyles} from '../../styles/button-styles';
import {fireEvent} from '../../utils/fire-custom-event';
import {SharedStylesLit} from '../../styles/shared-styles-lit';
import {etoolsEndpoints} from '../../../endpoints/endpoints-list';
import {makeRequest} from '../../utils/request-helper';

/**
 * @LitElement
 * @customElement
 */
@customElement('assessment-list')
export class AssessmentsList extends connect(store)(LitElement) {

  static get styles() {
    return [elevationStyles];
  }

  public render() {
    // main template
    // language=HTML
    return html`
      ${SharedStylesLit} ${pageContentHeaderSlottedStyles} ${pageLayoutStyles} ${buttonsStyles}
      <style>
        etools-table {
          padding-top: 12px;
        }
      </style>
      <page-content-header>
        <h1 slot="page-title">Assessments list</h1>

        <div slot="title-row-actions" class="content-header-actions">
          <paper-button class="default left-icon" raised @tap="${this.exportAssessments}">
            <iron-icon icon="file-download"></iron-icon>Export
          </paper-button>

          <paper-button class="primary left-icon" raised @tap="${this.goToAddnewPage}">
            <iron-icon icon="add"></iron-icon>Add new assessment
          </paper-button>
        </div>
      </page-content-header>

      <section class="elevation page-content filters" elevation="1">
        <etools-filters .filters="${this.filters}"
                        @filter-change="${this.filtersChange}"></etools-filters>
      </section>

      <section class="elevation page-content no-padding" elevation="1">
        <etools-table .columns="${this.listColumns}"
                      .items="${this.listData}"
                      .paginator="${this.paginator}"
                      @paginator-change="${this.paginatorChange}"
                      @sort-change="${this.sortChange}"></etools-table>
      </section>
    `;
  }

  /**
   * TODO:
   *  1. init filters and sort params: default values or values from routeDetails object
   *  2. make engagements data request using filters and sorting params
   *  3. on engagements req success init paginator, list page data and update url params if needed
   *  4. on filters-change, parinator-change, sort-change trigger a new request for engagements data (repeat 2 and 3)
   *  5. add loading...
   *  6. hide etools-pagination if there are fewer results then first page_size option
   *  7. when navigating from details page to list all list req params are preserved and we need to avoid
   *  a duplicated request to get data. This can be done by adding a new list queryParams state in redux
   *  and use it in app-menu component to update menu option url
   *  8. test filters menu and prevend request triggered by filter select only action
   */

  @property({type: Object})
  routeDetails!: RouteDetails;

  @property({type: String})
  rootPath: string = ROOT_PATH;

  @property({type: Object})
  paginator: EtoolsPaginator = {...defaultPaginator};

  @property({type: Array})
  sort: EtoolsTableSortItem[] = [{name: 'ref_number', sort: EtoolsTableColumnSort.Desc}];

  @property({type: Array})
  filters: EtoolsFilter[] = [...engagementsFilters];

  @property({type: Object})
  selectedFilters: GenericObject = {...defaultSelectedFilters};

  @property({type: Array})
  listColumns: EtoolsTableColumn[] = [
    {
      label: 'Reference No.',
      name: 'reference_number',
      link_tmpl: `${ROOT_PATH}assessments/:id/details`,
      type: EtoolsTableColumnType.Link
    },
    {
      label: 'Assessment Date',
      name: 'assessment_date',
      type: EtoolsTableColumnType.Date,
      sort: EtoolsTableColumnSort.Desc
    },
    {
      label: 'Partner Org',
      name: 'partner_name',
      type: EtoolsTableColumnType.Text,
      sort: EtoolsTableColumnSort.Asc
    },
    {
      label: 'Status',
      name: 'status',
      type: EtoolsTableColumnType.Text,
      capitalize: true
    },
    {
      label: 'Assessor',
      name: 'assessor',
      type: EtoolsTableColumnType.Text
    },
    {
      label: 'Rating',
      name: 'rating',
      type: EtoolsTableColumnType.Text
    }
  ];

  @property({type: Array})
  listData: GenericObject[] = [];


  stateChanged(state: RootState) {
    if (state.app!.routeDetails.routeName === 'assessments' &&
      state.app!.routeDetails.subRouteName === 'list') {

      if (state.commonData) {
        this.filters = updateFilterSelectionOptions(this.filters, 'unicef_focal_point', state.commonData!.unicefUsers);
        this.filters = updateFilterSelectionOptions(this.filters, 'partner', state.commonData!.partners);
      }

      const stateRouteDetails = {...state.app!.routeDetails};
      if (JSON.stringify(stateRouteDetails) !== JSON.stringify(this.routeDetails)) {
        this.routeDetails = stateRouteDetails;
        if (!this.routeDetails.queryParams || Object.keys(this.routeDetails.queryParams).length === 0) {
          // update url with params
          this.updateUrlListQueryParams();
          return;
        } else {
          // init filters, sort, page, page_size from url params
          this.updateListParamsFromRouteDetails(this.routeDetails.queryParams);
          this.getAssessmentsData();
        }
      }
    }
  }

  updateUrlListQueryParams() {
    const qs = this.getParamsForQuery();
    updateAppLocation(`${this.routeDetails.path}?${qs}`, true);
  }

  getParamsForQuery() {
    const params = {
      ...this.selectedFilters,
      page: this.paginator.page,
      page_size: this.paginator.page_size,
      sort: getUrlQueryStringSort(this.sort)
    };
    return buildUrlQueryString(params);
  }

  updateListParamsFromRouteDetails(queryParams: RouteQueryParams) {
    // update sort fields
    if (queryParams.sort) {
      this.sort = getSortFieldsFromUrlSortParams(queryParams.sort);
    }

    // update paginator fields
    const paginatorParams: GenericObject = {};
    if (queryParams.page) {
      paginatorParams.page = Number(queryParams.page);
    }
    if (queryParams.page_size) {
      paginatorParams.page_size = Number(queryParams.page_size);
    }
    this.paginator = {...this.paginator, ...paginatorParams};

    // update filters
    this.selectedFilters = getSelectedFiltersFromUrlParams(this.selectedFilters, queryParams);
    this.filters = updateFiltersSelectedValues(this.selectedFilters, this.filters);
  }

  filtersChange(e: CustomEvent) {
    this.selectedFilters = {...this.selectedFilters, ...e.detail};
    this.updateUrlListQueryParams();
  }

  paginatorChange(e: CustomEvent) {
    const newPaginator = {...e.detail};
    this.paginator = newPaginator;
    this.updateUrlListQueryParams();
  }

  sortChange(e: CustomEvent) {
    this.sort = getSortFields(e.detail);
    this.updateUrlListQueryParams();
  }

  /**
   * This method runs each time new data is received from routeDetails state
   * (sort, filters, paginator init/change)
   */
  getAssessmentsData() {
    let endpoint = {url: etoolsEndpoints.assessment.url + `?${this.getParamsForQuery()}`};
    return makeRequest(endpoint).then((response: GenericObject) => {
      this.paginator = getPaginator(this.paginator, response);
      this.listData = [...response.results];
    })
      .catch((err: any) => console.error(err));
  }

  exportAssessments() {
    // const exportParams = {
    //   ...this.selectedFilters
    // };

    // TODO: implement export using API endpoint
    fireEvent(this, 'toast', {text: 'Not implemented... waiting for API...'});
  }

  goToAddnewPage() {
    updateAppLocation('/assessments/new/details', true);
  }
}