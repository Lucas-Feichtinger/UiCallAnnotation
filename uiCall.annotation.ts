// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
// Annotation/Decorator for Methods calles by the UI/User
// Wrapping Try/Catch SingleCall RecallTimeout
//
// Using:
// @UIBaseUserCalledFunction()
// uicall_somefunktion() ...
//
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
var Flag_UICall_IsRunning : boolean = false
var Timeout_UICall_IsRunning : any = null // TIMEOUT
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
export function UIBaseUserCalledFunction(options?:{
		ignoreIsRunning?:boolean
})
{
	options = options ?? {}
	return function (
		targetClass: any,
		_propertyKey: string,
		descriptor: PropertyDescriptor
	) {
    // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
    let isAsync : boolean = false
    // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
    const showError = (err) => {
			console.log("UICallError:",err)
			//TODO: Display Error to User
    }
    // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
    const finalize = () => {
			// hide ladekreis
			Services.LoadingService.hideLoadingCirlce()
			Timeout_UICall_IsRunning = setTimeout(() => {
			 	Flag_UICall_IsRunning = false},150)
    }
    // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
		if(typeof(descriptor.value)!=="function") return
		const sourceFunc = descriptor.value
		// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
		if(_propertyKey.indexOf("uicall_")!==0){
			descriptor.value = function(...args:any[]){
				// TODO: ggf. fehler bei compiletime erzeugen
	      // Bsp: Functionname has to start with uicall_
			}
			return
		}
		// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
		descriptor.value = function(...args:any[]){
      try{
				// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
				if(Flag_UICall_IsRunning && !options.ignoreIsRunning) return
				Flag_UICall_IsRunning = true
				// WICHTIG: Timeout muss zurueckgesetzt werden
				clearTimeout(Timeout_UICall_IsRunning)
				// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
        const result = sourceFunc.apply(this,args)
				// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
        // test function result is asynchronously
        isAsync = result && result.then && typeof(result.then) === "function"
        if(isAsync){
          return new Promise((resolve, reject) => {
            result.then(val => {
              resolve(val)
            }).catch(err => {
              //reject(err)
							// TODO: ggf. spaeter den Fehler in das Log schreiben!?
              showError(err)
            }).finally(_=> {
              finalize()
            })
          })
        }else{
          return result
        }
    		// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
      }catch(err){
        showError(err)
      }finally{
        if(!isAsync){
          finalize()
        }
      }
		}
		// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
		return descriptor
	}
}
