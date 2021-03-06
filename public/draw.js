//buil an equalizer with multiple biquad filters

var audioCtx = window.AudioContext || window.webkitAudioContext;
//crossorigin="anonymous"

var canvas;
var audioContext, canvasContext;
var analyser;
var dataArray, bufferLength;

var width, height;
var showNo = 0;
var maxTime = 1;
var minTIme = 0;

// PHS
var headerLength;
var ns;
var signalColor = 'black';
var axisColor   = 'black';
var backgroundColor = 'white';

var canvases = [];
var canvasContexts = [];


window.onload = function() {
  audioContext= new audioCtx();
  
  loadmp3canvas();
  canvases[0] = canvas;
  canvasContexts[0] = canvas.getContext('2d');

  buildAudioGraph();
  
  requestAnimationFrame(visualize2);

  canvasContexts[0] = canvas.getContext('2d');
};





function loadmp3canvas() {
  var canvas  = document.getElementById("Canvas0");
  width = canvas.width;
  height = canvas.height;
  canvasContext = canvas.getContext('2d');
};




function appendCanvases() {
  mainDiv = document.getElementById("myscreen");
  for (i =1; i < ns; ++i) {
    canvases[i] = canvases[0].cloneNode(true);
    canvases[i].setAttribute("id","");
    canvasContexts[i] = canvases[i].getContext('2d');;
    mainDiv.appendChild(canvases[i]);
  }
}

function readFileContent(files,binary)
{
  var reader = new FileReader();

  reader.onload = function(e) {
    var content = e.target.result;
    readEdvHeader(content);
    readEdvSignals(content,headerLength,signalHeaders);
    appendCanvases();
    for (i=0; i < ns; ++i) {
      drawWaveform(canvasContexts[i],signals[i], signalHeaders[i]);
    }
  };
  // Executed first: start reading the file asynchronously, will call the
  // reader.onload callback only when the file is read entirely
  reader.readAsArrayBuffer(files[0]);
}

function setDrawMin(newMinTime){
  minTime = newMinTime;
//  drawWaveform(signals[showNo], signalHeaders[showNo])
}

function setDrawMax(newMaxTime) {
  maxTime = newMaxTime;
 // drawWaveform(signals[showNo], signalHeaders[showNo])
}

function drawWaveform(canvasContext,signal, signalHeader) {
  clearCanvas(canvasContext);

  var showPct = 1;// maxTime-minTime;
console.log("showPct: "+showPct);
  var sliceWidth = width /(signalHeader.samplesCount*showPct);
  sigHeight = signalHeader.digitalMaximum-signalHeader.digitalMinimum;

  canvasContext.lineWidth = 1;
  canvasContext.strokeStyle = axisColor;
  canvasContext.beginPath();
  if (signalHeader.digitalMaximum >= 0 && signalHeader.digitalMinimum <= 0) {
    // draw zero line
    var y = height*(sigHeight + signalHeader.digitalMinimum )/ sigHeight;
    canvasContext.moveTo(0, y);
    canvasContext.lineTo(width, y);
  }
  canvasContext.stroke();  
  
  canvasContext.beginPath(); 
  canvasContext.lineWidth = 1;
  canvasContext.strokeStyle = signalColor;
  var x = 0;
  for(var i = 0; i < signalHeader.samplesCount; i++) {
 //   console.log(i+" "+signal[i]);
     var y = height*(sigHeight - (signal[i]-signalHeader.digitalMinimum) )/ sigHeight;
    
     if(i === 0) {
        canvasContext.moveTo(x, y);
     } else {
        canvasContext.lineTo(x, y);
     }
     x += sliceWidth;
  }
  canvasContext.stroke(); 

  canvasContext.restore();
}

function clearCanvas(canvasContext) {
   canvasContext.save();
  
  canvasContext.fillStyle =  backgroundColor;
  canvasContext.fillRect(0, 0, width, height);
  
  canvasContext.restore();
}

function readEdvSignals(content,startPos,signalHeaders)
{
  signals = [];
  var i;
  //console.log("startpos: "+startPos)
  for ( i = 0, pos = startPos; i < ns; ++i) {
      signals[i] = new Int16Array(content,pos,signalHeaders[i].samplesCount);
      pos +=  2*signalHeaders[i].samplesCount;
      //console.log("pos: "+pos)
  } ;
}

