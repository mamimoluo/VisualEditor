/*!
 * VisualEditor content editable PreformattedNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for preformatted content.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.PreformattedNode} model Model to observe
 */
ve.ce.PreformattedNode = function VeCePreformattedNode( model ) {
	// Parent constructor
	ve.ce.ContentBranchNode.call( this, 'preformatted', model, $( '<pre>' ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.PreformattedNode, ve.ce.ContentBranchNode );

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @property
 */
ve.ce.PreformattedNode.rules = {
	'canBeSplit': true
};

/* Registration */

ve.ce.nodeFactory.register( 'preformatted', ve.ce.PreformattedNode );
