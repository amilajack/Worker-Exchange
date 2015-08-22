

// @Compiler-Output "../Dist/Exchange.js"
// @Compiler-Transpile "true"
// @Compiler-Compress "true"
// @Compiler-Browserify "true"

const EventEmitter = require('zm-event-kit').Emitter
class Exchange extends EventEmitter{
  /**
   * Worker =  SharedWorker || Worker
   * Message = shape(Type => enum{Request, Broadcast, Reply}, SubType => ?string, Message => string)
   */
  constructor(Path, Type, Debug, DebugResponses){
    super()
    Type = Type || Exchange.NORMAL
    Debug = Boolean(Debug)
    DebugResponses = DebugResponses || false
    let IsNormal = Type === Exchange.NORMAL
    this.Worker = IsNormal ? new Worker(Path) : new SharedWorker(Path)
    this.Port = IsNormal ? this.Worker : this.Worker.port
    this.Port.addEventListener('message', function(e){
      let Data = e.data
      if(!Data || !Data.EXCHANGE) return // Ignore Non-Exchange Messages
      if(DebugResponses) console.debug(Data)
      if(Data.Type === 'Request'){
        Data.Result = null
        Me.emit(Data.SubType, Data.Message, Data)
        Me.emit('All', Data.Message, Data)
      } else if(Data.Type === 'Broadcast'){
        Me.emit(Data.SubType, Data.Message, Data)
        Me.emit('All', Data.Message, Data)
      } else if (Data.Type === 'Reply'){
        Me.emit(`JOB:${Data.ID}`, Data.Message)
      }
    })
    if(this.Port.start){
      this.Port.start()
    }
    this.on('error', function(Message){
      console.error(Message)
    })
    this.on('debug', function(Message){
      if(Debug) console.debug(Message)
    })
    this.Send('Start')
  }
  Send(Type, Message){
    Message = Message || ''
    this.Port.postMessage({Type: 'Broadcast', SubType: Type, Message: Message, EXCHANGE: true})
    return this
  }
  Request(Type, Message){
    Message = Message || ''
    let Me = this
    return new Promise(function(Resolve){
      let JobID = (Math.random().toString(36)+'00000000000000000').slice(2, 7+2)
      Me.once(`JOB:${JobID}`, Resolve)
      Me.Port.postMessage({Type: 'Request', SubType: Type, Message: Message, ID: JobID, EXCHANGE: true})
    })
  }
  Finished(Job){
    this.Port.postMessage({Type: 'Reply', ID: Job.ID, Message: Job.Result, EXCHANGE: true})
  }
  Terminate(){
    if(this.Type === Exchange.NORMAL){
      this.Worker.terminate()
    }
  }
}
Exchange.SHARED = 'SHARED'
Exchange.NORMAL = 'NORMAL'