function readEdvHeader(buffer)
{

  var header = String.fromCharCode.apply(null, new Uint8Array(buffer.slice(0,192)));

//HEADER RECORD (we suggest to also adopt the 12 simple additional EDF+ specs)
  pos = 0; var len = 0; 
  version ="";
  readVersion(header,pos);
  // afgør om der skal fortsættes
  console.log("version: "+version+" "+parseInt(version))
  if (parseInt(version) != 0) {
    console.log("This software only handles EPS");
  }

  // read fixed header1
  len = 80; var patientId    = header.substring(pos,pos+len-1);  pos+=len;//80 ascii : local patient identification (mind item 3 of the additional EDF+ specs); pos+=len;
  len = 80; var recordingId  = header.substring(pos,pos+len-1);  pos+=len;//80 ascii : local recording identification (mind item 4 of the additional EDF+ specs); pos+=len;
  len =  8; var startDate    = header.substring(pos,pos+len-1);  pos+=len;//8 ascii : startdate of recording (dd.mm.yy) (mind item 2 of the additional EDF+ specs); pos+=len;
  len =  8; var startime     = header.substring(pos,pos+len-1);  pos+=len;//8 ascii : starttime of recording (hh.mm.ss); pos+=len;
  len =  8; headerLength     = parseInt(header.substring(pos,pos+len-1));  pos+=len;//parseInt(header.substring(184,191)); // var 8 ascii : number of bytes in header record

  header   = String.fromCharCode.apply(null, new Uint8Array(buffer.slice(0,headerLength-1)));
//  document.getElementById("fileContent").value=fullheader;

  // read fixed header2
  len = 44; var reservedField = header.substring(pos,pos+len-1);  pos+=len; //44 ascii : reserved 
  len =  8; var numberOfData = header.substring(pos,pos+len-1);  pos+=len;  //8 ascii : number of data records (-1 if unknown, obey item 10 of the additional EDF+ specs) 
  len =  8; var duration     = header.substring(pos,pos+len-1);  pos+=len;  //8 ascii : duration of a data record, in seconds 
  len =  4; ns           = header.substring(pos,pos+len-1);  pos+=len;  //4 ascii : number of signalHeaders (ns) in data record

  signalHeaders = [];
  if (ns <= 0) {
      console.log("no signals");
  } else {

    readSignalHeaders(header,ns);
  }

  document.getElementById("fileContent").value = JSON.stringify(signalHeaders);

}

function readVersion(header)
{
  len = 8; version      = header.substring(pos,pos+len-1);  pos+=len;//  8 ascii : version of this data format (0);  
}

function readSignalHeaders(header,ns)
{
  var i = 0;
  for ( i = 0; i < ns; ++i) {
    signalHeaders[i] = {};
   //console.log(signalHeaders[i])
  } ;
    console.log(signalHeaders[ns-1])
  // ns * 16 ascii : ns * label (e.g. EEG Fpz-Cz or Body temp) (mind item 9 of the additional EDF+ specs)
  len = 16; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].label = header.substring(pos,pos+len-1);
      pos+=len;
  } ;

  // ns * 80 ascii : ns * transducer type (e.g. AgAgCl electrode) 
  len = 80; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].transducerType = header.substring(pos,pos+len-1);
      pos+=len;
  } ;

    // ns * 8 ascii : ns * physical dimension (e.g. uV or degreeC) 
  len = 8; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].physicalDimension = header.substring(pos,pos+len-1);
      pos+=len;
  } ;

   // ns * 8 ascii : ns * physical minimum (e.g. -500 or 34) 
  len = 8; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].physicalMinimum = parseFloat(header.substring(pos,pos+len-1));
      pos+=len;
  } ;

   // ns * 8 ascii : ns * physical maximum (e.g. 500 or 40) 
  len = 8; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].physicalMaximum = parseFloat(header.substring(pos,pos+len-1));
      pos+=len;
  } ;

    // ns * 8 ascii : ns * digital minimum (e.g. -2048) 
  len = 8; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].digitalMinimum = parseInt(header.substring(pos,pos+len-1));
      pos+=len;
  } ;

   // ns * 8 ascii : ns * digital maximum (e.g. 2047) 
   len = 8; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].digitalMaximum = parseInt(header.substring(pos,pos+len-1));
      pos+=len;
  } ;

   // ns * 80 ascii : ns * prefiltering (e.g. HP:0.1Hz LP:75Hz) 
  len = 80; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].prefiltering = header.substring(pos,pos+len-1);
      pos+=len;
  } ;

  // ns * 8 ascii : ns * nr of samples in each data record 
  len = 8; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].samplesCount = parseInt(header.substring(pos,pos+len-1));
      pos+=len;
  } ;

  // ns * 32 ascii : ns * reserved
  len = 32; 
  for ( i = 0; i < ns; ++i) {
      signalHeaders[i].reserved = header.substring(pos,pos+len-1);
      pos+=len;
  } ;
}

