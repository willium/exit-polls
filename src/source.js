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
import * as util from 'js/util';
import * as chart from 'js/chart';
import { process } from 'js/process';

//----- Runtime -----
function app() {
  logger.log('app', 'Loaded');
  
  d3.json('data.json', function(error, data) {
    if (error) return console.warn(error);
    
    UI.load(data, render);
    
    function render(options) {
      chart.draw(process(data, options.filter), options, changeNodes);
    }
    
    function changeNodes(removed, type, options) {
      console.log(removed);
      
      if (_.isEqual(type, 'target')) {
        options.shelf.candidates = _.remove(options.filter.candidates, function(d) {
          return !_.isUndefined(_.find(removed[0], function(o) {
            return _.isEqual(o.__data__.meta.target_id, d);
          }));
        });
      }
      if (_.isEqual(type, 'source')) {
        options.shelf.answers = _.remove(options.filter.answers, function(d) {
          return !_.isUndefined(_.find(removed[0], function(o) {
            return _.isEqual(o.__data__.meta.source_rank, d);
          }));
        });
      }
      
      console.log(options);
      UI.load(data, render, options);
    }
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