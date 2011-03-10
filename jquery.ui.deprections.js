/**
 * Deprecation detection/logging for Happy jQueryUI 2.O Migrations!
 * @author Garrett Johnson 
 */

(function($) {
	if ( $.uiBackCompat !== false ) {
		
		$.uiDeprecations = (function () {
			
			var widgets = {};			
			
			function log ( widget, option ) {
				if ('console' in window) {
					console.warn( '$.ui.' + widget + ' -- ' + option + ' is deprecated.' );
				}
			}
			
			function enhanceWidget (widgetName) {
					var proto = $.ui[ widgetName ].prototype;
					
					if (proto._deprecatedOptions) return;
					
					var oldCreate = proto._create;
					var oldOption = proto._setOption;	
					var oldTrigger = proto._trigger;		

					$.extend(proto, {
						
						_deprecatedOptions: widgets[widgetName]['options'],
						_deprecatedEvents: widgets[widgetName]['events'],

						_isOptionDeprecated: function ( key ) {
							return this._deprecatedOptions.indexOf( key ) >= 0;
						},
						
						_isEventDeprecated: function ( key ) {
							return this._deprecatedEvents.indexOf( key ) >= 0;
						},
						
						_create: function () {
							// gotta be a better way to get passed in options before they are merged? 
							// it seems _getCreateOptions() is always returning undefined 
							var configuredOptions = arguments.callee.caller.arguments[ 0 ] || {};

							for ( var key in configuredOptions ) {
									if ( this._isOptionDeprecated( key ) ) {
										log( this.widgetName, key );
									}
							}
							return oldCreate.call( this );					
						},

						_setOption: function ( key, val ) {
							if ( this._isOptionDeprecated( key ) ) {
								log( this.widgetName, key );
							}
							return oldOption.call( this, key, val );
						},
						
						_trigger: function ( type, event, data) {
							if ( this._isEventDeprecated (type) ) {
								log ( this.widgetName, type );
							}
							return oldTrigger.apply( this, arguments);
						}
						
					});
			}
			
			function register ( widgetName, config ) {
				if ( !$.isPlainObject( config ) ) {
					throw new Error( 'deprecated config must be an object literal ({options:[], bindgins:[]}).' );	
				}	
				widgets[ widgetName ] = $.extend({}, { options:[], bindings:[] }, config);
				enhanceWidget( widgetName );
			}
	
			return {
				register: register
			};		
			
		})(); 
		
		// testing these out for now i reckon
		$.uiDeprecations.register('accordion', {
			options: ['navigation', 'navigationFilter', 'filledSpace', 'autoHeight', 'clearStyle', 'fillSpace', 'activeHeader', 'headerSelected', 'change', 'onchangestart'],
			events: ['change', 'changestart']															
		});
		
		
	} 
})( jQuery );