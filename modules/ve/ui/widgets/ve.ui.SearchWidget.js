/*!
 * VisualEditor UserInterface SearchWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.SearchWidget object.
 *
 * @class
 * @extends ve.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {string|jQuery} [placeholder] Placeholder text for query input
 * @cfg {string} [value] Initial query value
 */
ve.ui.SearchWidget = function VeUiSearchWidget( config ) {
	// Configuration intialization
	config = config || {};

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Properties
	this.query = new ve.ui.TextInputWidget( {
		'$$': this.$$,
		'icon': 'search',
		'placeholder': config.placeholder,
		'value': config.value
	} );
	this.results = new ve.ui.SelectWidget( { '$$': this.$$ } );
	this.$query = this.$$( '<div>' );
	this.$results = this.$$( '<div>' );

	// Events
	this.query.connect( this, { 'change': 'onQueryChange', 'enter': [ 'emit', 'enter' ] } );
	this.results.connect( this, { 'select': 'onResultsSelect' } );
	this.query.$.on( 'keydown', ve.bind( this.onQueryKeydown, this ) );

	// Initialization
	this.$query
		.addClass( 've-ui-searchWidget-query' )
		.append( this.query.$ );
	this.$results
		.addClass( 've-ui-searchWidget-results' )
		.append( this.results.$ );
	this.$
		.addClass( 've-ui-searchWidget' )
		.append( this.$results, this.$query );
};

/* Inheritance */

ve.inheritClass( ve.ui.SearchWidget, ve.ui.Widget );

/* Events */

/**
 * @event select
 * @param {Object|null} item Item data or null if no item is selected
 */

/**
 * @event enter
 */

/* Methods */

/**
 * Handle query key down events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
ve.ui.SearchWidget.prototype.onQueryKeydown = function ( e ) {
	var selectedItem,
		dir = e.which === ve.Keys.DOWN ? 1 : ( e.which === ve.Keys.UP ? -1 : 0 );

	if ( dir ) {
		selectedItem = this.results.getSelectedItem();
		this.results.selectItem( this.results.getRelativeSelectableItem( selectedItem, dir ) );
	}
};

/**
 * Handle select widget select events.
 *
 * Clears existing results. Subclasses should repopulate items according to new query.
 *
 * @method
 * @param {string} value New value
 */
ve.ui.SearchWidget.prototype.onQueryChange = function () {
	// Reset
	this.results.clearItems();
};

/**
 * Handle select widget select events.
 *
 * @method
 * @param {ve.ui.OptionWidget} item Selected item
 * @emits select
 */
ve.ui.SearchWidget.prototype.onResultsSelect = function ( item ) {
	this.emit( 'select', item ? item.getData() : null );
};

/**
 * Get the query input.
 *
 * @method
 * @returns {ve.ui.TextInputWidget} Query input
 */
ve.ui.SearchWidget.prototype.getQuery = function () {
	return this.query;
};
