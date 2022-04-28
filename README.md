# UiCallAnnotation
Annotation for Typescript Functions called by the UI

# Usage

For a function to use the UiCall Annotation, after the import the function needs to be extend by the Annotation and is required to start with "uicall_". 
An example for this structure is: 

```
  @UIBaseUserCalledFunction()
    uicall_function(){
  }
```
  
If the function is asynchronous this can be done by putting the async tag before the function name. 

```
  @UIBaseUserCalledFunction()
	  async uicall_function(){
  }
```
  
## Functions used in Multiple locations

An annotated function should only be called by a HTML Element. Functions that are also used in the Component need a seperate function that is called in the uicall_fun

```
  @UIBaseUserCalledFunction()
	uicall_function(){
    this.function()
  }
  
  function(){
  }
```
