import React from 'react';
import RTCMultiConnection from "./RTCMultiConnection.js";
import nokia from '/nokia.mp3';

const VideoServer = props => {

    let connection;
    const [initiator, setInitiator] = React.useState(false);

    React.useEffect(() => {

        console.log("VideoServer ...");
        connection = new RTCMultiConnection();
        connection.socketURL = 'https://young-ridge-01369.herokuapp.com/';
        connection.enableLogs = false;
        connection.autoCreateMediaElement = false;
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };

        // STAR_FIX_VIDEO_AUTO_PAUSE_ISSUES
        // via: https://github.com/muaz-khan/RTCMultiConnection/issues/778#issuecomment-524853468
        var bitrates = 512;
        var resolutions = 'Ultra-HD';
        var videoConstraints = {};

        if (resolutions == 'HD') {
            videoConstraints = {
                width: {
                    ideal: 1280
                },
                height: {
                    ideal: 720
                },
                frameRate: 30
            };
        }

        if (resolutions == 'Ultra-HD') {
            videoConstraints = {
                width: {
                    ideal: 1920
                },
                height: {
                    ideal: 1080
                },
                frameRate: 30
            };
        }

        connection.mediaConstraints = {
            video: videoConstraints,
            audio: true
        };

        var CodecsHandler = connection.CodecsHandler;

        connection.processSdp = function(sdp) {
            var codecs = 'vp8';
            
            if (codecs.length) {
                sdp = CodecsHandler.preferCodec(sdp, codecs.toLowerCase());
            }

            if (resolutions == 'HD') {
                sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
                    audio: 128,
                    video: bitrates,
                    screen: bitrates
                });

                sdp = CodecsHandler.setVideoBitrates(sdp, {
                    min: bitrates * 8 * 1024,
                    max: bitrates * 8 * 1024,
                });
            }

            if (resolutions == 'Ultra-HD') {
                sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
                    audio: 128,
                    video: bitrates,
                    screen: bitrates
                });

                sdp = CodecsHandler.setVideoBitrates(sdp, {
                    min: bitrates * 8 * 1024,
                    max: bitrates * 8 * 1024,
                });
            }

            return sdp;
        };
        // https://www.rtcmulticonnection.org/docs/iceServers/
        // use your own TURN-server here!
        
        connection.iceServers = [];

        connection.iceServers.push({
            'urls': [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun.l.google.com:19302?transport=udp',
            ]
        });

        connection.iceServers.push({
            urls: 'turn:numb.viagenie.ca',
            credential: 'imran2003jeba',
            username: 'imran.islam011@gmail.com'
        });


        connection.openOrJoin(props.room, (isRoomExist, roomid, error) => {
            if (connection.isInitiator === true) {
                setInitiator(true);
                document.getElementsByClassName("audio-element")[0].play();
            } else {
                setInitiator(false);
            }

            if (error) {
                alert(error);
            }
        });

        connection.onstream = function(event) {

            const existing = document.getElementById(event.streamid);
            if(existing && existing.parentNode) {
              existing.parentNode.removeChild(existing);
            }

            const video = document.createElement('video');
            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
            } catch (e) {
                video.setAttribute('autoplay', true);
                video.setAttribute('playsinline', true);
            }

            video.style.transform = "scaleX(-1)";
            video.style.width = "100%";
            video.style.height = "auto";

            if(event.type === 'local') {
                video.classList.add("local");
                video.volume = 0;
                try {
                    video.setAttributeNode(document.createAttribute('muted'));
                } catch (e) {
                    video.setAttribute('muted', true);
                }
            }

            if (event.type === 'remote') {
                video.classList.add("remote");
                setInitiator(false);

                if (!window.matchMedia("(max-width: 600px)").matches) {
                    let localVideo = document.querySelectorAll(".local");
                    localVideo[0].style.position = "fixed";
                    localVideo[0].style.width = "25%";
                    video.style.position = "fixed";
                }
                document.getElementsByClassName("audio-element")[0].pause();
            }

            video.srcObject = event.stream;
            video.id = event.streamid;
            // connection.videosContainer.appendChild(video);
            document.body.insertBefore(video, document.body.firstChild);

        };

        connection.onstreamended = function(event) {
            const video = document.getElementById(event.streamid);
            if (video && video.parentNode) {
                video.parentNode.removeChild(video);
            }
        };

    }, []);

   
    const rejectCall = () => {
        try {
            connection.getAllParticipants().forEach(pid => {
                connection.disconnectWith(pid);
            });
            connection.attachStreams.forEach(localStream => {
                localStream.stop();
            });
            connection.closeSocket();
        }catch (e) {
            console.log("No Participants Found");
        }finally {
            window.close();
        }
    };


    return <>

        <audio className="audio-element" loop>
            <source src={nokia}/>
        </audio>

        <div className="content">
            <a onClick={rejectCall} className="fa fa-phone"/>                
            {initiator && <p>Calling...</p>}
        </div>
    </>;
};

export default VideoServer;

