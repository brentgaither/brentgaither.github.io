---
layout: post
title: C# Exception handling 
tags: [C#]
---


Errors happen in code so we need to deal with them in a way that will not confuse the user and we should give them useful feedback as to what happened. The "yellow screen" can be intimidating for a user especially because it includes the full stack trace. Here is a way to handle errors in an MVC application.


Lets first take a look at the custom controller we are going to use. This will replace the controller that your controllers inherit from because we want to change how exceptions are handled. This custom controller inherits from controller so we will override the onException method that controller already has. We should make sure that went do not give away too much information to the end user when we show errors. If you want we could change the logging for a special user or role.

```csharp
public class CustomController : Controller
{

    protected override void OnException(ExceptionContext filterContext)
    {
        Exception ex = filterContext.Exception;

        filterContext.ExceptionHandled = true;

        string innerException;
        if ((ex.InnerException) == null)
        {
            innerException = "No inner exception";
        }
        else
        {
            innerException = ex.InnerException.Message;
        }
        var errorId = ErrorLog.Log(ex); //We should log the errors to a file or a db.
        filterContext.Result = RedirectToAction("ErrorMessage", "Error",
        new { ErrorCode = ex.HResult, ErrorId = errorId});
        base.OnException(filterContext);
    }
}
```

The Error viewmodel...

```csharp
    public class ErrorViewModel
    {
        public int ErrorCode { get; set; }
        public int ErrorId { get; set; }
    }
```

The Error controller...

```csharp
public class ErrorController : CustomController
{
    [HttpGet]
    public ActionResult ErrorMessage(ErrorViewModel model)
    {
        return View(model);
    }
}
```


The Error view...
```html
@model Your.NameSpace.ErrorViewModel

<h1>Error.</h1>
@{
if (@Model != null)
{
    <h3>Oh no! Something went wrong. Please report this error to the site admin : @Model.ErrorCode</h3>
    <h4>ErrorId : @Model.ErrorId</h4>
}
else
{
    <h3>Excpetion was null</h3>
}
}
```

Using the customController...
```csharp
public class HomeController : CustomController
{
    public ActionResult Index()
    {
        return View();
    }
}
```
