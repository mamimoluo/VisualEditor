/*!
 * VisualEditor Linear Selection class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class
 * @extends ve.ce.Selection
 * @constructor
 * @param {ve.ce.Surface} surface
 * @param {ve.dm.Selection} model
 */
ve.ce.LinearSelection = function VeCeLinearSelection() {
	// Parent constructor
	ve.ce.LinearSelection.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ce.LinearSelection, ve.ce.Selection );

/* Static Properties */

ve.ce.LinearSelection.static.name = 'linear';

/* Method */

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.getSelectionRects = function () {
	var i, l, range, nativeRange, surfaceRect, focusedNode, rect,
		surface = this.getSurface(),
		rects = [],
		relativeRects = [];

	range = this.getModel().getRange();
	focusedNode = surface.getFocusedNode( range );

	if ( focusedNode ) {
		return focusedNode.getRects();
	}

	nativeRange = surface.getNativeRange( range );
	if ( !nativeRange ) {
		return null;
	}

	// Calling getClientRects sometimes fails:
	// * in Firefox on page load when the address bar is still focused
	// * in empty paragraphs
	try {
		rects = RangeFix.getClientRects( nativeRange );
		if ( !rects.length ) {
			throw new Error( 'getClientRects returned empty list' );
		}
	} catch ( e ) {
		rect = this.getNodeClientRectFromRange( nativeRange );
		if ( rect ) {
			rects = [ rect ];
		}
	}

	surfaceRect = surface.getSurface().getBoundingClientRect();
	if ( !rects || !surfaceRect ) {
		return null;
	}

	for ( i = 0, l = rects.length; i < l; i++ ) {
		relativeRects.push( ve.translateRect( rects[ i ], -surfaceRect.left, -surfaceRect.top ) );
	}
	return relativeRects;
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.getSelectionStartAndEndRects = function () {
	var range, focusedNode,
		surface = this.getSurface();

	range = this.getModel().getRange();
	focusedNode = surface.getFocusedNode( range );

	if ( focusedNode ) {
		return focusedNode.getStartAndEndRects();
	}

	return ve.getStartAndEndRects( this.getSelectionRects() );
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.getSelectionBoundingRect = function () {
	var range, nativeRange, boundingRect, surfaceRect, focusedNode,
		surface = this.getSurface();

	range = this.getModel().getRange();
	focusedNode = surface.getFocusedNode( range );

	if ( focusedNode ) {
		return focusedNode.getBoundingRect();
	}

	nativeRange = surface.getNativeRange( range );
	if ( !nativeRange ) {
		return null;
	}

	try {
		boundingRect = RangeFix.getBoundingClientRect( nativeRange );
		if ( !boundingRect ) {
			throw new Error( 'getBoundingClientRect returned null' );
		}
	} catch ( e ) {
		boundingRect = this.getNodeClientRectFromRange( nativeRange );
	}

	surfaceRect = surface.getSurface().getBoundingClientRect();
	if ( !boundingRect || !surfaceRect ) {
		return null;
	}
	return ve.translateRect( boundingRect, -surfaceRect.left, -surfaceRect.top );
};

/**
 * Get a client rect from the range's end node
 *
 * This function is used internally by getSelectionRects and
 * getSelectionBoundingRect as a fallback when Range.getClientRects
 * fails. The width is hard-coded to 0 as the function is used to
 * locate the selection focus position.
 *
 * @private
 * @param {ve.Range} range Range to get client rect for
 * @return {Object|null} ClientRect-like object
 */
ve.ce.LinearSelection.prototype.getNodeClientRectFromRange = function ( range ) {
	var rect, side, x, adjacentNode, unicornRect,
		node = range.endContainer,
		offset = range.endOffset,
		leftNode = offset > 0 && node.childNodes[ offset - 1 ];

	if ( leftNode && leftNode.nodeType === Node.ELEMENT_NODE && leftNode.classList.contains( 've-ce-nail' ) ) {
		node = leftNode;
	} else {
		while ( node && node.nodeType !== Node.ELEMENT_NODE ) {
			node = node.parentNode;
		}

		if ( !node ) {
			return null;
		}
	}

	// When possible, pretend the cursor is the left/right border of the node
	// (depending on directionality) as a fallback.

	// We would use getBoundingClientRect(), but in iOS7 that's relative to the
	// document rather than to the viewport
	rect = node.getClientRects()[ 0 ];
	if ( !rect ) {
		// FF can return null when focusNode is invisible
		return null;
	}

	side = this.getSurface().getModel().getDocument().getDir() === 'rtl' ? 'right' : 'left';
	adjacentNode = range.endContainer.childNodes[ range.endOffset ];
	if ( range.collapsed && $( adjacentNode ).hasClass( 've-ce-unicorn' ) ) {
		// We're next to a unicorn; use its left/right position
		unicornRect = adjacentNode.getClientRects()[ 0 ];
		if ( !unicornRect ) {
			return null;
		}
		x = unicornRect[ side ];
	} else {
		x = rect[ side ];
	}

	return {
		top: rect.top,
		bottom: rect.bottom,
		left: x,
		right: x,
		width: 0,
		height: rect.height
	};
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.isFocusedNode = function () {
	return !!this.getSurface().focusedNode;
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.isNativeCursor = function () {
	return !this.getSurface().focusedNode;
};

/* Registration */

ve.ce.selectionFactory.register( ve.ce.LinearSelection );
