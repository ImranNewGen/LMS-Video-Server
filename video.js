import React from 'react';
import ReactDOM from 'react-dom';
import VideoServer from "./VideoServer";
import './video.css';

const params = new URLSearchParams(window.location.search);
let audio = false;

if (Boolean(params.get('audio'))) {
    if (params.get('audio') === 'true') {
        audio = true;
    }
}
console.log(audio);

const Main = () => {

    if (!Boolean(params.get('room'))) {
        return <p style={{color:"white"}}>Invalid Room ...</p>;
    }

    return <VideoServer room={params.get('room')} audio={audio}/>;
};

ReactDOM.render(<Main/>, document.querySelector('#app'));
