---
layout: post
title: C# Exception handling 
---
 
<html>
  <head>
    <meta charset='utf-8'>
    <meta http-equiv="X-UA-Compatible" content="chrome=1">
    <link href='https://fonts.googleapis.com/css?family=Chivo:900' rel='stylesheet' type='text/css'>
    <!--[if lt IE 9]>
    <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    <title>Brentgaither.GitHub.io by brentgaither</title>
  </head>

  <body>
    <div id="container">
      <div class="inner">

        <hr>

        <section id="main_content">

<p>Errors happen in code so we need to deal with them in a way that will not confuse the user and we should give them useful feedback as to what happened. The "yellow screen" can be intimidating for a user especially because it includes the full stack trace. Here is a way to handle errors in an MVC application.</p>


<p>Lets first take a look at the custom controller we are going to use. This will replace the controller that your controllers inherit from because we want to change how exceptions are handled. This custom controller inherits from controller so we will override the onException method that controller already has.</p>

  {% highlight Csharp %}
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
            filterContext.Result = RedirectToAction("ErrorMessage", "Error",
            new { code = ex.HResult, message = ex.Message, innerException = innerException });
            base.OnException(filterContext);
        }
    }
    {% endhighlight %}

    <p> The Error viewmodel... </p>

    {% highlight Csharp %}
        public class ErrorViewModel
        {
            public int ErrorCode { get; set; }
            public string Exception { get; set; }
            public string InnerException { get; set; }
        }
    {% endhighlight %}

    <p> The Error controller... </p>

    {% highlight Csharp %}
    public class ErrorController : CustomController
    {
        [HttpGet]
        public ActionResult ErrorMessage(ErrorViewModel model)
        {
            return View(model);
        }
    }
    {% endhighlight %}


      <p> The Error view... </p>
    {% highlight HTML %}
@model Your.NameSpace.ErrorViewModel

<h1>Error.</h1>
@{
    if (@Model != null)
    {
        <h3>Exception was : @Model.Exception</h3>
        <h3>Inner exception was : @Model.InnerException</h3>
        <h4>Exception number was : @Model.ErrorCode</h4>
    }
    else
    {
        <h3>Excpetion was null</h3>
    }
}
    {% endhighlight %}

     <p> Using the customController... </p>
    {% highlight Csharp %}
    public class HomeController : CustomController
    {
        public ActionResult Index()
        {
            return View();
        }
    }
    {% endhighlight %}
        </section>

      </div>
    </div>
  </body>
</html>