//---------------------------------------------------------------------------------
// Load a binary file from a URL as an ArrayBuffer.
function downloadFile(url) {
  //var xhr = new XMLHttpRequest();
  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    throw new Error('CORS not supported');
  }


  xhr.open('GET', url, true);

  xhr.responseType = 'arraybuffer'; // THIS IS NEW WITH HTML5!
  xhr.onload = function(e) {
    console.log("Song downloaded, decoding...");
//    initSound(this.response); // this.response is an ArrayBuffer.
  };
  xhr.onerror = function(e) {
    console.log("error downloading file");
  }

  xhr.send();
  console.log("Ajax request sent... wait until it downloads completely");
}

// eksempel 1 fra internet

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();

  if ("withCredentials" in xhr) {
       console.log("-- with Credentials");
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
           console.log("-- IE");
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
           console.log("-- CORS not supported");
    // CORS not supported.
    xhr = null;
  }

  return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

// Make the actual CORS request.
function makeCorsRequest(url) {
  // All HTML5 Rocks properties support CORS.
  //var url2 = 'https://updates.html5rocks.com';

  var xhr = createCORSRequest('GET', url);

  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
          console.log("-- Loading, Loading");
    var text = xhr.responseText;
//    var title = getTitle(text);
    var title = "test"
    alert('Response from CORS request to ' + url + ': ' + title);
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  //xhr.withCredentials = true;      // AALOWS COOKIES. Server must also allow. Set only when cookies are needed

  xhr.send();
    console.log("Ajax request sent... wait until it downloads completely");
}
//--------------------------------------------------------------------------------------






function buildAudioGraph() {
  var mediaElement = document.getElementById('player');
  var sourceNode =   audioContext.createMediaElementSource(mediaElement);
  
  // Create an analyser node
  analyser = audioContext.createAnalyser();
  
  // Try changing for lower values: 512, 256, 128, 64...
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);
}

function visualize2() {
  console.log("Vizualization");
    canvasContext.save();
    canvasContext.fillStyle = "rgba(0, 0, 0, 0.05)";
    canvasContext.fillRect (0, 0, width, height);

    analyser.getByteFrequencyData(dataArray);
    var nbFreq = dataArray.length;
    
    var SPACER_WIDTH = 5;
    var BAR_WIDTH = 2;
    var OFFSET = 100;
    var CUTOFF = 23;
    var HALF_HEIGHT = height/2;
    var numBars = 1.7*Math.round(width / SPACER_WIDTH);
    var magnitude;
  
    canvasContext.lineCap = 'round';

    for (var i = 0; i < numBars; ++i) {
       magnitude = 0.3*dataArray[Math.round((i * nbFreq) / numBars)];
        
       canvasContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
       canvasContext.fillRect(i * SPACER_WIDTH, HALF_HEIGHT, BAR_WIDTH, -magnitude);
       canvasContext.fillRect(i * SPACER_WIDTH, HALF_HEIGHT, BAR_WIDTH, magnitude);

    }
    
    // Draw animated white lines top
    canvasContext.strokeStyle = "white";
    canvasContext.beginPath();

    for (i = 0; i < numBars; ++i) {
        magnitude = 0.3*dataArray[Math.round((i * nbFreq) / numBars)];
          if(i > 0) {
            //console.log("line lineTo "  + i*SPACER_WIDTH + ", " + -magnitude);
            canvasContext.lineTo(i*SPACER_WIDTH, HALF_HEIGHT-magnitude);
        } else {
            //console.log("line moveto "  + i*SPACER_WIDTH + ", " + -magnitude);
            canvasContext.moveTo(i*SPACER_WIDTH, HALF_HEIGHT-magnitude);
        }
    }
    for (i = 0; i < numBars; ++i) {
        magnitude = 0.3*dataArray[Math.round((i * nbFreq) / numBars)];
          if(i > 0) {
            //console.log("line lineTo "  + i*SPACER_WIDTH + ", " + -magnitude);
            canvasContext.lineTo(i*SPACER_WIDTH, HALF_HEIGHT+magnitude);
        } else {
            //console.log("line moveto "  + i*SPACER_WIDTH + ", " + -magnitude);
            canvasContext.moveTo(i*SPACER_WIDTH, HALF_HEIGHT+magnitude);
        }
    }    
    canvasContext.stroke();
    
    canvasContext.restore();
  
  requestAnimationFrame(visualize2);
}
