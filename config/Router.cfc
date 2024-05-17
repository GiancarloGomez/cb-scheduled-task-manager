/**
 * Module Router
 * https://coldbox.ortusbooks.com/the-basics/routing/routing-dsl
 */
component{

	function configure(){

		route( "/", "Main.index" );

		route( "/:action-regex:(task(delete|run|update))").to( "Main" );

	}

}
