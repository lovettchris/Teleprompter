import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import InputFile from './inputfile';
// eslint-disable-next-line
import App from './App';
import * as serviceWorker from './serviceWorker';
// eslint-disable-next-line
import { saveAs } from 'file-saver';
import $ from 'jquery';

function getSeconds(s) {
  var p = s.split(':');
  if (p.length === 3) {
    var hours = parseInt(p[0]);
    var minutes = parseInt(p[1]);
    var seconds = parseFloat(p[2]);
    return (hours * 3600) + (minutes * 60) + seconds;
  }
  return 0;
}

class CCEntry extends React.Component
{
  constructor(props, i, r, p)
  {
    super(props);

    var s = "";
    var e = "";
    var parts = r.split("-->");
    if (parts.length === 2) {
      s = parts[0];
      e = parts[1];
    }

    this.state = {index: i, range: r, start: getSeconds(s), end: getSeconds(e), prompt: p};

    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  handleMouseDown(e){
    e.target.contentEditable = true;
  }

  render() {
    return <div key={this.state.index}>
      <div className="srt-range">{this.state.range}</div>
      <xmp className="srt-prompt" onMouseDown={this.handleMouseDown} >{this.state.prompt}</xmp>
    </div>;
  }
}

class CCTable extends React.Component
{
  constructor(props) {
    super(props);
    this.state = {entries: []};
    this.loadFile = this.loadFile.bind(this)
  }

  parseSrt(text)
  {
    var entries = []
    var lines = text.split("\n");
    var pos = 0;
    var count = lines.length;
    while (pos < count)
    {
      var index = parseInt(lines[pos++]);
      if (isNaN(index) || pos >= count) {
        break;
      }
      var range = lines[pos++].trim();
      if (pos >= count) {
        break;
      }
      // consume the entire prompt up to next blank line.
      var prompt = lines[pos++].trim();
      while (pos < count && lines[pos].trim() !== "")
      {
        prompt += '\n' + lines[pos++].trim();
      }

      // skip blank lines.
      while (pos < count && lines[pos].trim() === ""){
        pos++;
      }

      entries.push(new CCEntry({}, index, range, prompt));
    }
    this.setState({entries: entries});

    if (window.onsrtloaded){
      // give this to index.html...
      window.onsrtloaded(entries);
    }

    return entries;
  }

  loadFile(e) {
    var file = e.target.files[0];
    window.file = file;
    var reader = new FileReader();
    var foo = this;
    reader.onload = function(e) {
      foo.parseSrt(e.target.result);
    };

    // Read in the srt file as a data URL.
    reader.readAsText(file);
  }

  render() {
    const rows = [];
    let i;
    for (i = 0; i < this.state.entries.length; i++)
    {
      rows.push(this.state.entries[i].render());
    }
    return <div className="srt-wrapper">
      <div>
        SRT location:<br/>
        <InputFile id="SrtUrl" value="" className="fileprompt" accept=".srt, .txt"
               onChange={ this.loadFile } />
      </div>
      <div id="ccEntries" className="srt-table" >
        {rows}
      </div>
    </div>;
  }

  componentDidUpdate(){
    if (window.handle_resize){
      window.handle_resize();
    }
  }
}

class CCVideo extends React.Component
{

  constructor(props) {
    super(props);
    this.state = {url: "https://microsoft.sharepoint.com/teams/MSROutreachOnlineEngagement/Shared Documents/Webinars/Episodes/11. Project Coyote/Video/Chris_Lovett-Webinar_V3_CBR_2020-04-15.mp4"};
    this.handleVideoUrlChange = this.handleVideoUrlChange.bind(this)

  }

  handleVideoUrlChange(e) {
    var videourl = e.target.value;
    this.setState({url: videourl});
    //var videoplayersrc  = $("#videoplayersrc")[0];
    //videoplayersrc.setAttribute("src", videourl.value);
    var video  = $("#videoplayer")[0];
    video.pause();
    try {
      video.load();
      video.play();
    } catch {
      // bad url...
    }
  }

  render() {
    return <div classname="half-width">
    <div>
      Video location:<br/>
      <input type="url" id="videourl" value={this.state.url} className="half-width" onChange={this.handleVideoUrlChange}/>
    </div>
    <video id="videoplayer" className="embed-responsive-item half-width" controls >
        <source id="videoplayersrc"
          className="embed-responsive-item"
          src={this.state.url}
          type="video/mp4"/>
    </video>
    <p>
        There is an <a href="http://lovettsoftware.com/Teleprompter/Chris_Lovett-Webinar_V2_2020-04-18.srt">example SRT file</a>
        that you can download and try.
    </p>
  </div>;
  }

}

ReactDOM.render(
  <section>
    <CCTable></CCTable>
    <CCVideo></CCVideo>
  </section>,
  document.getElementById('react-root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
