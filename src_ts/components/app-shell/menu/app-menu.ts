import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/maps-icons.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-toggle-button/paper-toggle-button';
import {PaperToggleButtonElement} from '@polymer/paper-toggle-button';
import {pseaIcon} from '../../styles/app-icons';
import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '../../utils/fire-custom-event';
import {
  ACCESIBILITY_MODE_LOCALSTORAGE_KEY,
  ROOT_PATH,
  SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY
} from '../../../config/config';
import {customElement, html, LitElement, property} from 'lit-element';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('app-menu')
export class AppMenu extends LitElement {
  static get styles() {
    return [navMenuStyles];
  }

  public render() {
    // main template
    // language=HTML
    return html`
      ${pseaIcon}
      <div class="menu-header">
        <span id="app-name">
          PSEA <br />
          ASSURANCE
        </span>

        <span class="ripple-wrapper main">
          <iron-icon
            id="menu-header-top-icon"
            icon="main-icon:psea-icon"
            @tap="${() => this._toggleSmallMenu()}"
          ></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>

        <paper-tooltip for="menu-header-top-icon" position="right"> PSEA Assessments </paper-tooltip>

        <span class="chev-right">
          <iron-icon id="expand-menu" icon="chevron-right" @tap="${() => this._toggleSmallMenu()}"></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>

        <span class="ripple-wrapper">
          <iron-icon id="minimize-menu" icon="chevron-left" @tap="${() => this._toggleSmallMenu()}"></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>
      </div>

      <div class="nav-menu">
        <iron-selector .selected="${this.selectedOption}" attr-for-selected="menu-name" role="navigation">
          <a class="nav-menu-item" href="${this.rootPath + 'assessments/list'}" menu-name="assessments">
            <iron-icon id="assessments-list-opt" icon="settings-applications"></iron-icon>
            <paper-tooltip for="assessments-list-opt" position="right"> PSEA Assessments </paper-tooltip>
            <div class="name">PSEA Assessments</div>
          </a>
        </iron-selector>

        <div class="nav-menu-item section-title">
          <span>Accesibility Tools</span>
        </div>
        <div class="pnl-toggle">
          <paper-tooltip for="toggleTheme" offset="0" position="right" ?hidden="${!this.smallMenu}">
            Increase Text Contrast
          </paper-tooltip>
          <paper-toggle-button
            id="toggleTheme"
            ?checked="${this.isAccessibilityTheme}"
            @iron-change="${this.toggleTheme}"
          >
            ${this.getToggleText(this.smallMenu)}
          </paper-toggle-button>
        </div>

        <div class="nav-menu-item section-title">
          <span>eTools Community Channels</span>
        </div>

        <a class="nav-menu-item lighter-item" href="http://etools.zendesk.com" target="_blank">
          <iron-icon id="knoledge-icon" icon="maps:local-library"></iron-icon>
          <paper-tooltip for="knoledge-icon" position="right"> Knowledge base </paper-tooltip>
          <div class="name">Knowledge base</div>
        </a>

        <a
          class="nav-menu-item lighter-item"
          href="https://www.yammer.com/unicef.org/#/threads/inGroup?type=in_group&feedId=5782560"
          target="_blank"
        >
          <iron-icon id="discussion-icon" icon="icons:question-answer"></iron-icon>
          <paper-tooltip for="discussion-icon" position="right"> Discussion </paper-tooltip>
          <div class="name">Discussion</div>
        </a>

        <a class="nav-menu-item lighter-item last-one" href="https://etools.unicef.org/landing" target="_blank">
          <iron-icon id="information-icon" icon="icons:info"></iron-icon>
          <paper-tooltip for="information-icon" position="right"> Information </paper-tooltip>
          <div class="name">Information</div>
        </a>
      </div>
    `;
  }

  @property({type: String, attribute: 'selected-option'})
  public selectedOption = '';

  @property({type: String})
  rootPath: string = ROOT_PATH;

  @property({type: Boolean, attribute: 'small-menu'})
  public smallMenu = false;

  @property({type: Boolean})
  isAccessibilityTheme = false;

  public connectedCallback() {
    super.connectedCallback();

    this.isAccessibilityTheme = localStorage.getItem(ACCESIBILITY_MODE_LOCALSTORAGE_KEY) === 'true';
    this.setAppTheme();
  }

  public _toggleSmallMenu(): void {
    this.smallMenu = !this.smallMenu;
    const localStorageVal: number = this.smallMenu ? 1 : 0;
    localStorage.setItem(SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY, String(localStorageVal));
    fireEvent(this, 'toggle-small-menu', {value: this.smallMenu});
  }

  protected toggleTheme(e: any) {
    const isAccessibilityTheme = (e.target as PaperToggleButtonElement).checked;
    if (this.isAccessibilityTheme !== isAccessibilityTheme) {
      this.isAccessibilityTheme = !this.isAccessibilityTheme;
      localStorage.setItem(ACCESIBILITY_MODE_LOCALSTORAGE_KEY, String(this.isAccessibilityTheme));
      this.setAppTheme();
    }
  }

  private setAppTheme() {
    const body = document.body;

    if (this.isAccessibilityTheme) {
      body.classList.remove('default');
      body.classList.add('accessible');
    } else {
      body.classList.remove('accessible');
      body.classList.add('default');
    }
  }

  private getToggleText(smallMenu: boolean) {
    return smallMenu ? '' : ' Increase Text Contrast';
  }
}
