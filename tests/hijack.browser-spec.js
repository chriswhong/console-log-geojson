import '../src/hijack.js';

describe('native', function() {
  beforeEach(function(){
    console.LOG_LEVEL = console.LOG_LEVELS.ANY
  })
  describe('signature', function(){
    it('should have a level', function(){
      expect(console.LOG_LEVEL).toBeDefined();
    });
    it('should have level constants', function(){
      expect(console.LOG_LEVELS.LOG).toBeDefined();
      expect(console.LOG_LEVELS.INFO).toBeDefined();
      expect(console.LOG_LEVELS.WARN).toBeDefined();
      expect(console.LOG_LEVELS.ERROR).toBeDefined();
      expect(console.LOG_LEVELS.BLARGH).toBeUndefined();
    });
  });
  describe('setting level', function() {
    it('should have a default level of any', function(){
      expect(console.LOG_LEVEL).toEqual('any');
    });
    it('should be able to set to new level constant', function() {
      expect(console.LOG_LEVEL).toEqual(console.LOG_LEVELS.ANY);
      console.LOG_LEVEL = console.LOG_LEVELS.WARN
      expect(console.LOG_LEVEL).toEqual(console.LOG_LEVELS.WARN);
    });
    it('should ignore invalid level setting', function() {
      expect(console.LOG_LEVEL).toEqual(console.LOG_LEVELS.ANY);
      console.LOG_LEVEL = 'blargh'
      expect(console.LOG_LEVEL).toEqual(console.LOG_LEVELS.ANY);
    });
  });

  describe('interception of log', function() {
    let methodName = 'console.log';
    it('should recieve logs as events', function(done){
      let fn = function(e){
        document.removeEventListener(methodName, fn);
        done();
      }
      document.addEventListener(methodName, fn);
      console.log('hi mom');
    });

    it('should recieve argument in event', function(done) {
      let message = 'hi mom';
      let fn = function(e){
        expect(e.detail.messages[0]).toEqual(message);
        document.removeEventListener(methodName, fn);
        done();
      }
      document.addEventListener(methodName, fn);
      console.log(message);
    });

    it('should recieve multiple arguments in event as array', function(done) {
      let messages = ['hi mom', 'howdy'];
      let fn = function(e){
        expect(e.detail.messages).toEqual(messages);
        document.removeEventListener(methodName, fn);
        done();
      }
      document.addEventListener(methodName, fn);
      console.log(messages[0], messages[1]);
    });

    it('event should includd own name', function(done) {
      let fn = function(e){
        expect(e.detail.type).toEqual(methodName);
        document.removeEventListener(methodName, fn);
        done();
      }
      document.addEventListener(methodName, fn);
      console.log('hello world');
    });
  });

  describe('muting', function(){
    it('should not call fn under specified log level', function(done){
      let methodName = 'console.log'
      console.LOG_LEVEL = console.LOG_LEVELS.ERROR

      let fn = function(e){
        expect(e.detail.type).toEqual(methodName);
        document.removeEventListener(methodName, fn);
        throw new Error('nope');
        done('should not be here');
      }
      document.addEventListener(methodName, fn);

      console.log('hello world');

      setTimeout(function(){
        document.removeEventListener(methodName, fn);
        done();
      }, 1500)
    })
  });

  // It catches, but not sure how to tell Jasmine about it:

  // describe('catch recursion', function(){
  //   it('should not call fn too many times', function(done){
  //     try {
  //       let methodName = 'console.log'
  //
  //       let fn = function(e){
  //         console.log('so fun!')
  //       }
  //       document.addEventListener(methodName, fn);
  //       console.log('hello world');
  //     } catch(e) {
  //       done();
  //     }
  //   })
  // });

  describe('restoring', function(){
    it('should restore methods back to native', function(done){
      let methodName = 'console.log'

      let fn = function(e){
        expect(e.detail.type).toEqual(methodName);
        document.removeEventListener(methodName, fn);
        throw new Error('nope');
        done('should not be here');
      }
      document.addEventListener(methodName, fn);

      console.log.restore();
      console.log('hello world');

      setTimeout(function(){
        document.removeEventListener(methodName, fn);
        done();
      }, 1500)
    })
  });

  describe('hijack', function(){
    it('should re-hijack a restored method', function(done){
      let methodName = 'console.log'

      let fn = function(e){
        expect(e.detail.type).toEqual(methodName);
        document.removeEventListener(methodName, fn);
        done();
      }
      document.addEventListener(methodName, fn);

      console.log.restore(); // we know it works b/c of prev tests
      console.log.hijack();
      console.log('hello world');
    })
  });

  describe('restore all', function() {
    let methods = ['log', 'info', 'warn', 'error'];
    it('console.restoreAll should stop notifying all listeners when called', function(done){
      let callbacks = methods.map((methodName)=>{
        let fn = function(e){
          document.removeEventListener('console.' + methodName, fn);
          throw new Error('get outta here');
          done('nope');
        }
        document.addEventListener('console.' + methodName, fn);
        return fn
      });

      console.restoreAll();
      methods.forEach((method)=>{console[method]('hello');});

      setTimeout(function(){
        methods.forEach((method, i)=>{
          document.removeEventListener('console.' + method, callbacks[i]);
        });
        done();
      }, 1500)
    })

    it('console.hijackAll should start notifying all listeners when called', function(done){
      let wasCalled = {};
      let callbacks = methods.map((methodName)=>{
        let fn = function(e){
          wasCalled[methodName] = true;
          document.removeEventListener('console.' + methodName, fn);
          done();
        }
        document.addEventListener('console.' + methodName, fn);
        return fn
      });

      console.hijackAll();
      methods.forEach((method)=>{console[method]('hello');});

      let failureTimeout = setTimeout(function(){
        throw new Error('shouldnt be here')
        done('nope');
      }, 1500);

      setTimeout(function(){
        methods.forEach(function(methodName){
          expect(wasCalled[methodName]).toEqual(true);
        });
        done();
      }, 500);
    })
  })

});
