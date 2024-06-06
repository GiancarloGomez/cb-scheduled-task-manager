<cfscript>
	prc.icon = server.keyExists("boxlang") ?
				"boxlang":
				server.keyExists("lucee") ?
				"lucee" :
				"acf";
	prc.version = getModuleConfig( event.getCurrentModule() ).version;
</cfscript>
<cfoutput> <!doctype html>
<html lang="en" class="#prc.htmlClass ?: ""#">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>#prc.title ?: "Scheduled Tasks"#</title>
	<meta name="author" content="Fuse Developments, Inc.">
	<meta name="description" content="Scheduled Tasks Management">
	<base href="#event.getHTMLBaseURL() & right(event.getModuleRoot(),-1)#/">
	<link rel="icon" href="includes/icon/#prc.icon#-icon.png">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
	<link rel="stylesheet" href="https://cdn.datatables.net/v/bs5/dt-2.0.7/fh-4.0.1/r-3.0.2/datatables.min.css">
	<link rel="stylesheet" href="includes/css/tasks.css?v=#prc.version#">
	<script src="https://kit.fontawesome.com/0a779b57cf.js" crossorigin="anonymous"></script>
</head>
<body class="#prc.bodyClass ?: ""#">
	#view()#
	<div id="toast-container" class="toast-container position-fixed bottom-0 end-0 p-3"></div>
	<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
	<script src="https://cdn.jsdelivr.net/npm/luxon@3.4.4/build/global/luxon.min.js" integrity="sha256-7NQm0bhvDJKosL8d+6ZgSi2LxZCIcA/TD087GLEBO9M=" crossorigin="anonymous"></script>
	<script src="https://cdn.jsdelivr.net/npm/javascript.validation@1.8.0/dist/validation.min.js" integrity="sha256-O6Ik/BHp6t0XI2X2slJSTZGxF4sev5/iv01iRExCcE4=" crossorigin="anonymous"></script>
	<script src="https://cdn.datatables.net/v/bs5/dt-2.0.7/fh-4.0.1/r-3.0.2/datatables.min.js"></script>
	<script>
		const entryPoint = '/#event.getModuleEntryPoint()#/';
	</script>
	<script src="includes/js/tasks.js?v=#prc.version#"></script>
</body>
</html>
</cfoutput>