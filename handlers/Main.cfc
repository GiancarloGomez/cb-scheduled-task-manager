component extends="coldbox.system.EventHandler" {

	property name="log"              inject="logbox:logger:{this}";
	property name="scheduler"        inject="appScheduler@coldbox";
	property name="schedulerService" inject="coldbox:schedulerService";

	function preHandler( event, rc, prc ){
		prc.isBoxLang = server.keyExists( "boxlang" );
	}

	function index( event, rc, prc ){
		prc.tasks = setTasks();
		prc.tasks.map( ( task ) => {
			task.lastResult = task.lastResult.isPresent() ?
								task.lastResult.get() :
								"";
		});
	}

	function taskDelete( event, rc, prc ){
		var response = { "success":false };
		var _scheduler = getSchedulerInstance( event, rc );

		if ( event.valueExists( "task" ) && _scheduler.hasTask( rc.task ) ){
			log.info( "DELETING TASK - " & rc.module & " - " & rc.task );
			// remove and return the tasks
			_scheduler.removeTask( rc.task );
			response["success"] = true;
			response["tasks"]   = setTasks();

			response["tasks"].map( ( task ) => {
				task.lastResult = task.lastResult.isPresent() ?
									task.lastResult.get() :
									"";
			});
		}

		event.renderData( data:response, type:"json" );
	}

	function taskRun( event, rc, prc ){
		var response   = { "success":false };
		var _scheduler = getSchedulerInstance( event, rc );

		try {
			if ( event.valueExists( "task" ) && _scheduler.hasTask( rc.task ) ){

				log.info( "FORCE RUNNING - " & rc.module & " - " & rc.task );

				var task = _scheduler.getTaskRecord( rc.task ).task;

				// force run it
				task.run( true );

				// return the task's stats
				response["stats"] = duplicate( task.getStats() );

				// temporarily fixes error in serialization for BoxLang
				response["stats"].delete("lastResult");

				response["success"] = true;
			}
		}
		catch ( any e ) {
			log.error( e.message );
			response["error"] = e;
		}

		event.renderData( data=response, type="json" );
	}

	function taskUpdate( event, rc, prc ){

		var response   = { "success":false };
		var _scheduler = getSchedulerInstance( event, rc );

		try {

			if ( event.valueExists( "task" ) && _scheduler.hasTask( rc.task ) ){
				response["disabled"] = ( rc.status ?: "" ) == "on" ? true : false;

				log.info( "UPDATING TASK - " & ( response["disabled"] ? "Disabling " : "Enabling " ) & rc.module & " - " & rc.task );

				var task = _scheduler.getTaskRecord( rc.task ).task;

				// if the status comes as "on" then disable the task
				response["success"] = true;

				if ( response["disabled"] )
					task.disable();
				else
					task.enable();

				if ( !task.getScheduled() && !task.isDisabled() )
					task.start();

				response["scheduled"] = task.getScheduled();
			}
		}
		catch ( any e ) {
			log.error( e.message );
			response["error"] = e;
		}

		event.renderData( data=response, type="json" );
	}

	private any function getSchedulerInstance( event, rc ) {
		return event.valueExists( "module" ) ?
				rc.module == "global" ?
				scheduler :
				schedulerService.getSchedulers()["cbScheduler@" & rc.module] :
				{};
	}

	private array function setTasks() {
		var task         = "";
		var obj          = {};
		var format       = "yyyy-MM-dd'T'HH:nn:ss'Z'";
		var tasks        = [];
		var taskNames    = "";
		var executorName = "";
		var schedulers   = schedulerService.getSchedulers();

		for ( var key in schedulers ){
			var _scheduler   = schedulers[key];
			var taskNames    = _scheduler.getRegisteredTasks();
			var executorName = _scheduler.getExecutor().getName().reReplace("coldbox\.system\.web\.tasks.|-scheduler","","all");
			var moduleName   =  key == "appScheduler@coldbox" ? "global" : key.replace("cbScheduler@","");


			for ( var taskName in taskNames ){
				task = _scheduler.getTaskRecord( taskName );

				obj  = {
					"id"               : moduleName &
										( len(task.task.getGroup()) ? "." & task.task.getGroup() : "" ) &
										"." & task.task.getName(),
					"group"            : task.task.getGroup(),
					"label"            : task.task.getName(),
					"module"           : moduleName,
					"name"             : taskName,
					"executor"         : executorName,
					"debugEnabled"     : task.task.getDebug(),
					"disabled"         : task.task.isDisabled(),
					"constrained"      : task.task.isConstrained(),
					"dayOfTheWeek"     : task.task.getDayOfTheWeek(),
					"dayOfTheMonth"    : task.task.getDayOfTheMonth(),
					"firstBusinessDay" : task.task.getFirstBusinessDay(),
					"lastBusinessDay"  : task.task.getLastBusinessDay(),
					"annually"         : task.task.getAnnually(),
					"weekends"         : task.task.getWeekends(),
					"weekdays"         : task.task.getWeekdays(),
					"error"            : task.error,
					"errorMessage"     : task.errorMessage,
					"period"           : task.task.getPeriod(),
					"timeUnit"         : task.task.getTimeUnit(),
					"startOn"          : task.task.getStartOnDateTime().toString(),
					"endOn"            : task.task.getEndOnDateTime().toString(),
					"startTime"        : task.task.getStartTime(),
					"endTime"          : task.task.getEndTime(),
					"meta"             : task.task.getMeta(),
					"canRun"           : !task.task.getEnvironments().len() || task.task.getEnvironments().find( getSetting( "environment" ) ) ? true : false
				};

				obj.append( task.task.getStats() );

				tasks.append( obj );
			}
		}

		tasks.each( (task) => {
			task.created = dateTimeFormat( dateConvert("local2UTC",task.created), format );

			if ( isDate(task.lastRun) )
				task.lastRun = dateTimeFormat( dateConvert("local2UTC",task.lastRun), format );

			if ( !isDate(task.startOn) )
				task.startOn = task.created;
			else
				task.startOn = dateTimeFormat( dateConvert("local2UTC",task.startOn), format );

			if ( isDate(task.endOn) )
				task.endOn = dateTimeFormat( dateConvert("local2UTC",task.endOn), format );

			if( isDate(task.nextRun) )
				task.nextRun = dateTimeFormat( dateConvert("local2UTC",task.nextRun), format );

			if ( !task.canRun || task.disabled )
				task.nextRun = "";
		});

		return tasks;
	}

}
