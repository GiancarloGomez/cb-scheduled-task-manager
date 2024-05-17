<cfoutput>
	<div class="container-fluid">
		<div class="sticky-top bg-white border-bottom py-3">
			<h1 class="h3 m-0 lh-1 d-flex align-items-end gap-2 lh-1">
				<span>
					Scheduled Tasks
					<span class="fw-light fs-6 text-secondary text-nowrap">
						ColdBox #getColdBoxSetting( "version" )#
					</span>
				</span>
				<span class="ms-auto fw-light fs-6 text-info-emphasis text-end">
					#server.keyExists("boxlang") ? "BoxLang" : server.coldfusion.productName#
					#
						server.keyExists("boxlang") ?
						server.boxlang.version :
						server.keyExists("lucee") ?
						server.lucee.version :
						server.coldfusion.productVersion
					#
				</span>
			</h1>
		</div>
		<table class="table align-middle" id="dt-tasks" style="width:100%;"></table>
	</div>
	<script>
		const tasks = #serializeJSON(prc.tasks)#
	</script>
</cfoutput>