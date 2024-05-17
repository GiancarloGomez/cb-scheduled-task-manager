/**
 * ColdBox Scheduled Task Manager Module
 * fusedevelopments.com
 **/
component {

	// Module Properties
	this.title              = "Scheduled Task Manager";
	this.author             = "Giancarlo Gomez @ Fuse Developments, Inc.";
	this.webURL             = "";
	this.description        = "A module to manage ColdBox Scheduled Tasks in your applications.";
	this.version            = "0.0.1";
	// If true, looks for views in the parent first, if not found, then in the module. Else vice-versa
	this.viewParentLookup   = false;
	// If true, looks for layouts in the parent first, if not found, then in module. Else vice-versa
	this.layoutParentLookup = false;
	// Module Entry Point
	this.entryPoint         = "scheduled-task-manager";
	// Inherit Entry Point
	this.inheritEntryPoint  = false;
	// Model Namespace
	this.modelNamespace     = "scheduledTaskManager";
	// CF Mapping
	this.cfmapping          = "";
	// Auto-map models
	this.autoMapModels      = true;
	// Module Dependencies
	this.dependencies       = [];

	/**
	 * Configure the module
	 */
	function configure(){
		// parent settings
		parentSettings = {};

		// module settings - stored in modules.name.settings
		settings = {};

		// Layout Settings
		layoutSettings = { defaultLayout : "Main" };

		// Custom Declared Points
		interceptorSettings = { customInterceptionPoints : [] };

		// Custom Declared Interceptors
		interceptors = [];
	}

	/**
	 * Fired when the module is registered and activated.
	 */
	function onLoad(){
	}

	/**
	 * Fired when the module is unregistered and unloaded
	 */
	function onUnload(){
	}

}
