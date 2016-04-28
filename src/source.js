//----- External -----
import d3 from 'd3'
window.d3 = d3

import _ from 'lodash'
window._ = _

import logger from 'bragi-browser';
logger.transports.get('console').property('showMeta', false);
window.logger = logger;

//----- Internal -----
// http://www.2ality.com/2014/09/es6-modules-final.html
// import { myConst, myFunc } from 'lib';
// import * as lib from 'lib';
// import _, { myFunc } from 'lib'; // _ default, { each } named, default is also named

import * as UI from 'js/ui';
import * as chart from 'js/chart';
import { process } from 'js/process';

//----- Runtime -----
function app() {
  logger.log('app', 'Loaded');
  
  d3.json('data.json', function(error, data) {
    if (error) return console.warn(error);
    
    const render = function render(filter) {
      chart.draw(process(data, filter))
    }
    
    UI.load(data, render);
  });
}

function onReady(fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

onReady(app);