/*!
 * VisualEditor data model DefinitionListNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel node for a definition list.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.DefinitionListNode = function VeDmDefinitionListNode( children, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, 'definitionList', children, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.DefinitionListNode, ve.dm.BranchNode );

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @property
 */
ve.dm.DefinitionListNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'hasSignificantWhitespace': false,
	'childNodeTypes': ['definitionListItem'],
	'parentNodeTypes': null
};

/**
 * Node converters.
 *
 * @see ve.dm.Converter
 * @static
 * @property
 */
ve.dm.DefinitionListNode.converters = {
	'domElementTypes': ['dl'],
	'toDomElement': function () {
		return document.createElement( 'dl' );
	},
	'toDataElement': function () {
		return {
			'type': 'definitionList'
		};
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'definitionList', ve.dm.DefinitionListNode );
