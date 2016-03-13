'use strict';

import eventEmiter from 'eventemitter3';

/** Class representing basic api */
class Basic extends eventEmiter {

  /**
    * @param {String} [url] Url to pogoda api.
    * @fires Basic#init
    */
  constructor(url) {
    super();

    this.requests = 0;
    this.source = url;
    this.handleRequest();

    /**
      * Basic initialized
      * @event Basic#init
      */
    this.emit('init');
  }

  /**
    * Send request to api.
    * @param {Number} [delay] Delay request.
    */
  sendRequest(delay) {
    setTimeout(_=>
      this.prepareRequest()
        .then(::this.handleRequest), delay);
  }

  prepareRequest(firstGetParam, ...getParams) {
    let params = firstGetParam ? `?${firstGetParam}` : '';

    if (getParams)
      getParams.forEach(param => params += `&${param}`);

    return fetch(`${this.source}/basic.json${params}`).then(res => res.json());
  }

  /**
    * @param {Object} [api] emit api.
    * @fires Basic#updated
    * @fires Basic#nextUpdate
    */
  handleRequest(api) {
    if (api) {
      const next = api.time.next.value;
      const isOffline = next === "Offline";

      if (isOffline) this.emit('offline');

      /**
        * api was updated
        * @event Basic#updated
        * @param {Object} basic api
        */
      this.emit('updated', api);

      /**
        * Time to next update
        * @event Basic#nextUpdate
        * @param {Number} time to next update.
        */
      this.emit('nextUpdate', isOffline ? 10000 : next);

      this.sendRequest(isOffline ? 10000 : next * 1000);
    } else if (!this.time) this.sendRequest(this.requests > 10 ? 5000 : 0);

    if (this.requests === 10)
      this.emit('offline');

    this.requests = api ? 0 : this.requests + 1;
  }
};

export default Basic;
