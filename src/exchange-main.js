'use babel'

import {Disposable, CompositeDisposable} from 'sb-event-kit'
import Communication from 'sb-communication'

class Exchange {
  constructor(worker) {
    this.worker = worker
    this.port = worker.port || worker

    this.communication = new Communication()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.communication)

    const callback = message => {
      this.communication.parseMessage(message.data)
    }
    this.port.addEventListener('message', callback)
    this.subscriptions.add(new Disposable(() => {
      this.port.removeEventListener('message', callback)
    }))
    this.communication.onShouldSend(message => {
      this.port.postMessage(message)
    })

    this.onRequest('ping', function(_, message) {
      message.response = 'pong'
    })
    this.request('ping')
  }

  request(name, data = {}) {
    return this.communication.request(name, data)
  }

  onRequest(name, callback) {
    return this.communication.onRequest(name, callback)
  }

  terminate() {
    if (this.worker.terminate) {
      this.worker.terminate()
    } else {
      this.port.close()
    }
    this.dispose()
  }
  dispose() {
    this.subscriptions.dispose()
  }

  static create(filePath) {
    return new Exchange(new Worker(filePath))
  }
  static createShared(filePath) {
    const worker = new SharedWorker(filePath)
    const exchange = new Exchange(worker)
    worker.port.start()
    return exchange
  }
}

module.exports = Exchange
