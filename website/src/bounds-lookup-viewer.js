import React from "react";

const GuideType = {
  VisualBounds: 0,
  RealBounds: 1,
};

const GuideElements = {
  StaveGroups: 0,
  MasterBars: 1,
  Bars: 2,
  Beats: 3,
  Notes: 4,
};

export default class BoundsLookupViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      api: null,
      type: GuideType.VisualBounds,
      elements: GuideElements.StaveGroups,
    };
  }

  componentDidMount() {
    const container = this.refs.alphaTab;
    this.state.api = new alphaTab.AlphaTabApi(container, this.props.settings);
    this.state.api.postRenderFinished.on(this.updateVisualGuides.bind(this));
  }

  updateVisualGuides() {
    const container = this.refs.alphaTab;
    let guidesWrapper = container.querySelector(".at-guides");
    if (!guidesWrapper) {
      container.style.position = "relative";
      guidesWrapper = document.createElement("div");
      guidesWrapper.classList.add("at-guides");
      guidesWrapper.style.position = "absolute";
      guidesWrapper.style.zIndex = "1000";
      guidesWrapper.style.display = "inline";
      guidesWrapper.style.pointerEvents = "none";
      guidesWrapper.style.top = 0;
      guidesWrapper.style.left = 0;
      guidesWrapper.style.right = 0;
      guidesWrapper.style.bottom = 0;
      container.insertBefore(guidesWrapper, container.firstChild);
    } else {
      guidesWrapper.innerHTML = "";
    }

    if (this.state.api.renderer.boundsLookup) {
      this.createStaveGroupGuides(
        guidesWrapper,
        this.state.api.renderer.boundsLookup
      );
    }
  }

  createStaveGroupGuides(wrapper, lookup) {
    for (const staveGroup of lookup.staveGroups) {
      if (this.state.elements === GuideElements.StaveGroups) {
        this.createGuide(wrapper, staveGroup, "#1976d2");
      } else {
        this.createMasterBarGuides(wrapper, staveGroup);
      }
    }
  }

  createMasterBarGuides(wrapper, staveGroup) {
    for (const masterBar of staveGroup.bars) {
      if (this.state.elements === GuideElements.MasterBars) {
        this.createGuide(wrapper, masterBar, "#388e3c");
      } else {
        this.createBarGuides(wrapper, masterBar);
      }
    }
  }

  createBarGuides(wrapper, masterBar) {
    for (const bar of masterBar.bars) {
      if (this.state.elements === GuideElements.Bars) {
        this.createGuide(wrapper, bar, "#fdd835");
      } else {
        this.createBeatGuides(wrapper, bar);
      }
    }
  }

  createBeatGuides(wrapper, bar) {
    for (const beat of bar.beats) {
      if (this.state.elements === GuideElements.Beats) {
        this.createGuide(wrapper, beat, "#e64a19");
      } else {
        this.createNoteGuides(wrapper, beat);
      }
    }
  }

  createNoteGuides(wrapper, beat) {
    if (beat.notes) {
      for (const note of beat.notes) {
        this.createGuide(wrapper, note.noteHeadBounds, "#512da8");
      }
    }
  }

  createGuide(wrapper, bounds, color) {
    const guide = document.createElement("div");
    guide.style.position = "absolute";
    const rect =
      "x" in bounds
        ? bounds
        : this.state.type === GuideType.VisualBounds
        ? bounds.visualBounds
        : bounds.realBounds;
    guide.style.left = rect.x + "px";
    guide.style.top = rect.y + "px";
    guide.style.width = rect.w + "px";
    guide.style.height = rect.h + "px";
    guide.style.border = `1px solid ${color}`;
    guide.style.background = BoundsLookupViewer.hexToRgba(color, 0.5);
    wrapper.appendChild(guide);
  }

  static hexToRgba(hex, alpha) {
    let c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255},${alpha})`;
  }

  componentWillUnmount() {
    this.state.api.destroy();
  }

  setType(type) {
    this.state.type = type;
    this.setState(this.state);
    this.updateVisualGuides();
  }

  setElements(element) {
    this.state.elements = element;
    this.setState(this.state);
    this.updateVisualGuides();
  }

  typeClass(ownType) {
    return ownType === this.state.type ? " active" : "";
  }

  elementClass(ownElements) {
    return ownElements === this.state.elements ? " active" : "";
  }

  render() {
    return (
      <>
        <div className="btn-toolbar" role="toolbar">
          <div className="btn-group mr-2" role="group">
            <button
              type="button"
              className={
                "btn btn-secondary" + this.typeClass(GuideType.VisualBounds)
              }
              onClick={this.setType.bind(this, GuideType.VisualBounds)}
            >
              Visual Bounds
            </button>
            <button
              type="button"
              className={
                "btn btn-secondary" + this.typeClass(GuideType.RealBounds)
              }
              onClick={this.setType.bind(this, GuideType.RealBounds)}
            >
              Real Bounds
            </button>
          </div>
          <div className="btn-group mr-2" role="group">
            <button
              type="button"
              className={
                "btn btn-secondary" +
                this.elementClass(GuideElements.StaveGroups)
              }
              onClick={this.setElements.bind(this, GuideElements.StaveGroups)}
            >
              Stave Groups
            </button>
            <button
              type="button"
              className={
                "btn btn-secondary" +
                this.elementClass(GuideElements.MasterBars)
              }
              onClick={this.setElements.bind(this, GuideElements.MasterBars)}
            >
              Master Bars
            </button>
            <button
              type="button"
              className={
                "btn btn-secondary" + this.elementClass(GuideElements.Bars)
              }
              onClick={this.setElements.bind(this, GuideElements.Bars)}
            >
              Bars
            </button>
            <button
              type="button"
              className={
                "btn btn-secondary" + this.elementClass(GuideElements.Beats)
              }
              onClick={this.setElements.bind(this, GuideElements.Beats)}
            >
              Beats
            </button>
            <button
              type="button"
              className={
                "btn btn-secondary" + this.elementClass(GuideElements.Notes)
              }
              onClick={this.setElements.bind(this, GuideElements.Notes)}
            >
              Notes
            </button>
          </div>
        </div>
        <div
          ref="alphaTab"
          data-file={this.props.file}
          data-tex={this.props.tex}
          data-includenotebounds="true"
          data-tracks={JSON.stringify(this.props.tracks)}
        >
          {this.props.children}
        </div>
      </>
    );
  }
}
