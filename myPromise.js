// Implement chained calls to the promise.then method
class MyPromise {
  constructor(executor) {
    this.status = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.status === "pending") {
        this.status = "fulfilled";
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn(value));
      }
    };
    
    const reject = (reason) => {
      if (this.status === "pending") {
        this.status = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn(reason));
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected = typeof onRejected === "function" ? onRejected : reason => { throw reason; };
    
    const promise = new MyPromise((resolve, reject) => {
      const fulfilledHandler = (value) => {
        try {
          const result = onFulfilled(value);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      const rejectedHandler = (reason) => {
        try {
          const result = onRejected(reason);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      if (this.status === "fulfilled") {
        setTimeout(() => {
          fulfilledHandler(this.value);
        });
      } else if (this.status === "rejected") {
        setTimeout(() => {
          rejectedHandler(this.reason);
        });
      } else {
        this.onFulfilledCallbacks.push(fulfilledHandler);
        this.onRejectedCallbacks.push(rejectedHandler);
      }
    });
    
    return promise;
  }
  
  static resolve(value) {
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }
  
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }
}
