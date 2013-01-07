/*!
 * VisualEditor user interface ListButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.ListButtonTool object.
 *
 * @abstract
 * @class
 * @extends ve.ui.ButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.ListButtonTool = function VeUiListButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.ButtonTool.call( this, toolbar );
};

/* Inheritance */

ve.inheritClass( ve.ui.ListButtonTool, ve.ui.ButtonTool );

/**
 * List style this button applies.
 *
 * @abstract
 * @static
 * @property
 * @type {string}
 */
ve.ui.ListButtonTool.static.style = '';

/* Methods */

/**
 * Responds to the button being clicked.
 *
 * @method
 */
ve.ui.ListButtonTool.prototype.onClick = function () {
	if ( !this.active ) {
		this.toolbar.surface.execute( 'list', 'wrap', this.constructor.static.style );
	} else {
		this.toolbar.surface.execute( 'list', 'unwrap' );
	}
};

/**
 * Responds to the toolbar state being updated.
 *
 * @method
 * @param {ve.dm.Node[]} nodes List of nodes covered by the current selection
 * @param {ve.AnnotationSet} full Annotations that cover all of the current selection
 * @param {ve.AnnotationSet} partial Annotations that cover some or all of the current selection
 */
ve.ui.ListButtonTool.prototype.onUpdateState = function ( nodes ) {
	var i, len,
		style = this.constructor.static.style,
		all = true;
	for ( i = 0, len = nodes.length; i < len; i++ ) {
		if ( !nodes[i].hasMatchingAncestor( 'list', { 'style': style } ) ) {
			all = false;
			break;
		}
	}
	this.setActive( all );
};
