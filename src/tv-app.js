// import stuff
import { LitElement, html, css } from "lit";
import "./tv-channel.js";
import "./top-bar.js";

export class TvApp extends LitElement {
  constructor() {
    super();
    this.source = new URL("../assets/channels.json", import.meta.url).href;
    this.listings = []; 
    this.id = ""; 
    this.selectedCourse = null; 
    this.activeIndex = null; 
    this.activeContent = ""; 
    this.itemClick = this.itemClick.bind(this); 
    this.time = ""; 
    this.farthestIndex = 0; 
  }


  connectedCallback() {
    super.connectedCallback(); 
    this.loadInfo();
    this.contentLoader();
  }

  static get tag() {
    return "tv-app";
  }

  static get properties() {
    return {
      name: { type: String },
      source: { type: String }, 
      listings: { type: Array },
      selectedCourse: { type: Object },
      contents: { type: Array },
      id: { type: String },
      activeIndex: { type: Number },
      activeContent: { type: String },
      time: { type: String },
    };
  }
  
  static get styles() {
    return [
      css`
        :host {
          display: block;
          margin: 16px;
          padding: 16px;
        }

        .alignContent {
          display: flex;
          justify-content: flex-start;
          gap: 90px;
        }

        .course-topics {
          margin-left: -36px;
          display: flex;
          flex-direction: column;
          width: 275px;
          margin-right: 1px;
          margin-top: 25px;
          position: fixed;
          padding-top: 8px;
          padding-right: 5px;
        }

        .main {
          margin: 42px 141px 23px 386px;
          padding-top: 8px;
          padding-right: 5px;
          padding-bottom: 1px;
          padding-left: 20px;
          width: calc(100% - 291px);
          height: 100%;
          font-size: 1em;
          border: 1px solid #dadce0;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          background-color: #f8f9fa;
          font: 400 16px/24px var(--devsite-primary-font-family);
          -webkit-font-smoothing: antialiased;
          text-size-adjust: 100%;
          color: #4e5256;
          font-family: var(--devsite-primary-font-family);
          background: #f8f9fa;
        }

        .clickers {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          position: fixed;
          bottom: 0;
          right: 0;
          margin: 19px;
          width: 81vw;
        }

        #back > button {
          border-radius: 4px;
          font-family:
            Google Sans,
            Arial,
            sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.6px;
          line-height: 24px;
          padding-bottom: 6px;
          padding-left: 24px;
          padding-right: 24px;
          padding-top: 6px;
          pointer-events: auto;
          text-transform: none;
          background: #fff;
          color: #1a73e8;
          border: 0;
          box-shadow:
            0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 1px 5px 0 rgba(0, 0, 0, 0.12),
            0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
        #next > button {
          border-radius: 4px;
          font-family:
            Google Sans,
            Arial,
            sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.6px;
          line-height: 24px;
          padding-bottom: 6px;
          padding-left: 24px;
          padding-right: 24px;
          padding-top: 6px;
          pointer-events: auto;
          text-transform: none;
          background: #1a73e8;
          color: #fff;
          border: 0;
          box-shadow:
            0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 1px 5px 0 rgba(0, 0, 0, 0.12),
            0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
      `,
    ];
  }

  render() {
    const theFirstPage = this.activeIndex === 0;
    const theLastPage = this.activeIndex === this.listings.length - 1;
    return html`
      <top-bar time="${this.time}"> </top-bar>
      <div class="alignContent">
        <div class="course-topics">
          ${this.listings.map(
            (item, index) => html`
              <tv-channel
                title="${item.title}"
                id="${item.id}"
                @click="${() => this.itemClick(index)}"
                activeIndex="${this.activeIndex}"
              >
              </tv-channel>
            `,
          )}
        </div>

        <div class="main">
           <slot></slot>
        </div>

        <div class="clickers">
          <div id="back" style="$theFirstPage ? 'display: none;' : ''}">
            <button @click=${() => this.prevPage()}>Back</button>
          </div>
          <div id="next" style="$theLastPage ? 'display: none;' : ''}">
            <button @click=${() => this.nextPage()}>Next</button>
          </div>
        </div>
      </div>
    `;
  }

  renderActiveContent(){
    const slotElement = this.shadowRoot.querySelector('slot');

    if(!this.activeContent){
      slotElement.innerHTML = '';
    }

    slotElement.innerHTML = this.activeContent;

  }

  contentLoader(){
    const currActiveIndex = localStorage.getItem('activeIndex');
    const currFarthestIndex = localStorage.getItem('farthestIndex');
    if (currActiveIndex !== null && currFarthestIndex !== null){
      this.activeIndex = parseInt(storedActiveIndex, 10);
      this.farthestIndex = parseInt(storedFarthestIndex, 10);
      this.loadActiveContent();
    }
  }

  async loadInfo(){

    await fetch(this.source)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((responseData) => {
        if (responseData.status === 200 && responseData.data.items && responseData.data.items.length > 0) {
          this.listings = [...responseData.data.items];
          this.loadActiveContent();
        }
      })
      .catch((error) => { console.error('Error fetching data:', error); });
  }

  async nextPage() {
    if (this.activeIndex !== null) {
      const nextIndex = this.activeIndex + 1;
      const item = this.listings[nextIndex].location;

      const contentPath = "/assets/" + item;

      try {
        const response = await fetch(contentPath);
        this.activeContent = await response.text();
        this.renderActiveContent();
        this.activeIndex = nextIndex; 
      } catch (err) {
        console.log("fetch failed", err);
      }
    }
  }

  // function to fetch the previous content
  async prevPage() {
    if (this.activeIndex !== null) {

      const prevIndex = this.activeIndex - 1; 

      const item = this.listings[prevIndex].location; 

      const contentPath = "/assets/" + item;

      try {
        const response = await fetch(contentPath);
        this.activeContent = await response.text();
        this.renderActiveContent();
        
        this.activeIndex = prevIndex; 
      } catch (err) {
        console.log("fetch failed", err);
      }
    }
  }

  async itemClick(index) {
    this.activeIndex = index; 
    

    const item = this.listings[index].location; 
    

    this.time = this.listings[index].metadata.timecode; 
    

    const contentPath = "/assets/" + item;

    
    try {
      const response = await fetch(contentPath);
     
      const text = await response.text();
     
      this.activeContent = text; 
      this.renderActiveContent();
    } catch (err) {
      console.log("fetch failed", err);
    }
  }


  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "source" && this[propName]) {
        this.updateSourceData(this[propName]);
      }
    });
  }

 
  async updateSourceData(source) {
    await fetch(source)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((responseData) => {
        if (
          responseData.status === 200 &&
          responseData.data.items &&
          responseData.data.items.length > 0
        ) {
          this.listings = [...responseData.data.items]; 
          console.log("Listings: ", this.listings);
        }
      });
  }
}

// tell the browser about our tag and class it should run when it sees it
customElements.define(TvApp.tag, TvApp);